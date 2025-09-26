import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/api';

// Types
interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'general' | 'department' | 'project' | 'private' | 'announcement';
  participants: string[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  lastActivity: string;
}

interface ChatMessage {
  _id: string;
  roomId: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system' | 'announcement';
  replyTo?: ChatMessage;
  mentions: string[];
  reactions: Array<{
    userId: string;
    emoji: string;
    timestamp: string;
  }>;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  roomId: string;
}

interface OnlineUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface ChatContextType {
  // Connection state
  isConnected: boolean;
  socket: Socket | null;
  
  // Chat rooms
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  
  // Messages
  messages: ChatMessage[];
  loadingMessages: boolean;
  
  // Online users
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  
  // Actions
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (content: string, replyTo?: string, mentions?: string[]) => void;
  markRoomAsRead: (roomId: string) => void;
  loadMoreMessages: () => void;
  createRoom: (roomData: CreateRoomData) => Promise<void>;
  searchMessages: (query: string, roomId?: string) => Promise<ChatMessage[]>;
  
  // UI state
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

interface CreateRoomData {
  name: string;
  description?: string;
  type: 'general' | 'department' | 'project' | 'private' | 'announcement';
  allowedRoles?: string[];
  participants?: string[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  console.log('🚀 ChatProvider initializing...');
  const { user, token } = useAuth();
  console.log('👤 User in ChatProvider:', user?.name || 'No user');
  console.log('🔑 Token in ChatProvider:', !!token);
  const socketRef = useRef<Socket | null>(null);
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  // Track current active room id in a ref to avoid stale closures in socket handlers
  const activeRoomIdRef = useRef<string | null>(null);

  // Normalize incoming message shape to what UI expects
  const normalizeMessage = (msg: any): ChatMessage => {
    if (!msg) return msg;
    const sender = msg.sender || {};
    const normalizedSender = sender && typeof sender === 'object'
      ? {
          _id: sender._id || sender.id,
          name: sender.name,
          email: sender.email,
          role: sender.role,
          department: sender.department,
        }
      : sender;

    const reply = msg.replyTo || msg.replyMessage; // server may send replyMessage
    const normalizedReply = reply
      ? {
          ...reply,
          sender: reply.sender && typeof reply.sender === 'object'
            ? { _id: reply.sender._id || reply.sender.id, name: reply.sender.name }
            : reply.sender,
        }
      : undefined;

    return {
      _id: String(msg._id),
      roomId: String(msg.roomId),
      sender: normalizedSender,
      content: msg.content,
      messageType: msg.messageType || 'text',
      replyTo: normalizedReply,
      mentions: (msg.mentions || []).map((m: any) => String(m)),
      reactions: msg.reactions || [],
      isEdited: !!msg.isEdited,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    } as ChatMessage;
  };

  // Initialize socket connection
  useEffect(() => {
    if (user && token && !socketRef.current) {
      console.log('🔄 Initializing chat connection for user:', user.name);
      console.log('🔑 Token exists:', !!token);
      console.log('🌐 Connecting to:', process.env.REACT_APP_API_URL || 'http://localhost:5000');
      
      // First, test if the API is reachable
      const testApiConnection = async () => {
        try {
          console.log('🧪 Testing API connectivity...');
          const response = await api.get('/chat/rooms');
          console.log('✅ API is reachable, rooms response:', response.data);
        } catch (error) {
          console.error('❌ API connectivity test failed:', error);
        }
      };
      
      testApiConnection();
      
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000
      });

      socketRef.current = socket;

      // Connection timeout fallback
      const connectionTimeout = setTimeout(() => {
        if (!socket.connected) {
          console.log('⏰ Socket connection timeout, falling back to API-only mode');
          setIsConnected(true); // Allow interface to work in API-only mode
          loadChatRooms();
        }
      }, 5000);

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Connected to chat server');
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        loadChatRooms();
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Chat connection error:', error);
        console.log('🔄 Trying fallback to API-only mode...');
        clearTimeout(connectionTimeout);
        setIsConnected(true); // Allow interface to work in API-only mode
        loadChatRooms();
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from chat server:', reason);
        setIsConnected(false);
      });

      socket.on('error', (error) => {
        console.error('Chat socket error:', error);
      });

      // Chat events
      socket.on('new-message', (message: any) => {
        const normalized = normalizeMessage(message);
        const currentActiveRoomId = activeRoomIdRef.current;
        // Only append if it's for the active room; otherwise just update last message for room list
        setMessages(prev => (currentActiveRoomId && normalized.roomId === currentActiveRoomId ? [...prev, normalized] : prev));
        updateRoomLastMessage(normalized);
      });

      socket.on('user-joined', (data) => {
        console.log(`👥 ${data.userName} joined the room`);
      });

      socket.on('user-left', (data) => {
        console.log(`👋 ${data.userName} left the room`);
      });

      socket.on('user-typing', (data: TypingUser) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId || u.roomId !== data.roomId);
          return [...filtered, data];
        });
      });

      socket.on('user-stopped-typing', (data: TypingUser) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId || u.roomId !== data.roomId));
      });

      socket.on('online-users', (data: { roomId: string; users: OnlineUser[] }) => {
        setOnlineUsers(data.users);
      });

      socket.on('mention-notification', (data) => {
        // Handle mention notifications
        console.log('📢 You were mentioned:', data);
      });

      return () => {
        clearTimeout(connectionTimeout);
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user, token]);

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      if (response.data.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  // Join a room
  const joinRoom = async (roomId: string) => {
    if (!socketRef.current) return;

    const room = rooms.find(r => r._id === roomId);
    if (!room) return;

    // Leave current room if any
    if (activeRoom) {
      socketRef.current.emit('leave-room', { roomId: activeRoom._id });
    }

  // Join new room
  socketRef.current.emit('join-room', { roomId });
  setActiveRoom(room);
  activeRoomIdRef.current = room._id;
    
    // Load messages for the room
    await loadRoomMessages(roomId);
  };

  // Leave a room
  const leaveRoom = (roomId: string) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('leave-room', { roomId });
    if (activeRoom?._id === roomId) {
      setActiveRoom(null);
      setMessages([]);
      activeRoomIdRef.current = null;
    }
  };

  // Load messages for a room
  const loadRoomMessages = async (roomId: string, page: number = 1) => {
    try {
      setLoadingMessages(true);
      const response = await api.get(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit: 50 }
      });
      
      if (response.data.success) {
        const { messages: newMessages, hasMore } = response.data.data;
        // API returns newest-first (desc). We want oldest-first (asc) in UI.
        const normalized = (newMessages || []).map((m: any) => normalizeMessage(m));
        const ascending = normalized.slice().reverse();
        if (page === 1) {
          // First page becomes ascending (oldest at top, newest at bottom)
          setMessages(ascending);
        } else {
          // Older pages should be prepended at the top (and already ascending within the page)
          setMessages(prev => [...ascending, ...prev]);
        }
        
        setHasMoreMessages(hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a message
  const sendMessage = async (content: string, replyTo?: string, mentions?: string[]) => {
    if (!activeRoom || !content.trim()) return;

    const trimmed = content.trim();
    const socket = socketRef.current;
    const isSocketConnected = !!(socket && socket.connected);

    // If socket is connected, emit; otherwise fallback to REST
    if (isSocketConnected) {
      socket!.emit('send-message', {
        roomId: activeRoom._id,
        content: trimmed,
        replyTo,
        mentions: mentions || []
      });
    } else {
      try {
        const response = await api.post(`/chat/rooms/${activeRoom._id}/messages`, {
          content: trimmed,
          replyTo,
          mentions: mentions || []
        });
        const saved = response.data?.data || response.data?.message || response.data; // be defensive
        if (saved) {
          const normalized = normalizeMessage(saved);
          setMessages(prev => [...prev, normalized]);
          updateRoomLastMessage(normalized);
        } else {
          // As a fallback, reload messages
          await loadRoomMessages(activeRoom._id, 1);
        }
      } catch (err) {
        console.error('Error sending message via API fallback:', err);
      }
    }
  };

  // Mark room as read
  const markRoomAsRead = async (roomId: string) => {
    try {
      if (socketRef.current) {
        socketRef.current.emit('room-read', { roomId });
      }
      
      await api.put(`/chat/rooms/${roomId}/read`);
      
      // Update room unread count
      setRooms(prev => prev.map(room => 
        room._id === roomId ? { ...room, unreadCount: 0 } : room
      ));
    } catch (error) {
      console.error('Error marking room as read:', error);
    }
  };

  // Load more messages
  const loadMoreMessages = () => {
    if (activeRoom && hasMoreMessages && !loadingMessages) {
      loadRoomMessages(activeRoom._id, currentPage + 1);
    }
  };

  // Create a new room
  const createRoom = async (roomData: CreateRoomData) => {
    try {
      const response = await api.post('/chat/rooms', roomData);
      if (response.data.success) {
        await loadChatRooms(); // Reload rooms
        return response.data.data;
      }
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Search messages
  const searchMessages = async (query: string, roomId?: string): Promise<ChatMessage[]> => {
    try {
      const response = await api.get('/chat/search', {
        params: { q: query, roomId, limit: 20 }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  };

  // Helper function to update room's last message
  const updateRoomLastMessage = (message: ChatMessage) => {
    const currentActiveRoomId = activeRoomIdRef.current;
    setRooms(prev => prev.map(room => {
      if (room._id === message.roomId) {
        return {
          ...room,
          lastMessage: message,
          lastActivity: message.createdAt,
          unreadCount: currentActiveRoomId === room._id ? 0 : (room.unreadCount + 1)
        };
      }
      return room;
    }));
  };

  const contextValue: ChatContextType = {
    isConnected,
    socket: socketRef.current,
    rooms,
    activeRoom,
    messages,
    loadingMessages,
    onlineUsers,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    markRoomAsRead,
    loadMoreMessages,
    createRoom,
    searchMessages,
    isChatOpen,
    setIsChatOpen
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
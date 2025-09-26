import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ChatService from '../services/ChatService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

interface TypingData {
  roomId: string;
  userName: string;
}

interface JoinRoomData {
  roomId: string;
}

interface SendMessageData {
  roomId: string;
  content: string;
  messageType?: 'text' | 'file' | 'image';
  replyTo?: string;
  mentions?: string[];
}

export class SocketService {
  private io: SocketIOServer;
  private onlineUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of socketIds
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private typingUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        console.log('🔍 Socket authentication attempt...');
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          console.error('❌ No token provided in socket handshake');
          throw new Error('No token provided');
        }

        console.log('🔑 Token found, verifying...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          console.error('❌ User not found for token');
          throw new Error('User not found');
        }

        console.log('✅ Socket authenticated for user:', user.name);
        socket.userId = user._id.toString();
        socket.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        };

        next();
      } catch (error) {
        console.error('❌ Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ User ${socket.user?.name} connected to chat (${socket.id})`);
      
      // Store user socket mapping
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
      }

      // Join room event
      socket.on('join-room', async (data: JoinRoomData) => {
        try {
          const { roomId } = data;
          
          // Verify user can access room
          const rooms = await ChatService.getUserChatRooms(socket.userId!);
          const hasAccess = rooms.some(room => room._id.toString() === roomId);
          
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to this room' });
            return;
          }

          // Join the room
          socket.join(roomId);
          
          // Track online users
          if (!this.onlineUsers.has(roomId)) {
            this.onlineUsers.set(roomId, new Set());
          }
          this.onlineUsers.get(roomId)!.add(socket.id);

          // Notify room about user joining
          socket.to(roomId).emit('user-joined', {
            userId: socket.userId,
            userName: socket.user?.name,
            timestamp: new Date()
          });

          // Send online users list to the joining user
          const onlineUsers = await ChatService.getRoomOnlineUsers(roomId);
          socket.emit('online-users', { roomId, users: onlineUsers });

          console.log(`👥 User ${socket.user?.name} joined room ${roomId}`);
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Leave room event
      socket.on('leave-room', (data: JoinRoomData) => {
        const { roomId } = data;
        
        socket.leave(roomId);
        
        // Remove from online users
        if (this.onlineUsers.has(roomId)) {
          this.onlineUsers.get(roomId)!.delete(socket.id);
          if (this.onlineUsers.get(roomId)!.size === 0) {
            this.onlineUsers.delete(roomId);
          }
        }

        // Remove from typing users
        if (this.typingUsers.has(roomId)) {
          this.typingUsers.get(roomId)!.delete(socket.userId!);
        }

        // Notify room about user leaving
        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.user?.name,
          timestamp: new Date()
        });

        console.log(`👋 User ${socket.user?.name} left room ${roomId}`);
      });

      // Send message event
      socket.on('send-message', async (data: SendMessageData) => {
        try {
          const messageData = {
            roomId: data.roomId,
            content: data.content,
            messageType: data.messageType || 'text',
            replyTo: data.replyTo,
            mentions: data.mentions
          };

          // Save message to database
          const message = await ChatService.sendMessage(socket.userId!, messageData);

          // Re-fetch a lean, fully-populated version to guarantee a consistent shape for the client
          const populatedMessage = await (await import('../models/Chat')).ChatMessage
            .findById(message._id)
            .populate('sender', 'name email role department')
            .lean();

          if (!populatedMessage) {
            throw new Error('Failed to load saved message for broadcast');
          }

          // Optionally populate replyTo minimal fields
          let replyToPayload: any = undefined;
          if (populatedMessage.replyTo) {
            const reply = await (await import('../models/Chat')).ChatMessage
              .findById(populatedMessage.replyTo)
              .populate('sender', 'name email')
              .select('content sender createdAt')
              .lean();
            if (reply) {
              replyToPayload = {
                _id: reply._id?.toString?.() || reply._id,
                content: reply.content,
                createdAt: reply.createdAt,
                sender: reply.sender && typeof reply.sender === 'object'
                  ? { _id: (reply.sender as any)._id?.toString?.() || (reply.sender as any)._id, name: (reply.sender as any).name }
                  : undefined
              };
            }
          }

          // Prepare message for broadcasting with normalized IDs and sender shape
          const senderObj = populatedMessage.sender && typeof populatedMessage.sender === 'object'
            ? {
                _id: (populatedMessage.sender as any)._id?.toString?.() || (populatedMessage.sender as any)._id,
                name: (populatedMessage.sender as any).name,
                email: (populatedMessage.sender as any).email,
                role: (populatedMessage.sender as any).role,
                department: (populatedMessage.sender as any).department
              }
            : (socket.user
                ? {
                    _id: socket.user.id,
                    name: socket.user.name,
                    email: socket.user.email,
                    role: socket.user.role,
                    department: socket.user.department
                  }
                : undefined);

          const messageForBroadcast = {
            _id: populatedMessage._id?.toString?.() || populatedMessage._id,
            content: populatedMessage.content,
            messageType: populatedMessage.messageType,
            roomId: populatedMessage.roomId?.toString?.() || populatedMessage.roomId,
            sender: senderObj,
            replyTo: replyToPayload,
            mentions: (populatedMessage.mentions || []).map((m: any) => m?.toString?.() || m),
            attachments: populatedMessage.attachments || [],
            reactions: populatedMessage.reactions || [],
            isEdited: populatedMessage.isEdited || false,
            createdAt: populatedMessage.createdAt,
            updatedAt: populatedMessage.updatedAt
          };

          // Broadcast message to room (including sender)
          this.io.to(data.roomId).emit('new-message', messageForBroadcast);

          // Also send to sender in case they're not in the room yet
          socket.emit('new-message', messageForBroadcast);

          // Send notifications to mentioned users
          if (data.mentions && data.mentions.length > 0) {
            data.mentions.forEach(mentionedUserId => {
              const mentionedSocketId = this.userSockets.get(mentionedUserId);
              if (mentionedSocketId) {
                this.io.to(mentionedSocketId).emit('mention-notification', {
                  message: messageForBroadcast,
                  mentionedBy: senderObj,
                  roomId: data.roomId
                });
              }
            });
          }

          console.log(`💬 Message saved and broadcast by ${socket.user?.name} in room ${data.roomId} ->`, messageForBroadcast._id);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Typing indicator events
      socket.on('typing-start', (data: TypingData) => {
        const { roomId } = data;
        
        if (!this.typingUsers.has(roomId)) {
          this.typingUsers.set(roomId, new Set());
        }
        this.typingUsers.get(roomId)!.add(socket.userId!);

        // Broadcast typing to other users in room
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          userName: socket.user?.name,
          roomId
        });
      });

      socket.on('typing-stop', (data: TypingData) => {
        const { roomId } = data;
        
        if (this.typingUsers.has(roomId)) {
          this.typingUsers.get(roomId)!.delete(socket.userId!);
        }

        // Broadcast stop typing to other users in room
        socket.to(roomId).emit('user-stopped-typing', {
          userId: socket.userId,
          userName: socket.user?.name,
          roomId
        });
      });

      // Message read event
      socket.on('message-read', async (data: { messageId: string; roomId: string }) => {
        try {
          await ChatService.markMessageAsRead(socket.userId!, data.messageId);
          
          // Notify sender that message was read
          socket.to(data.roomId).emit('message-read-receipt', {
            messageId: data.messageId,
            readBy: socket.user,
            readAt: new Date()
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Room read event
      socket.on('room-read', async (data: { roomId: string }) => {
        try {
          await ChatService.markRoomAsRead(socket.userId!, data.roomId);
          
          // Notify other users in room
          socket.to(data.roomId).emit('room-read-receipt', {
            roomId: data.roomId,
            readBy: socket.user,
            readAt: new Date()
          });
        } catch (error) {
          console.error('Error marking room as read:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`❌ User ${socket.user?.name} disconnected from chat`);
        
        // Remove from all tracking maps
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          
          // Remove from all rooms' online users
          this.onlineUsers.forEach((users, roomId) => {
            if (users.has(socket.id)) {
              users.delete(socket.id);
              
              // Notify room about user going offline
              socket.to(roomId).emit('user-offline', {
                userId: socket.userId,
                userName: socket.user?.name,
                timestamp: new Date()
              });

              if (users.size === 0) {
                this.onlineUsers.delete(roomId);
              }
            }
          });

          // Remove from typing users
          this.typingUsers.forEach((users, roomId) => {
            if (users.has(socket.userId!)) {
              users.delete(socket.userId!);
              socket.to(roomId).emit('user-stopped-typing', {
                userId: socket.userId,
                userName: socket.user?.name,
                roomId
              });
            }
          });
        }
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  // Public method to send notifications
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Public method to broadcast to room
  public broadcastToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  // Get online users count
  public getOnlineUsersCount(roomId: string): number {
    return this.onlineUsers.get(roomId)?.size || 0;
  }

  // Get total connected users
  public getTotalConnectedUsers(): number {
    return this.userSockets.size;
  }
}

let socketService: SocketService;

export const initializeSocket = (server: HTTPServer): SocketService => {
  socketService = new SocketService(server);
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
};

export default SocketService;
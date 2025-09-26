import mongoose from 'mongoose';
import { ChatRoom, ChatMessage, ChatParticipant, IChatRoom, IChatMessage, IChatParticipant } from '../models/Chat';
import User from '../models/User';

export interface CreateRoomData {
  name: string;
  description?: string;
  type: 'general' | 'department' | 'project' | 'private' | 'announcement';
  allowedRoles?: string[];
  participants?: string[];
  settings?: {
    allowFileSharing?: boolean;
    allowGuestMessages?: boolean;
    retentionDays?: number;
    maxMembers?: number;
  };
}

export interface SendMessageData {
  roomId: string;
  content: string;
  messageType?: 'text' | 'file' | 'image' | 'system' | 'announcement';
  replyTo?: string;
  mentions?: string[];
  attachments?: Array<{
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimetype: string;
  }>;
}

export class ChatService {
  /**
   * Create a new chat room
   */
  async createChatRoom(userId: string, roomData: CreateRoomData): Promise<IChatRoom> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has permission to create rooms
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new Error('You do not have permission to create chat rooms');
    }

    // Create the room
    const room = await ChatRoom.create({
      ...roomData,
      participants: roomData.participants || [userId],
      admins: [userId],
      createdBy: userId,
      isActive: true,
      messageCount: 0,
      lastActivity: new Date(),
      settings: {
        allowFileSharing: true,
        allowGuestMessages: false,
        retentionDays: 365,
        maxMembers: 100,
        ...roomData.settings
      }
    });

    // Create participant records
    const participantRecords = room.participants.map(participantId => ({
      userId: participantId,
      roomId: room._id,
      role: participantId.toString() === userId ? 'admin' : 'member',
      joinedAt: new Date(),
      lastSeenAt: new Date(),
      isActive: true,
      isMuted: false,
      settings: {
        notifications: true,
        soundEnabled: true,
        showTyping: true
      }
    }));

    await ChatParticipant.insertMany(participantRecords);

    return room;
  }

  /**
   * Send a message to a chat room
   */
  async sendMessage(userId: string, messageData: SendMessageData): Promise<IChatMessage> {
    console.log('[ChatService] sendMessage called', {
      userId,
      roomId: messageData.roomId,
      contentPreview: (messageData.content || '').slice(0, 50),
      hasReplyTo: !!messageData.replyTo,
      mentionsCount: (messageData.mentions || []).length
    });

    const user = await User.findById(userId);
    if (!user) {
      console.error('[ChatService] sendMessage - User not found', { userId });
      throw new Error('User not found');
    }

    // Check if user has access to this room
    const hasAccess = await this.canUserAccessRoom(userId, messageData.roomId);
    if (!hasAccess) {
      console.error('[ChatService] sendMessage - Access denied', { userId, roomId: messageData.roomId });
      throw new Error('You do not have access to this room');
    }

    // Create the message
    let message: IChatMessage;
    try {
      message = await ChatMessage.create({
        ...messageData,
        sender: userId,
        isEdited: false,
        isDeleted: false,
        reactions: [],
        readBy: [{ userId, readAt: new Date() }]
      });
    } catch (err) {
      console.error('[ChatService] sendMessage - Error creating ChatMessage', err);
      throw err;
    }

    // Populate sender information
    await message.populate('sender', 'name email role department');
    console.log('[ChatService] sendMessage - Message saved', { messageId: message._id?.toString?.(), roomId: message.roomId?.toString?.() });
    
    // If replying to a message, manually populate that
    if (messageData.replyTo) {
      const replyMessage = await ChatMessage.findById(messageData.replyTo)
        .populate('sender', 'name email')
        .select('content sender createdAt')
        .lean();
      (message as any).replyMessage = replyMessage;
    }

    // Update participant's last seen for sender
    await ChatParticipant.findOneAndUpdate(
      { userId, roomId: messageData.roomId },
      { $set: { lastSeenAt: new Date() } },
      { upsert: true }
    );

    // Note: Broadcasting is handled by SocketService to avoid conflicts

    return message;
  }

  /**
   * Get messages from a chat room with pagination
   */
  async getRoomMessages(
    userId: string, 
    roomId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{
    messages: IChatMessage[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
  }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has access to this room
    const hasAccess = await this.canUserAccessRoom(userId, roomId);
    if (!hasAccess) {
      throw new Error('You do not have access to this room');
    }

    const skip = (page - 1) * limit;

    // Get messages with sender populate only (replyTo will be handled manually if needed)
    const messages = await ChatMessage.find({
      roomId,
      isDeleted: false
    })
    .populate('sender', 'name email role department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Manually populate reply messages if needed
    for (const message of messages) {
      if (message.replyTo) {
        const replyMessage = await ChatMessage.findById(message.replyTo)
          .populate('sender', 'name email')
          .select('content sender createdAt')
          .lean();
        (message as any).replyMessage = replyMessage;
      }
    }

    const totalCount = await ChatMessage.countDocuments({
      roomId,
      isDeleted: false
    });

    const hasMore = totalCount > page * limit;

    return {
      messages,
      totalCount,
      hasMore,
      currentPage: page
    };
  }

  /**
   * Get user's accessible chat rooms
   */
  async getUserChatRooms(userId: string): Promise<IChatRoom[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get rooms where user is a participant
    const participantRooms = await ChatParticipant.find({
      userId,
      isActive: true
    }).populate('roomId');

    const roomIds = participantRooms.map(p => p.roomId);
    
    // Also get rooms where user has role-based access
    const roleBasedRooms = await ChatRoom.find({
      allowedRoles: { $in: [user.role] },
      isActive: true,
      _id: { $nin: roomIds }
    });

    const allRooms = [...roomIds, ...roleBasedRooms];

    // Get room details with last message and unread count
    const rooms = await Promise.all(
      allRooms.map(async (room: any) => {
        const roomData = room._id ? room : await ChatRoom.findById(room);
        
        // Get last message
        const lastMessage = await ChatMessage.findOne({
          roomId: roomData._id,
          isDeleted: false
        })
        .populate('sender', 'name')
        .sort({ createdAt: -1 })
        .lean();

        // Get unread count
        const participant = await ChatParticipant.findOne({
          userId,
          roomId: roomData._id
        });

        const lastSeenAt = participant?.lastSeenAt || new Date(0);
        const unreadCount = await ChatMessage.countDocuments({
          roomId: roomData._id,
          isDeleted: false,
          createdAt: { $gt: lastSeenAt }
        });

        return {
          ...roomData.toObject(),
          lastMessage,
          unreadCount
        };
      })
    );

    return rooms.filter(room => room !== null);
  }

  /**
   * Mark a room as read for a user
   */
  async markRoomAsRead(userId: string, roomId: string): Promise<void> {
    await ChatParticipant.findOneAndUpdate(
      { userId, roomId },
      { 
        $set: { 
          lastSeenAt: new Date() 
        } 
      },
      { upsert: true }
    );
  }

  /**
   * Mark a specific message as read for a user
   */
  async markMessageAsRead(userId: string, messageId: string): Promise<void> {
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user has access to this room
    const hasAccess = await this.canUserAccessRoom(userId, message.roomId.toString());
    if (!hasAccess) {
      throw new Error('You do not have access to this room');
    }

    // Add user to readBy array if not already there
    const existingRead = message.readBy.find(r => r.userId.toString() === userId);
    if (!existingRead) {
      message.readBy.push({ userId: new mongoose.Types.ObjectId(userId), readAt: new Date() });
      await message.save();
    }

    // Update participant's last seen as well
    await ChatParticipant.findOneAndUpdate(
      { userId, roomId: message.roomId },
      { $set: { lastSeenAt: new Date() } },
      { upsert: true }
    );
  }

  /**
   * Search messages across accessible rooms
   */
  async searchMessages(
    userId: string,
    query: string,
    roomId?: string,
    limit: number = 20
  ): Promise<IChatMessage[]> {
    // Get accessible rooms
    const accessibleRooms = await this.getUserAccessibleRooms(userId);
    const roomIds = roomId ? [roomId] : accessibleRooms.map(room => room._id);

    let messages;
    try {
      // Try text search first
      messages = await ChatMessage.find({
        roomId: { $in: roomIds },
        isDeleted: false,
        $text: { $search: query }
      })
      .populate('sender', 'name email role')
      .populate('roomId', 'name type')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    } catch (textSearchError) {
      console.warn('Text search failed, falling back to regex search:', textSearchError.message);
      
      // Fallback to regex search if text index is not available
      messages = await ChatMessage.find({
        roomId: { $in: roomIds },
        isDeleted: false,
        content: { $regex: query, $options: 'i' }
      })
      .populate('sender', 'name email role')
      .populate('roomId', 'name type')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    }

    return messages;
  }

  /**
   * Get online users in a room
   */
  async getRoomOnlineUsers(roomId: string): Promise<any[]> {
    const participants = await ChatParticipant.find({
      roomId,
      isActive: true,
      lastSeenAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    })
    .populate('userId', 'name email role department')
    .lean();

    return participants.map(p => p.userId);
  }

  /**
   * Check if user can access a room
   */
  async canUserAccessRoom(userId: string, roomId: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    const room = await ChatRoom.findById(roomId);
    if (!room || !room.isActive) return false;

    // Check if user is a participant
    const isParticipant = await ChatParticipant.findOne({
      userId,
      roomId,
      isActive: true
    });

    if (isParticipant) return true;

    // Check role-based access
    if (room.allowedRoles && room.allowedRoles.includes(user.role)) {
      return true;
    }

    return false;
  }

  /**
   * Get user's accessible rooms (helper method)
   */
  private async getUserAccessibleRooms(userId: string): Promise<IChatRoom[]> {
    const user = await User.findById(userId);
    if (!user) return [];

    // Get participant room IDs first
    const participantRoomIds = await ChatParticipant.find({
      userId,
      isActive: true
    }).distinct('roomId');

    // Get all accessible rooms
    const allRooms = await ChatRoom.find({
      $or: [
        { _id: { $in: participantRoomIds } },
        { allowedRoles: { $in: [user.role] } }
      ],
      isActive: true
    });

    return allRooms;
  }

  /**
   * Join a room
   */
  async joinRoom(userId: string, roomId: string): Promise<void> {
    const hasAccess = await this.canUserAccessRoom(userId, roomId);
    if (!hasAccess) {
      throw new Error('You do not have access to this room');
    }

    // Add user as participant if not already
    await ChatParticipant.findOneAndUpdate(
      { userId, roomId },
      {
        $set: {
          isActive: true,
          joinedAt: new Date(),
          lastSeenAt: new Date()
        }
      },
      { upsert: true }
    );

    // Add to room participants if not already there
    await ChatRoom.findByIdAndUpdate(
      roomId,
      { $addToSet: { participants: userId } }
    );
  }

  /**
   * Join a chat room (alias for joinRoom)
   */
  async joinChatRoom(userId: string, roomId: string): Promise<void> {
    return this.joinRoom(userId, roomId);
  }

  /**
   * Leave a room
   */
  async leaveRoom(userId: string, roomId: string): Promise<void> {
    // Remove from participants
    await ChatParticipant.findOneAndUpdate(
      { userId, roomId },
      { $set: { isActive: false } }
    );

    // Remove from room participants
    await ChatRoom.findByIdAndUpdate(
      roomId,
      { $pull: { participants: userId } }
    );
  }

  /**
   * Leave a chat room (alias for leaveRoom)
   */
  async leaveChatRoom(userId: string, roomId: string): Promise<void> {
    return this.leaveRoom(userId, roomId);
  }

  /**
   * Get chat statistics
   */
  async getChatStatistics(): Promise<{
    totalRooms: number;
    totalMessages: number;
    totalParticipants: number;
    activeRooms: number;
    recentActivity: {
      dailyMessages: number;
      weeklyMessages: number;
      monthlyMessages: number;
    };
  }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRooms,
      totalMessages,
      totalParticipants,
      activeRooms,
      dailyMessages,
      weeklyMessages,
      monthlyMessages
    ] = await Promise.all([
      ChatRoom.countDocuments({ isActive: true }),
      ChatMessage.countDocuments({ isDeleted: false }),
      ChatParticipant.countDocuments({ isActive: true }),
      ChatRoom.countDocuments({ 
        isActive: true, 
        lastActivity: { $gt: oneWeekAgo } 
      }),
      ChatMessage.countDocuments({ 
        isDeleted: false, 
        createdAt: { $gt: oneDayAgo } 
      }),
      ChatMessage.countDocuments({ 
        isDeleted: false, 
        createdAt: { $gt: oneWeekAgo } 
      }),
      ChatMessage.countDocuments({ 
        isDeleted: false, 
        createdAt: { $gt: oneMonthAgo } 
      })
    ]);

    return {
      totalRooms,
      totalMessages,
      totalParticipants,
      activeRooms,
      recentActivity: {
        dailyMessages,
        weeklyMessages,
        monthlyMessages
      }
    };
  }
}

export default new ChatService();
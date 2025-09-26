import { Request, Response } from 'express';
import ChatService, { CreateRoomData, SendMessageData } from '../services/ChatService';
import { AuthRequest } from '../middleware/auth';

export interface ChatRequest extends AuthRequest {
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
}

/**
 * @desc    Get user's chat rooms
 * @route   GET /api/chat/rooms
 * @access  Private
 */
export const getUserChatRooms = async (req: ChatRequest, res: Response) => {
  try {
    const rooms = await ChatService.getUserChatRooms(req.user.id);
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error: any) {
    console.error('Error fetching user chat rooms:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching chat rooms'
    });
  }
};

/**
 * @desc    Create a new chat room
 * @route   POST /api/chat/rooms
 * @access  Private
 */
export const createChatRoom = async (req: ChatRequest, res: Response) => {
  try {
    const roomData: CreateRoomData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type || 'general',
      allowedRoles: req.body.allowedRoles,
      participants: req.body.participants,
      settings: req.body.settings
    };

    const room = await ChatService.createChatRoom(req.user.id, roomData);
    
    res.status(201).json({
      success: true,
      data: room,
      message: 'Chat room created successfully'
    });
  } catch (error: any) {
    console.error('Error creating chat room:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating chat room'
    });
  }
};

/**
 * @desc    Join a chat room
 * @route   POST /api/chat/rooms/:roomId/join
 * @access  Private
 */
export const joinChatRoom = async (req: ChatRequest, res: Response) => {
  try {
    await ChatService.joinChatRoom(req.user.id, req.params.roomId);
    
    res.json({
      success: true,
      message: 'Successfully joined chat room'
    });
  } catch (error: any) {
    console.error('Error joining chat room:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error joining chat room'
    });
  }
};

/**
 * @desc    Leave a chat room
 * @route   POST /api/chat/rooms/:roomId/leave
 * @access  Private
 */
export const leaveChatRoom = async (req: ChatRequest, res: Response) => {
  try {
    await ChatService.leaveChatRoom(req.user.id, req.params.roomId);
    
    res.json({
      success: true,
      message: 'Successfully left chat room'
    });
  } catch (error: any) {
    console.error('Error leaving chat room:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error leaving chat room'
    });
  }
};

/**
 * @desc    Get messages from a chat room
 * @route   GET /api/chat/rooms/:roomId/messages
 * @access  Private
 */
export const getRoomMessages = async (req: ChatRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await ChatService.getRoomMessages(
      req.user.id, 
      req.params.roomId, 
      page, 
      limit
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching room messages:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error fetching messages'
    });
  }
};

/**
 * @desc    Send a message to a chat room
 * @route   POST /api/chat/rooms/:roomId/messages
 * @access  Private
 */
export const sendMessage = async (req: ChatRequest, res: Response) => {
  try {
    const messageData: SendMessageData = {
      roomId: req.params.roomId,
      content: req.body.content,
      messageType: req.body.messageType,
      replyTo: req.body.replyTo,
      mentions: req.body.mentions,
      attachments: req.body.attachments
    };

    const message = await ChatService.sendMessage(req.user.id, messageData);
    
    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error sending message'
    });
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/chat/messages/:messageId/read
 * @access  Private
 */
export const markMessageAsRead = async (req: ChatRequest, res: Response) => {
  try {
    await ChatService.markMessageAsRead(req.user.id, req.params.messageId);
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error marking message as read'
    });
  }
};

/**
 * @desc    Mark all messages in room as read
 * @route   PUT /api/chat/rooms/:roomId/read
 * @access  Private
 */
export const markRoomAsRead = async (req: ChatRequest, res: Response) => {
  try {
    await ChatService.markRoomAsRead(req.user.id, req.params.roomId);
    
    res.json({
      success: true,
      message: 'Room marked as read'
    });
  } catch (error: any) {
    console.error('Error marking room as read:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error marking room as read'
    });
  }
};

/**
 * @desc    Search messages
 * @route   GET /api/chat/search
 * @access  Private
 */
export const searchMessages = async (req: ChatRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const roomId = req.query.roomId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const messages = await ChatService.searchMessages(req.user.id, query, roomId, limit);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    console.error('Error searching messages:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error searching messages'
    });
  }
};

/**
 * @desc    Get online users in a room
 * @route   GET /api/chat/rooms/:roomId/online
 * @access  Private
 */
export const getRoomOnlineUsers = async (req: ChatRequest, res: Response) => {
  try {
    const onlineUsers = await ChatService.getRoomOnlineUsers(req.params.roomId);
    
    res.json({
      success: true,
      data: onlineUsers
    });
  } catch (error: any) {
    console.error('Error fetching online users:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error fetching online users'
    });
  }
};

/**
 * @desc    Get chat statistics (Admin only)
 * @route   GET /api/chat/statistics
 * @access  Private (Admin)
 */
export const getChatStatistics = async (req: ChatRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const statistics = await ChatService.getChatStatistics();
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    console.error('Error fetching chat statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching chat statistics'
    });
  }
};
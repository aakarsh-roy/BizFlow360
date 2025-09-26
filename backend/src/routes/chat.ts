import express from 'express';
import {
  getUserChatRooms,
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
  getRoomMessages,
  sendMessage,
  markMessageAsRead,
  markRoomAsRead,
  searchMessages,
  getRoomOnlineUsers,
  getChatStatistics
} from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Chat room routes
router.route('/rooms')
  .get(getUserChatRooms)
  .post(createChatRoom);

router.route('/rooms/:roomId/join')
  .post(joinChatRoom);

router.route('/rooms/:roomId/leave')
  .post(leaveChatRoom);

router.route('/rooms/:roomId/messages')
  .get(getRoomMessages)
  .post(sendMessage);

router.route('/rooms/:roomId/read')
  .put(markRoomAsRead);

router.route('/rooms/:roomId/online')
  .get(getRoomOnlineUsers);

// Message routes
router.route('/messages/:messageId/read')
  .put(markMessageAsRead);

// Search route
router.route('/search')
  .get(searchMessages);

// Statistics route (admin only)
router.route('/statistics')
  .get(getChatStatistics);

export default router;
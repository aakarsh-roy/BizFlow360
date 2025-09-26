import { ChatRoom, ChatParticipant } from '../models/Chat';
import User from '../models/User';

export class ChatSeeder {
  
  /**
   * Seed default chat rooms
   */
  static async seedDefaultChatRooms(): Promise<void> {
    try {
      console.log('🌱 Starting chat room seeding...');

      // Check if default rooms already exist
      const existingRooms = await ChatRoom.countDocuments();
      if (existingRooms > 0) {
        console.log('🏠 Chat rooms already exist, skipping seeding');
        return;
      }

      // Get admin user to create rooms
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        console.log('❌ No admin user found, cannot create default chat rooms');
        return;
      }

      // Get all users for general room
      const allUsers = await User.find({ isActive: true }).select('_id');
      const allUserIds = allUsers.map(user => user._id);

      // Create default chat rooms
      const defaultRooms = [
        {
          name: 'General Discussion',
          description: 'Open chat for all team members',
          type: 'general' as const,
          allowedRoles: ['admin', 'manager', 'user'],
          participants: allUserIds,
          admins: [adminUser._id],
          createdBy: adminUser._id,
          settings: {
            allowFileSharing: true,
            allowGuestMessages: false,
            retentionDays: 365,
            maxMembers: 100
          }
        },
        {
          name: 'Management Team',
          description: 'Private chat for managers and admins',
          type: 'department' as const,
          allowedRoles: ['admin', 'manager'],
          participants: allUserIds.filter(async (userId) => {
            const user = await User.findById(userId);
            return user && ['admin', 'manager'].includes(user.role);
          }),
          admins: [adminUser._id],
          createdBy: adminUser._id,
          settings: {
            allowFileSharing: true,
            allowGuestMessages: false,
            retentionDays: 365,
            maxMembers: 50
          }
        },
        {
          name: 'Announcements',
          description: 'Official company announcements',
          type: 'announcement' as const,
          allowedRoles: ['admin', 'manager', 'user'],
          participants: allUserIds,
          admins: [adminUser._id],
          createdBy: adminUser._id,
          settings: {
            allowFileSharing: false,
            allowGuestMessages: false,
            retentionDays: 730,
            maxMembers: 200
          }
        }
      ];

      // Create rooms
      const createdRooms = [];
      for (const roomData of defaultRooms) {
        // For management team, filter participants properly
        if (roomData.type === 'department') {
          const managementUsers = await User.find({ 
            role: { $in: ['admin', 'manager'] },
            isActive: true 
          }).select('_id');
          roomData.participants = managementUsers.map(user => user._id);
        }

        const room = await ChatRoom.create(roomData);
        createdRooms.push(room);

        // Create participant records
        const participantRecords = room.participants.map(participantId => ({
          userId: participantId,
          roomId: room._id,
          role: participantId.toString() === adminUser._id.toString() ? 'admin' : 'member',
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
        console.log(`✅ Created chat room: ${room.name} with ${room.participants.length} participants`);
      }

      console.log(`🎉 Successfully created ${createdRooms.length} default chat rooms`);

      // Create a welcome message in the general room
      const generalRoom = createdRooms.find(room => room.type === 'general');
      if (generalRoom) {
        const { ChatMessage } = await import('../models/Chat');
        await ChatMessage.create({
          roomId: generalRoom._id,
          sender: adminUser._id,
          content: '🎉 Welcome to BizFlow360 Team Chat! This is your general discussion room where all team members can collaborate and communicate in real-time.',
          messageType: 'system',
          attachments: [],
          mentions: [],
          reactions: [],
          readBy: []
        });
        console.log('💬 Created welcome message in General Discussion room');
      }

    } catch (error) {
      console.error('❌ Error seeding chat rooms:', error);
    }
  }

  /**
   * Clean up all chat data (for development/testing)
   */
  static async cleanupChatData(): Promise<void> {
    try {
      console.log('🧹 Cleaning up chat data...');
      
      const { ChatMessage } = await import('../models/Chat');
      await ChatMessage.deleteMany({});
      await ChatParticipant.deleteMany({});
      await ChatRoom.deleteMany({});
      
      console.log('✅ Chat data cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up chat data:', error);
    }
  }

  /**
   * Get chat statistics
   */
  static async getChatStats(): Promise<{
    totalRooms: number;
    totalMessages: number;
    totalParticipants: number;
    activeRooms: number;
  }> {
    try {
      const { ChatMessage } = await import('../models/Chat');
      
      const totalRooms = await ChatRoom.countDocuments({ isActive: true });
      const totalMessages = await ChatMessage.countDocuments({ isDeleted: false });
      const totalParticipants = await ChatParticipant.countDocuments({ isActive: true });
      const activeRooms = await ChatRoom.countDocuments({
        isActive: true,
        lastActivity: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        totalRooms,
        totalMessages,
        totalParticipants,
        activeRooms
      };
    } catch (error) {
      console.error('❌ Error getting chat stats:', error);
      return {
        totalRooms: 0,
        totalMessages: 0,
        totalParticipants: 0,
        activeRooms: 0
      };
    }
  }
}

export default ChatSeeder;
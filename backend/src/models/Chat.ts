import mongoose, { Document, Schema } from 'mongoose';

// Chat Room Interface
export interface IChatRoom extends Document {
  name: string;
  description?: string;
  type: 'general' | 'department' | 'project' | 'private' | 'announcement';
  isActive: boolean;
  participants: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  allowedRoles: string[];
  createdBy: mongoose.Types.ObjectId;
  lastActivity: Date;
  messageCount: number;
  settings: {
    allowFileSharing: boolean;
    allowGuestMessages: boolean;
    retentionDays: number;
    maxMembers: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message Interface
export interface IChatMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system' | 'announcement';
  attachments: Array<{
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimetype: string;
  }>;
  replyTo?: mongoose.Types.ObjectId;
  reactions: Array<{
    userId: mongoose.Types.ObjectId;
    emoji: string;
    timestamp: Date;
  }>;
  mentions: mongoose.Types.ObjectId[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  readBy: Array<{
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Participant Interface
export interface IChatParticipant extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  lastSeenAt: Date;
  isActive: boolean;
  isMuted: boolean;
  mutedUntil?: Date;
  settings: {
    notifications: boolean;
    soundEnabled: boolean;
    showTyping: boolean;
  };
}

// Chat Room Schema
const ChatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['general', 'department', 'project', 'private', 'announcement'],
      default: 'general',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }],
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    allowedRoles: [{
      type: String,
      enum: ['admin', 'manager', 'user']
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true
    },
    messageCount: {
      type: Number,
      default: 0
    },
    settings: {
      allowFileSharing: {
        type: Boolean,
        default: true
      },
      allowGuestMessages: {
        type: Boolean,
        default: false
      },
      retentionDays: {
        type: Number,
        default: 365
      },
      maxMembers: {
        type: Number,
        default: 100
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Chat Message Schema
const ChatMessageSchema = new Schema<IChatMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      text: true
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image', 'system', 'announcement'],
      default: 'text',
      index: true
    },
    attachments: [{
      filename: String,
      originalName: String,
      url: String,
      size: Number,
      mimetype: String
    }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage'
    },
    reactions: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    mentions: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: Date,
    readBy: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Chat Participant Schema
const ChatParticipantSchema = new Schema<IChatParticipant>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    mutedUntil: Date,
    settings: {
      notifications: {
        type: Boolean,
        default: true
      },
      soundEnabled: {
        type: Boolean,
        default: true
      },
      showTyping: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
ChatRoomSchema.index({ name: 'text', description: 'text' });
ChatRoomSchema.index({ type: 1, isActive: 1 });
ChatRoomSchema.index({ participants: 1, isActive: 1 });
ChatRoomSchema.index({ lastActivity: -1 });

ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
ChatMessageSchema.index({ sender: 1, createdAt: -1 });
ChatMessageSchema.index({ roomId: 1, isDeleted: 1, createdAt: -1 });
ChatMessageSchema.index({ 'mentions': 1, createdAt: -1 });
ChatMessageSchema.index({ content: 'text' }); // Text search index

ChatParticipantSchema.index({ userId: 1, roomId: 1 }, { unique: true });
ChatParticipantSchema.index({ roomId: 1, isActive: 1 });
ChatParticipantSchema.index({ userId: 1, isActive: 1 });

// Virtual populate for room participants
ChatRoomSchema.virtual('participantDetails', {
  ref: 'User',
  localField: 'participants',
  foreignField: '_id'
});

// Virtual populate for message sender
ChatMessageSchema.virtual('senderDetails', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id'
});

// Virtual populate for reply message - commented out due to populate issues
// ChatMessageSchema.virtual('replyMessage', {
//   ref: 'ChatMessage',
//   localField: 'replyTo',
//   foreignField: '_id'
// });

// Pre-save middleware to update room activity
ChatMessageSchema.pre('save', async function(next) {
  if (this.isNew && !this.isDeleted) {
    await mongoose.model('ChatRoom').findByIdAndUpdate(
      this.roomId,
      {
        $set: { lastActivity: new Date() },
        $inc: { messageCount: 1 }
      }
    );
  }
  next();
});

// Create models
export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
export const ChatParticipant = mongoose.model<IChatParticipant>('ChatParticipant', ChatParticipantSchema);

export default { ChatRoom, ChatMessage, ChatParticipant };
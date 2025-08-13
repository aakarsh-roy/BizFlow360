import mongoose, { Document, Schema } from 'mongoose';

// Process Definition Interface
export interface IProcessDefinition extends Document {
  name: string;
  description: string;
  version: string;
  category: string;
  definition: {
    nodes: Array<{
      id: string;
      type: 'start' | 'task' | 'approval' | 'service' | 'gateway' | 'timer' | 'email' | 'end';
      name: string;
      position: { x: number; y: number };
      config: any;
      connections: string[];
    }>;
    variables: Record<string, any>;
  };
  isActive: boolean;
  permissions: string[];
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Process Instance Interface
export interface IProcessInstance extends Document {
  processDefinitionId: mongoose.Types.ObjectId;
  businessKey: string;
  status: 'running' | 'completed' | 'failed' | 'suspended' | 'cancelled';
  variables: Record<string, any>;
  currentStep: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  initiatedBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  auditLog: Array<{
    timestamp: Date;
    action: string;
    userId: mongoose.Types.ObjectId;
    details: any;
    previousState?: any;
    newState?: any;
  }>;
  companyId: mongoose.Types.ObjectId;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Process Definition Schema
const ProcessDefinitionSchema = new Schema<IProcessDefinition>(
  {
    name: {
      type: String,
      required: [true, 'Process name is required'],
      trim: true,
      maxlength: [100, 'Process name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      default: '1.0.0'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['finance', 'hr', 'operations', 'sales', 'procurement', 'approval', 'custom']
    },
    definition: {
      nodes: [{
        id: { type: String, required: true },
        type: {
          type: String,
          required: true,
          enum: ['start', 'task', 'approval', 'service', 'gateway', 'timer', 'email', 'end']
        },
        name: { type: String, required: true },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true }
        },
        config: { type: Schema.Types.Mixed },
        connections: [{ type: String }]
      }],
      variables: { type: Schema.Types.Mixed, default: {} }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: [{
      type: String,
      enum: [
        'process.view', 'process.execute', 'process.manage', 'process.admin',
        'task.view', 'task.execute', 'task.assign', 'task.manage',
        'approval.view', 'approval.execute', 'approval.override',
        'analytics.view', 'analytics.export', 'user.manage',
        'settings.view', 'settings.manage', 'audit.view'
      ]
    }],
    tags: [{ type: String, maxlength: 30 }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'processDefinitions'
  }
);

// Process Instance Schema
const ProcessInstanceSchema = new Schema<IProcessInstance>(
  {
    processDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: 'ProcessDefinition',
      required: [true, 'Process definition ID is required']
    },
    businessKey: {
      type: String,
      required: [true, 'Business key is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed', 'suspended', 'cancelled'],
      default: 'running',
      index: true
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {}
    },
    currentStep: {
      type: String,
      required: [true, 'Current step is required']
    },
    startTime: {
      type: Date,
      default: Date.now,
      index: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number // Duration in milliseconds
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Initiator is required'],
      index: true
    },
    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },
    auditLog: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      action: {
        type: String,
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      details: {
        type: Schema.Types.Mixed
      },
      previousState: {
        type: Schema.Types.Mixed
      },
      newState: {
        type: Schema.Types.Mixed
      }
    }],
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    departmentId: {
      type: String,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'processInstances'
  }
);

// Indexes for better performance
ProcessDefinitionSchema.index({ name: 1, version: 1 }, { unique: true });
ProcessDefinitionSchema.index({ category: 1, isActive: 1 });
ProcessDefinitionSchema.index({ createdBy: 1, createdAt: -1 });

ProcessInstanceSchema.index({ processDefinitionId: 1, status: 1 });
ProcessInstanceSchema.index({ initiatedBy: 1, startTime: -1 });
ProcessInstanceSchema.index({ companyId: 1, status: 1, startTime: -1 });
ProcessInstanceSchema.index({ businessKey: 1, companyId: 1 });

// Pre-save middleware for process instances
ProcessInstanceSchema.pre('save', function(next) {
  if (this.isModified('status') && (this.status === 'completed' || this.status === 'failed' || this.status === 'cancelled')) {
    this.endTime = new Date();
    this.duration = this.endTime.getTime() - this.startTime.getTime();
  }
  next();
});

export const ProcessDefinition = mongoose.model<IProcessDefinition>('ProcessDefinition', ProcessDefinitionSchema);
export const ProcessInstance = mongoose.model<IProcessInstance>('ProcessInstance', ProcessInstanceSchema);

import mongoose, { Document, Schema } from 'mongoose';

// Task Interface
export interface ITask extends Document {
  processInstanceId?: mongoose.Types.ObjectId;
  taskName: string;
  description: string;
  type: 'manual' | 'approval' | 'system' | 'review' | 'notification';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  attachments: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }>;
  comments: Array<{
    content: string;
    author: mongoose.Types.ObjectId;
    timestamp: Date;
    isInternal: boolean;
    mentions: mongoose.Types.ObjectId[];
  }>;
  worklog: Array<{
    description: string;
    timeSpent: number; // in minutes
    date: Date;
    author: mongoose.Types.ObjectId;
    category: 'development' | 'testing' | 'review' | 'documentation' | 'meeting' | 'other';
  }>;
  tags: string[];
  customFields: Record<string, any>;
  companyId: mongoose.Types.ObjectId;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sales Transaction Interface
export interface ISalesTransaction extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  salesPersonId: mongoose.Types.ObjectId;
  orderDate: Date;
  deliveryDate?: Date;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    totalPrice: number;
    notes?: string;
  }>;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  shippingCost: number;
  grandTotal: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check' | 'credit' | 'online';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  internalNotes?: string;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Task Schema
const TaskSchema = new Schema<ITask>(
  {
    processInstanceId: {
      type: Schema.Types.ObjectId,
      ref: 'ProcessInstance',
      index: true
    },
    taskName: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [200, 'Task name cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
      type: String,
      enum: ['manual', 'approval', 'system', 'review', 'notification'],
      default: 'manual',
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled', 'failed'],
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
      index: true
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigning user is required']
    },
    dueDate: {
      type: Date,
      index: true
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      min: 0
    },
    actualHours: {
      type: Number,
      min: 0
    },
    attachments: [{
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
      size: { type: Number, required: true },
      mimetype: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }],
    comments: [{
      content: { type: String, required: true, maxlength: 1000 },
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      timestamp: { type: Date, default: Date.now },
      isInternal: { type: Boolean, default: false },
      mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }],
    worklog: [{
      description: { type: String, required: true, maxlength: 500 },
      timeSpent: { type: Number, required: true, min: 1 },
      date: { type: Date, required: true },
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      category: {
        type: String,
        enum: ['development', 'testing', 'review', 'documentation', 'meeting', 'other'],
        default: 'other'
      }
    }],
    tags: [{ type: String, maxlength: 30 }],
    customFields: {
      type: Schema.Types.Mixed,
      default: {}
    },
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
    collection: 'tasks'
  }
);

// Sales Transaction Schema
const SalesTransactionSchema = new Schema<ISalesTransaction>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true
    },
    salesPersonId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sales person ID is required'],
      index: true
    },
    orderDate: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now,
      index: true
    },
    deliveryDate: {
      type: Date,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'draft',
      index: true
    },
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0
      },
      discount: {
        type: Number,
        default: 0,
        min: 0
      },
      tax: {
        type: Number,
        default: 0,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      },
      notes: {
        type: String,
        maxlength: 200
      }
    }],
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: 0
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalTax: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    grandTotal: {
      type: Number,
      required: [true, 'Grand total is required'],
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'check', 'credit', 'online'],
      index: true
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    billingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    internalNotes: {
      type: String,
      maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'salesTransactions'
  }
);

// Indexes for better performance
TaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
TaskSchema.index({ companyId: 1, status: 1, priority: 1 });
TaskSchema.index({ processInstanceId: 1, status: 1 });

SalesTransactionSchema.index({ companyId: 1, orderDate: -1 });
SalesTransactionSchema.index({ customerId: 1, orderDate: -1 });
SalesTransactionSchema.index({ salesPersonId: 1, orderDate: -1 });
SalesTransactionSchema.index({ status: 1, paymentStatus: 1 });

// Pre-save middleware
TaskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'in-progress' && !this.startedAt) {
      this.startedAt = new Date();
    }
    if ((this.status === 'completed' || this.status === 'cancelled') && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

SalesTransactionSchema.pre('save', function(next) {
  // Calculate totals
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.totalDiscount = this.items.reduce((sum, item) => sum + item.discount, 0);
    this.totalTax = this.items.reduce((sum, item) => sum + item.tax, 0);
    this.grandTotal = this.subtotal - this.totalDiscount + this.totalTax + this.shippingCost;
  }
  next();
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);
export const SalesTransaction = mongoose.model<ISalesTransaction>('SalesTransaction', SalesTransactionSchema);

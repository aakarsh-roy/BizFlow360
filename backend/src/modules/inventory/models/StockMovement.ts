import mongoose, { Document, Schema } from 'mongoose';

export interface IStockMovement extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  unitCost?: number;
  totalValue: number;
  referenceType: 'purchase_order' | 'sales_order' | 'transfer' | 'adjustment' | 'return' | 'damage';
  referenceId?: mongoose.Types.ObjectId;
  fromWarehouse?: mongoose.Types.ObjectId;
  toWarehouse?: mongoose.Types.ObjectId;
  reason?: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  isApproved: boolean;
  stockBefore: number;
  stockAfter: number;
  movementDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StockMovementSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  movementType: {
    type: String,
    required: true,
    enum: ['in', 'out', 'transfer', 'adjustment']
  },
  quantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true
  },
  referenceType: {
    type: String,
    required: true,
    enum: ['purchase_order', 'sales_order', 'transfer', 'adjustment', 'return', 'damage']
  },
  referenceId: {
    type: Schema.Types.ObjectId
  },
  fromWarehouse: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  toWarehouse: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  stockBefore: {
    type: Number,
    required: true,
    min: 0
  },
  stockAfter: {
    type: Number,
    required: true,
    min: 0
  },
  movementDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
StockMovementSchema.index({ product: 1, movementDate: -1 });
StockMovementSchema.index({ warehouse: 1, movementDate: -1 });
StockMovementSchema.index({ movementType: 1 });
StockMovementSchema.index({ referenceType: 1, referenceId: 1 });
StockMovementSchema.index({ isApproved: 1 });

// Virtual for movement value per unit
StockMovementSchema.virtual('unitValue').get(function() {
  return this.quantity !== 0 ? (this.totalValue / Math.abs(this.quantity)).toFixed(2) : 0;
});

// Pre-save validation
StockMovementSchema.pre('save', function(next) {
  // Validate transfer movements
  if (this.movementType === 'transfer') {
    if (!this.fromWarehouse || !this.toWarehouse) {
      return next(new Error('Transfer movements require both fromWarehouse and toWarehouse'));
    }
    if (this.fromWarehouse.equals(this.toWarehouse)) {
      return next(new Error('fromWarehouse and toWarehouse cannot be the same'));
    }
  }
  
  // Calculate total value if not provided
  if (!this.totalValue && this.unitCost) {
    this.totalValue = Math.abs(this.quantity) * this.unitCost;
  }
  
  next();
});

export default mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);

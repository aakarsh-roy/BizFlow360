import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unit: string; // kg, pieces, liters, etc.
  barcode?: string;
  images: string[];
  isActive: boolean;
  supplier: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 1000
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0,
    default: 20
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'pieces', 'liters', 'ml', 'meters', 'cm', 'boxes', 'packets'],
    default: 'pieces'
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  warehouse: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
ProductSchema.index({ sku: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ stockQuantity: 1 });

// Virtual for profit margin
ProductSchema.virtual('profitMargin').get(function() {
  return ((this.unitPrice - this.costPrice) / this.costPrice * 100).toFixed(2);
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity <= 0) return 'out_of_stock';
  if (this.stockQuantity <= this.reorderPoint) return 'low_stock';
  if (this.stockQuantity >= this.maxStockLevel) return 'overstock';
  return 'in_stock';
});

// Pre-save middleware to generate SKU if not provided
ProductSchema.pre('save', function(next) {
  if (!this.sku) {
    // Generate SKU based on category and timestamp
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${categoryCode}-${timestamp}`;
  }
  next();
});

export default mongoose.model<IProduct>('Product', ProductSchema);

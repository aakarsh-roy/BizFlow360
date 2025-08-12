import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contactPerson: {
    name: string;
    designation?: string;
    email?: string;
    phone?: string;
  };
  paymentTerms: {
    creditDays: number;
    paymentMethod: string;
    bankDetails?: {
      accountNumber: string;
      bankName: string;
      ifscCode: string;
      accountHolderName: string;
    };
  };
  taxInfo: {
    gstNumber?: string;
    panNumber?: string;
    taxType: string;
  };
  rating: number;
  isActive: boolean;
  products: mongoose.Types.ObjectId[];
  totalOrders: number;
  totalOrderValue: number;
  lastOrderDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    zipCode: { type: String, required: true }
  },
  contactPerson: {
    name: { type: String, required: true },
    designation: String,
    email: String,
    phone: String
  },
  paymentTerms: {
    creditDays: { type: Number, default: 30, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'credit_card'],
      default: 'bank_transfer'
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      accountHolderName: String
    }
  },
  taxInfo: {
    gstNumber: {
      type: String,
      validate: {
        validator: function(v: string) {
          // GST number format validation
          return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: 'Invalid GST number format'
      }
    },
    panNumber: {
      type: String,
      validate: {
        validator: function(v: string) {
          // PAN number format validation
          return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
        },
        message: 'Invalid PAN number format'
      }
    },
    taxType: {
      type: String,
      enum: ['registered', 'unregistered', 'composition'],
      default: 'registered'
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  lastOrderDate: {
    type: Date
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

// Indexes
SupplierSchema.index({ name: 'text', companyName: 'text' });
SupplierSchema.index({ email: 1 });
SupplierSchema.index({ isActive: 1 });
SupplierSchema.index({ rating: -1 });

// Virtual for performance metrics
SupplierSchema.virtual('averageOrderValue').get(function() {
  return this.totalOrders > 0 ? (this.totalOrderValue / this.totalOrders).toFixed(2) : 0;
});

// Virtual for supplier status
SupplierSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.rating >= 4) return 'preferred';
  if (this.rating >= 3) return 'standard';
  return 'needs_review';
});

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IKPI extends Document {
  name: string;
  category: 'revenue' | 'users' | 'sales' | 'performance' | 'finance' | 'operational';
  value: number;
  target: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description?: string;
  companyId: mongoose.Types.ObjectId;
  isActive: boolean;
  metadata: {
    source: string;
    calculationMethod?: string;
    lastUpdated: Date;
    updatedBy: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const KPISchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['revenue', 'users', 'sales', 'performance', 'finance', 'operational']
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  target: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  previousValue: {
    type: Number,
    min: 0
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    required: true,
    default: 'stable'
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    source: {
      type: String,
      required: true,
      default: 'manual'
    },
    calculationMethod: {
      type: String
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
KPISchema.index({ companyId: 1, category: 1 });
KPISchema.index({ date: -1 });
KPISchema.index({ name: 1, companyId: 1 });
KPISchema.index({ isActive: 1 });

// Virtual for achievement percentage
KPISchema.virtual('achievementPercentage').get(function() {
  return Math.round((this.value / this.target) * 100);
});

// Virtual for trend percentage
KPISchema.virtual('trendPercentage').get(function() {
  if (!this.previousValue || this.previousValue === 0) return 0;
  return Math.round(((this.value - this.previousValue) / this.previousValue) * 100);
});

// Pre-save middleware to calculate trend
KPISchema.pre('save', function(next) {
  if (this.previousValue !== undefined && this.previousValue !== null) {
    const changePercent = ((this.value - this.previousValue) / this.previousValue) * 100;
    
    if (changePercent > 1) {
      this.trend = 'up';
    } else if (changePercent < -1) {
      this.trend = 'down';
    } else {
      this.trend = 'stable';
    }
    
    this.percentage = Math.abs(changePercent);
  }
  
  this.metadata.lastUpdated = new Date();
  next();
});

export default mongoose.model<IKPI>('KPI', KPISchema);

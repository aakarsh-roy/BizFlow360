import mongoose, { Document, Schema } from 'mongoose';

// KPI Metric Interface
export interface IKPIMetric extends Document {
  metricName: string;
  category: 'process' | 'financial' | 'user' | 'system' | 'operational' | 'customer';
  value: number;
  target?: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  periodStart: Date;
  periodEnd: Date;
  calculationMethod: string;
  processId?: mongoose.Types.ObjectId;
  departmentId?: string;
  userId?: mongoose.Types.ObjectId;
  metadata: Record<string, any>;
  companyId: mongoose.Types.ObjectId;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Interface
export interface IAuditLog extends Document {
  action: string;
  entityType: 'user' | 'task' | 'process' | 'workflow' | 'stock' | 'sales' | 'customer' | 'product' | 'company' | 'system';
  entityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  companyId: mongoose.Types.ObjectId;
  timestamp: Date;
  createdAt: Date;
}

// Customer Interface
export interface ICustomer extends Document {
  customerCode: string;
  type: 'individual' | 'corporate';
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  creditLimit: number;
  creditUsed: number;
  paymentTerms: number; // days
  status: 'active' | 'inactive' | 'suspended';
  segment: 'bronze' | 'silver' | 'gold' | 'platinum';
  addresses: Array<{
    type: 'billing' | 'shipping' | 'both';
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
  }>;
  contacts: Array<{
    name: string;
    position?: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
  }>;
  notes?: string;
  tags: string[];
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Company Configuration Interface
export interface ICompany extends Document {
  companyName: string;
  domain: string;
  registrationNumber?: string;
  taxId?: string;
  industry: string;
  website?: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    fax?: string;
  };
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    features: string[];
    maxUsers: number;
    currentUsers: number;
  };
  settings: {
    branding: {
      primaryColor: string;
      secondaryColor: string;
      logo?: string;
      favicon?: string;
    };
    security: {
      passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        expiryDays?: number;
      };
      sessionTimeout: number;
      maxLoginAttempts: number;
      twoFactorEnabled: boolean;
    };
    notifications: {
      emailEnabled: boolean;
      smsEnabled: boolean;
      pushEnabled: boolean;
      webhookUrl?: string;
    };
    integrations: {
      enabledServices: string[];
      apiKeys: Record<string, string>;
      webhooks: Array<{
        name: string;
        url: string;
        events: string[];
        secret?: string;
        isActive: boolean;
      }>;
    };
    billing: {
      currency: string;
      timezone: string;
      fiscalYearStart: string;
      invoicePrefix: string;
      invoiceCounter: number;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// KPI Metric Schema
const KPIMetricSchema = new Schema<IKPIMetric>(
  {
    metricName: {
      type: String,
      required: [true, 'Metric name is required'],
      trim: true,
      maxlength: [100, 'Metric name cannot exceed 100 characters']
    },
    category: {
      type: String,
      enum: ['process', 'financial', 'user', 'system', 'operational', 'customer'],
      required: [true, 'Category is required'],
      index: true
    },
    value: {
      type: Number,
      required: [true, 'Value is required']
    },
    target: {
      type: Number
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      maxlength: [20, 'Unit cannot exceed 20 characters']
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: [true, 'Period is required'],
      index: true
    },
    periodStart: {
      type: Date,
      required: [true, 'Period start is required'],
      index: true
    },
    periodEnd: {
      type: Date,
      required: [true, 'Period end is required'],
      index: true
    },
    calculationMethod: {
      type: String,
      required: [true, 'Calculation method is required'],
      maxlength: [200, 'Calculation method cannot exceed 200 characters']
    },
    processId: {
      type: Schema.Types.ObjectId,
      ref: 'ProcessDefinition',
      index: true
    },
    departmentId: {
      type: String,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'kpiMetrics'
  }
);

// Audit Log Schema
const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      maxlength: [100, 'Action cannot exceed 100 characters'],
      index: true
    },
    entityType: {
      type: String,
      enum: ['user', 'task', 'process', 'workflow', 'stock', 'sales', 'customer', 'product', 'company', 'system'],
      required: [true, 'Entity type is required'],
      index: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      index: true
    },
    ipAddress: {
      type: String,
      index: true
    },
    userAgent: {
      type: String
    },
    previousState: {
      type: Schema.Types.Mixed
    },
    newState: {
      type: Schema.Types.Mixed
    },
    changes: [{
      field: { type: String, required: true },
      oldValue: { type: Schema.Types.Mixed },
      newValue: { type: Schema.Types.Mixed }
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'auditLogs'
  }
);

// Customer Schema
const CustomerSchema = new Schema<ICustomer>(
  {
    customerCode: {
      type: String,
      required: [true, 'Customer code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Customer code cannot exceed 20 characters'],
      index: true
    },
    type: {
      type: String,
      enum: ['individual', 'corporate'],
      required: [true, 'Customer type is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [200, 'Customer name cannot exceed 200 characters'],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
      index: true
    },
    phone: {
      type: String,
      index: true
    },
    website: {
      type: String
    },
    taxId: {
      type: String,
      index: true
    },
    creditLimit: {
      type: Number,
      required: [true, 'Credit limit is required'],
      default: 0,
      min: 0
    },
    creditUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentTerms: {
      type: Number,
      required: [true, 'Payment terms is required'],
      default: 30,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true
    },
    segment: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
      index: true
    },
    addresses: [{
      type: {
        type: String,
        enum: ['billing', 'shipping', 'both'],
        required: true
      },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      isPrimary: { type: Boolean, default: false }
    }],
    contacts: [{
      name: { type: String, required: true },
      position: { type: String },
      email: { type: String },
      phone: { type: String },
      isPrimary: { type: Boolean, default: false }
    }],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    tags: [{ type: String, maxlength: 30 }],
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required']
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'customers'
  }
);

// Company Schema
const CompanySchema = new Schema<ICompany>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    registrationNumber: {
      type: String,
      index: true
    },
    taxId: {
      type: String,
      index: true
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      index: true
    },
    website: {
      type: String
    },
    logo: {
      type: String
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    contact: {
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required']
      },
      fax: { type: String }
    },
    subscription: {
      plan: {
        type: String,
        enum: ['basic', 'professional', 'enterprise'],
        required: [true, 'Subscription plan is required'],
        default: 'basic'
      },
      status: {
        type: String,
        enum: ['active', 'suspended', 'cancelled'],
        default: 'active'
      },
      startDate: {
        type: Date,
        required: [true, 'Subscription start date is required'],
        default: Date.now
      },
      endDate: { type: Date },
      features: [{ type: String }],
      maxUsers: {
        type: Number,
        required: [true, 'Max users is required'],
        default: 10
      },
      currentUsers: {
        type: Number,
        default: 0
      }
    },
    settings: {
      branding: {
        primaryColor: { type: String, default: '#1976d2' },
        secondaryColor: { type: String, default: '#dc004e' },
        logo: { type: String },
        favicon: { type: String }
      },
      security: {
        passwordPolicy: {
          minLength: { type: Number, default: 8 },
          requireUppercase: { type: Boolean, default: true },
          requireLowercase: { type: Boolean, default: true },
          requireNumbers: { type: Boolean, default: true },
          requireSpecialChars: { type: Boolean, default: false },
          expiryDays: { type: Number }
        },
        sessionTimeout: { type: Number, default: 3600 }, // seconds
        maxLoginAttempts: { type: Number, default: 5 },
        twoFactorEnabled: { type: Boolean, default: false }
      },
      notifications: {
        emailEnabled: { type: Boolean, default: true },
        smsEnabled: { type: Boolean, default: false },
        pushEnabled: { type: Boolean, default: true },
        webhookUrl: { type: String }
      },
      integrations: {
        enabledServices: [{ type: String }],
        apiKeys: { type: Schema.Types.Mixed, default: {} },
        webhooks: [{
          name: { type: String, required: true },
          url: { type: String, required: true },
          events: [{ type: String }],
          secret: { type: String },
          isActive: { type: Boolean, default: true }
        }]
      },
      billing: {
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' },
        fiscalYearStart: { type: String, default: '01-01' },
        invoicePrefix: { type: String, default: 'INV' },
        invoiceCounter: { type: Number, default: 1000 }
      }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'companies'
  }
);

// Indexes for better performance
KPIMetricSchema.index({ companyId: 1, category: 1, period: 1, periodStart: -1 });
KPIMetricSchema.index({ metricName: 1, companyId: 1, periodStart: -1 });

AuditLogSchema.index({ companyId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, severity: 1, timestamp: -1 });

CustomerSchema.index({ companyId: 1, status: 1, name: 1 });
CustomerSchema.index({ companyId: 1, type: 1, segment: 1 });

CompanySchema.index({ domain: 1 }, { unique: true });
CompanySchema.index({ 'subscription.status': 1, 'subscription.endDate': 1 });

// Pre-save middleware
CustomerSchema.pre('save', function(next) {
  // Ensure only one primary address and contact
  if (this.isModified('addresses')) {
    const primaryAddresses = this.addresses.filter(addr => addr.isPrimary);
    if (primaryAddresses.length > 1) {
      this.addresses.forEach((addr, index) => {
        if (index > 0 && addr.isPrimary) addr.isPrimary = false;
      });
    }
  }
  
  if (this.isModified('contacts')) {
    const primaryContacts = this.contacts.filter(contact => contact.isPrimary);
    if (primaryContacts.length > 1) {
      this.contacts.forEach((contact, index) => {
        if (index > 0 && contact.isPrimary) contact.isPrimary = false;
      });
    }
  }
  next();
});

export const KPIMetric = mongoose.model<IKPIMetric>('KPIMetric', KPIMetricSchema);
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export const Company = mongoose.model<ICompany>('Company', CompanySchema);

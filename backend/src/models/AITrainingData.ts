import mongoose, { Document, Schema } from 'mongoose';

// AI Training Data for Task Prioritization
export interface IAITaskData extends Document {
  taskId: mongoose.Types.ObjectId;
  taskTitle: string;
  taskDescription: string;
  category: string;
  assigneeId: mongoose.Types.ObjectId;
  originalPriority: 'low' | 'medium' | 'high' | 'urgent';
  actualCompletionTime: number; // hours
  estimatedCompletionTime: number; // hours
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  wasOverdue: boolean;
  dependencies: number;
  complexity: number; // 1-10 scale
  businessImpact: number; // 1-10 scale
  urgencyFactors: string[];
  userWorkload: number; // concurrent tasks
  userExpertise: number; // 1-10 scale in this category
  timeOfDay: number; // hour of creation
  dayOfWeek: number; // 0-6
  seasonality: number; // quarter 1-4
  successfulCompletion: boolean;
  companyId: mongoose.Types.ObjectId;
}

const AITaskDataSchema: Schema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  taskTitle: { type: String, required: true },
  taskDescription: { type: String, required: true },
  category: { type: String, required: true },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalPriority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    required: true 
  },
  actualCompletionTime: { type: Number, required: true },
  estimatedCompletionTime: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  completedAt: { type: Date },
  wasOverdue: { type: Boolean, required: true },
  dependencies: { type: Number, default: 0 },
  complexity: { type: Number, min: 1, max: 10, required: true },
  businessImpact: { type: Number, min: 1, max: 10, required: true },
  urgencyFactors: [{ type: String }],
  userWorkload: { type: Number, required: true },
  userExpertise: { type: Number, min: 1, max: 10, required: true },
  timeOfDay: { type: Number, min: 0, max: 23, required: true },
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  seasonality: { type: Number, min: 1, max: 4, required: true },
  successfulCompletion: { type: Boolean, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
}, {
  timestamps: true
});

// AI Training Data for KPI Predictions
export interface IAIKPIData extends Document {
  kpiId: mongoose.Types.ObjectId;
  kpiName: string;
  category: string;
  value: number;
  target: number;
  timestamp: Date;
  externalFactors: {
    marketCondition: 'bull' | 'bear' | 'stable';
    seasonality: number;
    economicIndicator: number;
    competitorActivity: number;
    marketing_spend: number;
    staffingLevel: number;
    productLaunches: number;
  };
  historicalTrend: number; // -1 to 1
  volatility: number; // 0 to 1
  correlatedMetrics: Array<{
    metricName: string;
    correlation: number;
    influence: number;
  }>;
  achievedTarget: boolean;
  percentageChange: number;
  companyId: mongoose.Types.ObjectId;
}

const AIKPIDataSchema: Schema = new Schema({
  kpiId: { type: Schema.Types.ObjectId, ref: 'KPI', required: true },
  kpiName: { type: String, required: true },
  category: { type: String, required: true },
  value: { type: Number, required: true },
  target: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  externalFactors: {
    marketCondition: { 
      type: String, 
      enum: ['bull', 'bear', 'stable'], 
      required: true 
    },
    seasonality: { type: Number, required: true },
    economicIndicator: { type: Number, required: true },
    competitorActivity: { type: Number, required: true },
    marketing_spend: { type: Number, required: true },
    staffingLevel: { type: Number, required: true },
    productLaunches: { type: Number, required: true }
  },
  historicalTrend: { type: Number, min: -1, max: 1, required: true },
  volatility: { type: Number, min: 0, max: 1, required: true },
  correlatedMetrics: [{
    metricName: { type: String, required: true },
    correlation: { type: Number, min: -1, max: 1, required: true },
    influence: { type: Number, min: 0, max: 1, required: true }
  }],
  achievedTarget: { type: Boolean, required: true },
  percentageChange: { type: Number, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
}, {
  timestamps: true
});

// AI Training Data for User Behavior
export interface IAIUserData extends Document {
  userId: mongoose.Types.ObjectId;
  sessionData: {
    loginTime: Date;
    logoutTime?: Date;
    activeTime: number; // minutes
    tasksCompleted: number;
    modulesAccessed: string[];
    errorCount: number;
    clickPatterns: Array<{
      module: string;
      action: string;
      timestamp: Date;
      duration: number;
    }>;
  };
  performanceMetrics: {
    productivityScore: number;
    accuracyRate: number;
    avgResponseTime: number; // minutes
    taskSuccessRate: number;
    collaborationScore: number;
  };
  workPatterns: {
    preferredWorkHours: number[];
    peakProductivityHour: number;
    breakPatterns: Array<{
      startTime: number;
      duration: number;
    }>;
    workloadPreference: 'light' | 'moderate' | 'heavy';
    multitaskingAbility: number; // 1-10
  };
  skillAssessment: {
    technicalSkills: Record<string, number>; // skill -> proficiency (1-10)
    domainExpertise: Record<string, number>; // domain -> expertise (1-10)
    learningVelocity: number; // skill improvement rate
  };
  riskFactors: {
    securityIncidents: number;
    policyViolations: number;
    dataAccessAnomalies: number;
    unusualBehaviorFlags: string[];
  };
  companyId: mongoose.Types.ObjectId;
  date: Date;
}

const AIUserDataSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionData: {
    loginTime: { type: Date, required: true },
    logoutTime: { type: Date },
    activeTime: { type: Number, required: true },
    tasksCompleted: { type: Number, default: 0 },
    modulesAccessed: [{ type: String }],
    errorCount: { type: Number, default: 0 },
    clickPatterns: [{
      module: { type: String, required: true },
      action: { type: String, required: true },
      timestamp: { type: Date, required: true },
      duration: { type: Number, required: true }
    }]
  },
  performanceMetrics: {
    productivityScore: { type: Number, min: 0, max: 100, required: true },
    accuracyRate: { type: Number, min: 0, max: 100, required: true },
    avgResponseTime: { type: Number, required: true },
    taskSuccessRate: { type: Number, min: 0, max: 100, required: true },
    collaborationScore: { type: Number, min: 0, max: 100, required: true }
  },
  workPatterns: {
    preferredWorkHours: [{ type: Number, min: 0, max: 23 }],
    peakProductivityHour: { type: Number, min: 0, max: 23, required: true },
    breakPatterns: [{
      startTime: { type: Number, min: 0, max: 23, required: true },
      duration: { type: Number, required: true }
    }],
    workloadPreference: { 
      type: String, 
      enum: ['light', 'moderate', 'heavy'], 
      required: true 
    },
    multitaskingAbility: { type: Number, min: 1, max: 10, required: true }
  },
  skillAssessment: {
    technicalSkills: { type: Map, of: Number },
    domainExpertise: { type: Map, of: Number },
    learningVelocity: { type: Number, required: true }
  },
  riskFactors: {
    securityIncidents: { type: Number, default: 0 },
    policyViolations: { type: Number, default: 0 },
    dataAccessAnomalies: { type: Number, default: 0 },
    unusualBehaviorFlags: [{ type: String }]
  },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  date: { type: Date, required: true }
}, {
  timestamps: true
});

// AI Training Data for Inventory Management
export interface IAIInventoryData extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  category: string;
  historicalDemand: Array<{
    date: Date;
    quantity: number;
    season: number;
    promotionActive: boolean;
    stockoutOccurred: boolean;
    price: number;
  }>;
  supplyChainMetrics: {
    leadTime: number; // days
    supplierReliability: number; // 0-1
    qualityScore: number; // 0-10
    costVariability: number; // coefficient of variation
  };
  marketFactors: {
    competitorPricing: number;
    marketTrend: 'growing' | 'stable' | 'declining';
    customerSatisfaction: number; // 0-10
    brandLoyalty: number; // 0-1
  };
  operationalFactors: {
    storageCost: number;
    handlingComplexity: number; // 1-10
    shelfLife: number; // days, -1 for non-perishable
    minimumOrderQuantity: number;
  };
  actualOutcomes: {
    stockoutDays: number;
    excessInventoryDays: number;
    totalCost: number;
    serviceLevelAchieved: number; // 0-1
  };
  companyId: mongoose.Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
}

const AIInventoryDataSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  historicalDemand: [{
    date: { type: Date, required: true },
    quantity: { type: Number, required: true },
    season: { type: Number, min: 1, max: 4, required: true },
    promotionActive: { type: Boolean, required: true },
    stockoutOccurred: { type: Boolean, required: true },
    price: { type: Number, required: true }
  }],
  supplyChainMetrics: {
    leadTime: { type: Number, required: true },
    supplierReliability: { type: Number, min: 0, max: 1, required: true },
    qualityScore: { type: Number, min: 0, max: 10, required: true },
    costVariability: { type: Number, required: true }
  },
  marketFactors: {
    competitorPricing: { type: Number, required: true },
    marketTrend: { 
      type: String, 
      enum: ['growing', 'stable', 'declining'], 
      required: true 
    },
    customerSatisfaction: { type: Number, min: 0, max: 10, required: true },
    brandLoyalty: { type: Number, min: 0, max: 1, required: true }
  },
  operationalFactors: {
    storageCost: { type: Number, required: true },
    handlingComplexity: { type: Number, min: 1, max: 10, required: true },
    shelfLife: { type: Number, required: true },
    minimumOrderQuantity: { type: Number, required: true }
  },
  actualOutcomes: {
    stockoutDays: { type: Number, required: true },
    excessInventoryDays: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    serviceLevelAchieved: { type: Number, min: 0, max: 1, required: true }
  },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true }
}, {
  timestamps: true
});

// AI Training Data for Process Optimization
export interface IAIProcessData extends Document {
  processId: mongoose.Types.ObjectId;
  processName: string;
  processSteps: Array<{
    stepName: string;
    averageDuration: number; // minutes
    resourcesRequired: string[];
    failureRate: number; // 0-1
    costPerExecution: number;
  }>;
  executionMetrics: {
    totalDuration: number; // minutes
    resourceUtilization: number; // 0-1
    bottleneckSteps: string[];
    errorCount: number;
    reworkRequired: boolean;
    customerSatisfactionScore: number; // 0-10
  };
  environmentalFactors: {
    systemLoad: number; // 0-1
    staffAvailability: number; // 0-1
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    urgencyLevel: number; // 1-10
  };
  optimizationOutcomes: {
    timeReduction: number; // percentage
    costReduction: number; // percentage
    qualityImprovement: number; // percentage
    resourceEfficiency: number; // 0-1
  };
  companyId: mongoose.Types.ObjectId;
  executionDate: Date;
}

const AIProcessDataSchema: Schema = new Schema({
  processId: { type: Schema.Types.ObjectId, ref: 'Process', required: true },
  processName: { type: String, required: true },
  processSteps: [{
    stepName: { type: String, required: true },
    averageDuration: { type: Number, required: true },
    resourcesRequired: [{ type: String }],
    failureRate: { type: Number, min: 0, max: 1, required: true },
    costPerExecution: { type: Number, required: true }
  }],
  executionMetrics: {
    totalDuration: { type: Number, required: true },
    resourceUtilization: { type: Number, min: 0, max: 1, required: true },
    bottleneckSteps: [{ type: String }],
    errorCount: { type: Number, default: 0 },
    reworkRequired: { type: Boolean, required: true },
    customerSatisfactionScore: { type: Number, min: 0, max: 10, required: true }
  },
  environmentalFactors: {
    systemLoad: { type: Number, min: 0, max: 1, required: true },
    staffAvailability: { type: Number, min: 0, max: 1, required: true },
    timeOfDay: { type: Number, min: 0, max: 23, required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    urgencyLevel: { type: Number, min: 1, max: 10, required: true }
  },
  optimizationOutcomes: {
    timeReduction: { type: Number, required: true },
    costReduction: { type: Number, required: true },
    qualityImprovement: { type: Number, required: true },
    resourceEfficiency: { type: Number, min: 0, max: 1, required: true }
  },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  executionDate: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes for better performance
AITaskDataSchema.index({ companyId: 1, createdAt: -1 });
AITaskDataSchema.index({ assigneeId: 1, successfulCompletion: 1 });
AITaskDataSchema.index({ category: 1, complexity: 1 });

AIKPIDataSchema.index({ companyId: 1, timestamp: -1 });
AIKPIDataSchema.index({ kpiName: 1, category: 1 });
AIKPIDataSchema.index({ 'externalFactors.marketCondition': 1 });

AIUserDataSchema.index({ companyId: 1, userId: 1, date: -1 });
AIUserDataSchema.index({ 'performanceMetrics.productivityScore': -1 });

AIInventoryDataSchema.index({ companyId: 1, productId: 1, periodStart: -1 });
AIInventoryDataSchema.index({ category: 1, 'marketFactors.marketTrend': 1 });

AIProcessDataSchema.index({ companyId: 1, processId: 1, executionDate: -1 });
AIProcessDataSchema.index({ processName: 1, 'environmentalFactors.timeOfDay': 1 });

export const AITaskData = mongoose.model<IAITaskData>('AITaskData', AITaskDataSchema);
export const AIKPIData = mongoose.model<IAIKPIData>('AIKPIData', AIKPIDataSchema);
export const AIUserData = mongoose.model<IAIUserData>('AIUserData', AIUserDataSchema);
export const AIInventoryData = mongoose.model<IAIInventoryData>('AIInventoryData', AIInventoryDataSchema);
export const AIProcessData = mongoose.model<IAIProcessData>('AIProcessData', AIProcessDataSchema);
import mongoose from 'mongoose';

// Model performance monitoring schema
const modelPerformanceSchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
    index: true
  },
  modelType: {
    type: String,
    required: true,
    enum: ['kpi', 'process', 'workflow', 'task', 'anomaly']
  },
  modelName: {
    type: String,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  trainingMetrics: {
    accuracy: { type: Number, required: true },
    mse: { type: Number, required: true },
    r2: { type: Number, required: true },
    mae: { type: Number, required: true },
    confidence: { type: Number, required: true }
  },
  validationMetrics: {
    accuracy: { type: Number },
    mse: { type: Number },
    r2: { type: Number },
    mae: { type: Number },
    confidence: { type: Number }
  },
  productionMetrics: {
    predictions: { type: Number, default: 0 },
    correctPredictions: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 },
    lastPredictionTime: { type: Date },
    uptimePercentage: { type: Number, default: 100 }
  },
  performanceHistory: [{
    timestamp: { type: Date, default: Date.now },
    metric: { type: String, required: true }, // 'accuracy', 'mse', 'predictions', etc.
    value: { type: Number, required: true },
    type: { type: String, enum: ['training', 'validation', 'production'], required: true }
  }],
  alerts: [{
    type: { type: String, enum: ['performance_degradation', 'drift_detected', 'low_accuracy', 'high_error'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    message: { type: String, required: true },
    threshold: { type: Number },
    actualValue: { type: Number },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],
  retrainingTriggers: {
    accuracyThreshold: { type: Number, default: 0.7 },
    driftThreshold: { type: Number, default: 0.3 },
    minPredictions: { type: Number, default: 100 },
    timeSinceLastTraining: { type: Number, default: 30 } // days
  },
  status: {
    type: String,
    enum: ['active', 'degraded', 'failed', 'retraining', 'outdated'],
    default: 'active'
  },
  lastHealthCheck: { type: Date, default: Date.now },
  nextScheduledRetraining: { type: Date },
  trainingDataSize: { type: Number, required: true },
  features: [{ type: String }],
  targetMetric: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

modelPerformanceSchema.index({ modelId: 1, timestamp: -1 });
modelPerformanceSchema.index({ companyId: 1, status: 1 });

const ModelPerformance = mongoose.model('ModelPerformance', modelPerformanceSchema);

export interface MLModelAlert {
  type: 'performance_degradation' | 'drift_detected' | 'low_accuracy' | 'high_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  actualValue?: number;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceMetrics {
  accuracy: number;
  mse: number;
  r2: number;
  mae: number;
  confidence: number;
}

export interface ProductionMetrics {
  predictions: number;
  correctPredictions: number;
  averageConfidence: number;
  lastPredictionTime?: Date;
  uptimePercentage: number;
}

class ModelPerformanceMonitor {
  
  /**
   * Initialize model performance tracking
   */
  static async initializeModelTracking(
    modelId: string,
    modelType: string,
    modelName: string,
    companyId: string,
    trainingMetrics: PerformanceMetrics,
    trainingDataSize: number,
    features: string[],
    targetMetric: string
  ): Promise<void> {
    try {
      const existingRecord = await ModelPerformance.findOne({ modelId });
      
      if (existingRecord) {
        // Update existing record
        existingRecord.trainingMetrics = trainingMetrics;
        existingRecord.trainingDataSize = trainingDataSize;
        existingRecord.features = features;
        existingRecord.updatedAt = new Date();
        existingRecord.status = 'active';
        
        // Add training metrics to history
        existingRecord.performanceHistory.push({
          timestamp: new Date(),
          metric: 'accuracy',
          value: trainingMetrics.accuracy,
          type: 'training'
        });
        
        await existingRecord.save();
      } else {
        // Create new record
        const modelPerformance = new ModelPerformance({
          modelId,
          modelType,
          modelName,
          companyId: new mongoose.Types.ObjectId(companyId),
          trainingMetrics,
          trainingDataSize,
          features,
          targetMetric,
          performanceHistory: [{
            timestamp: new Date(),
            metric: 'accuracy',
            value: trainingMetrics.accuracy,
            type: 'training'
          }],
          nextScheduledRetraining: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
        
        await modelPerformance.save();
      }
      
      console.log(`✅ Model performance tracking initialized for ${modelName}`);
    } catch (error) {
      console.error('❌ Error initializing model performance tracking:', error);
      throw error;
    }
  }

  /**
   * Record a prediction and update production metrics
   */
  static async recordPrediction(
    modelId: string,
    confidence: number,
    actualValue?: number,
    predictedValue?: number
  ): Promise<void> {
    try {
      const modelPerformance = await ModelPerformance.findOne({ modelId });
      if (!modelPerformance) {
        console.warn(`Model performance record not found for ${modelId}`);
        return;
      }

      // Update production metrics
      modelPerformance.productionMetrics.predictions += 1;
      modelPerformance.productionMetrics.lastPredictionTime = new Date();
      
      // Calculate running average confidence
      const totalPredictions = modelPerformance.productionMetrics.predictions;
      const currentAvgConfidence = modelPerformance.productionMetrics.averageConfidence;
      modelPerformance.productionMetrics.averageConfidence = 
        (currentAvgConfidence * (totalPredictions - 1) + confidence) / totalPredictions;

      // If actual value is provided, check prediction accuracy
      if (actualValue !== undefined && predictedValue !== undefined) {
        const errorThreshold = Math.abs(actualValue) * 0.1; // 10% error threshold
        const isCorrect = Math.abs(actualValue - predictedValue) <= errorThreshold;
        
        if (isCorrect) {
          modelPerformance.productionMetrics.correctPredictions += 1;
        }

        // Add to performance history
        const currentAccuracy = modelPerformance.productionMetrics.correctPredictions / 
                               modelPerformance.productionMetrics.predictions;
        
        modelPerformance.performanceHistory.push({
          timestamp: new Date(),
          metric: 'production_accuracy',
          value: currentAccuracy,
          type: 'production'
        });

        // Check for performance degradation
        await this.checkPerformanceDegradation(modelPerformance, currentAccuracy);
      }

      modelPerformance.updatedAt = new Date();
      await modelPerformance.save();

    } catch (error) {
      console.error('❌ Error recording prediction:', error);
    }
  }

  /**
   * Check for performance degradation and create alerts
   */
  private static async checkPerformanceDegradation(
    modelPerformance: any,
    currentAccuracy: number
  ): Promise<void> {
    const trainingAccuracy = modelPerformance.trainingMetrics.accuracy;
    const degradationThreshold = modelPerformance.retrainingTriggers.accuracyThreshold;
    
    // Check if current accuracy is significantly lower than training accuracy
    if (currentAccuracy < trainingAccuracy * 0.8) {
      const alert: MLModelAlert = {
        type: 'performance_degradation',
        severity: currentAccuracy < trainingAccuracy * 0.6 ? 'critical' : 'high',
        message: `Model accuracy dropped to ${(currentAccuracy * 100).toFixed(1)}% from training accuracy of ${(trainingAccuracy * 100).toFixed(1)}%`,
        threshold: trainingAccuracy * 0.8,
        actualValue: currentAccuracy,
        timestamp: new Date(),
        resolved: false
      };

      modelPerformance.alerts.push(alert);
      modelPerformance.status = 'degraded';
      
      console.warn(`⚠️ Performance degradation detected for model ${modelPerformance.modelName}`);
    }

    // Check if accuracy is below minimum threshold
    if (currentAccuracy < degradationThreshold) {
      const alert: MLModelAlert = {
        type: 'low_accuracy',
        severity: 'critical',
        message: `Model accuracy ${(currentAccuracy * 100).toFixed(1)}% is below minimum threshold of ${(degradationThreshold * 100).toFixed(1)}%`,
        threshold: degradationThreshold,
        actualValue: currentAccuracy,
        timestamp: new Date(),
        resolved: false
      };

      modelPerformance.alerts.push(alert);
      modelPerformance.status = 'failed';
      
      console.error(`🚨 Critical accuracy alert for model ${modelPerformance.modelName}`);
    }
  }

  /**
   * Check if model needs retraining
   */
  static async checkRetrainingNeeded(modelId: string): Promise<boolean> {
    try {
      const modelPerformance = await ModelPerformance.findOne({ modelId });
      if (!modelPerformance) return false;

      const triggers = modelPerformance.retrainingTriggers;
      const productionMetrics = modelPerformance.productionMetrics;
      
      // Check accuracy threshold
      if (productionMetrics.predictions > 0) {
        const currentAccuracy = productionMetrics.correctPredictions / productionMetrics.predictions;
        if (currentAccuracy < triggers.accuracyThreshold) {
          console.log(`🔄 Retraining needed for ${modelPerformance.modelName}: accuracy below threshold`);
          return true;
        }
      }

      // Check time since last training
      const daysSinceTraining = (Date.now() - modelPerformance.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceTraining > triggers.timeSinceLastTraining) {
        console.log(`🔄 Retraining needed for ${modelPerformance.modelName}: time threshold exceeded`);
        return true;
      }

      // Check minimum predictions threshold
      if (productionMetrics.predictions >= triggers.minPredictions) {
        const errorRate = 1 - (productionMetrics.correctPredictions / productionMetrics.predictions);
        if (errorRate > (1 - triggers.accuracyThreshold)) {
          console.log(`🔄 Retraining needed for ${modelPerformance.modelName}: error rate too high`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking retraining needs:', error);
      return false;
    }
  }

  /**
   * Get model performance dashboard data
   */
  static async getPerformanceDashboard(companyId: string): Promise<any> {
    try {
      const models = await ModelPerformance.find({ 
        companyId: new mongoose.Types.ObjectId(companyId) 
      }).sort({ updatedAt: -1 });

      const dashboard = {
        totalModels: models.length,
        activeModels: models.filter(m => m.status === 'active').length,
        degradedModels: models.filter(m => m.status === 'degraded').length,
        failedModels: models.filter(m => m.status === 'failed').length,
        averageAccuracy: models.length > 0 ? 
          models.reduce((sum, m) => sum + m.trainingMetrics.accuracy, 0) / models.length : 0,
        totalPredictions: models.reduce((sum, m) => sum + m.productionMetrics.predictions, 0),
        activeAlerts: models.reduce((sum, m) => sum + m.alerts.filter((a: any) => !a.resolved).length, 0),
        modelsNeedingRetraining: 0,
        modelPerformance: models.map(model => ({
          modelId: model.modelId,
          modelName: model.modelName,
          modelType: model.modelType,
          status: model.status,
          trainingAccuracy: model.trainingMetrics.accuracy,
          productionAccuracy: model.productionMetrics.predictions > 0 ? 
            model.productionMetrics.correctPredictions / model.productionMetrics.predictions : null,
          predictions: model.productionMetrics.predictions,
          lastPrediction: model.productionMetrics.lastPredictionTime,
          alerts: model.alerts.filter((a: any) => !a.resolved).length,
          lastTrained: model.updatedAt
        })),
        recentAlerts: models
          .flatMap(m => m.alerts.filter((a: any) => !a.resolved))
          .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10)
      };

      // Check which models need retraining
      for (const model of models) {
        const needsRetraining = await this.checkRetrainingNeeded(model.modelId);
        if (needsRetraining) {
          dashboard.modelsNeedingRetraining += 1;
        }
      }

      return dashboard;
    } catch (error) {
      console.error('❌ Error getting performance dashboard:', error);
      throw error;
    }
  }

  /**
   * Get detailed model performance history
   */
  static async getModelHistory(modelId: string, days: number = 30): Promise<any> {
    try {
      const modelPerformance = await ModelPerformance.findOne({ modelId });
      if (!modelPerformance) {
        throw new Error('Model performance record not found');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const recentHistory = modelPerformance.performanceHistory.filter(
        (h: any) => h.timestamp >= startDate
      );

      return {
        modelId,
        modelName: modelPerformance.modelName,
        modelType: modelPerformance.modelType,
        status: modelPerformance.status,
        trainingMetrics: modelPerformance.trainingMetrics,
        productionMetrics: modelPerformance.productionMetrics,
        performanceHistory: recentHistory,
        alerts: modelPerformance.alerts.filter((a: any) => a.timestamp >= startDate),
        retrainingTriggers: modelPerformance.retrainingTriggers
      };
    } catch (error) {
      console.error('❌ Error getting model history:', error);
      throw error;
    }
  }

  /**
   * Update model status after retraining
   */
  static async updateAfterRetraining(
    modelId: string,
    newTrainingMetrics: PerformanceMetrics,
    trainingDataSize: number
  ): Promise<void> {
    try {
      const modelPerformance = await ModelPerformance.findOne({ modelId });
      if (!modelPerformance) return;

      // Update training metrics
      modelPerformance.trainingMetrics = newTrainingMetrics;
      modelPerformance.trainingDataSize = trainingDataSize;
      modelPerformance.status = 'active';
      modelPerformance.updatedAt = new Date();
      
      // Reset production metrics
      modelPerformance.productionMetrics = {
        predictions: 0,
        correctPredictions: 0,
        averageConfidence: 0,
        uptimePercentage: 100
      };

      // Add new training metrics to history
      modelPerformance.performanceHistory.push({
        timestamp: new Date(),
        metric: 'accuracy',
        value: newTrainingMetrics.accuracy,
        type: 'training'
      });

      // Resolve existing alerts
      modelPerformance.alerts.forEach((alert: any) => {
        if (!alert.resolved) {
          alert.resolved = true;
        }
      });

      // Schedule next retraining
      modelPerformance.nextScheduledRetraining = new Date(
        Date.now() + modelPerformance.retrainingTriggers.timeSinceLastTraining * 24 * 60 * 60 * 1000
      );

      await modelPerformance.save();
      
      console.log(`✅ Model performance updated after retraining: ${modelPerformance.modelName}`);
    } catch (error) {
      console.error('❌ Error updating model after retraining:', error);
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  static async resolveAlert(modelId: string, alertId: string): Promise<void> {
    try {
      const modelPerformance = await ModelPerformance.findOne({ modelId });
      if (!modelPerformance) return;

      const alertIndex = modelPerformance.alerts.findIndex((a: any) => a._id && a._id.toString() === alertId);
      if (alertIndex >= 0) {
        modelPerformance.alerts[alertIndex].resolved = true;
        await modelPerformance.save();
        console.log(`✅ Alert resolved for model ${modelPerformance.modelName}`);
      }
    } catch (error) {
      console.error('❌ Error resolving alert:', error);
      throw error;
    }
  }
}

export { ModelPerformance, ModelPerformanceMonitor };
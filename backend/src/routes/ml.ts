import express from 'express';
import { MLTrainingService } from '../services/MLTrainingService';
import { ModelPerformanceMonitor } from '../services/ModelPerformanceMonitor';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/ml/train/kpi
 * @desc    Train KPI prediction model
 * @access  Private
 */
router.post('/train/kpi', protect, async (req: any, res: any) => {
  try {
    const { metricName, timeHorizon } = req.body;
    const companyId = req.user.companyId || req.user._id;

    if (!metricName) {
      return res.status(400).json({
        success: false,
        message: 'Metric name is required'
      });
    }

    console.log(`🧠 Training KPI model for ${metricName} (Company: ${companyId})`);

    const model = await MLTrainingService.trainKPIPredictionModel(
      companyId.toString(),
      metricName,
      timeHorizon || 30
    );

    res.json({
      success: true,
      message: 'KPI prediction model trained successfully',
      data: {
        modelId: model.id,
        modelName: model.name,
        metrics: model.metrics,
        trainingDataSize: model.trainingDataSize,
        features: model.features,
        lastTrained: model.lastTrained
      }
    });

  } catch (error: any) {
    console.error('❌ Error training KPI model:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to train KPI model'
    });
  }
});

/**
 * @route   POST /api/ml/train/process
 * @desc    Train process optimization model
 * @access  Private
 */
router.post('/train/process', protect, async (req: any, res: any) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    console.log(`🧠 Training process optimization model (Company: ${companyId})`);

    const model = await MLTrainingService.trainProcessOptimizationModel(
      companyId.toString()
    );

    res.json({
      success: true,
      message: 'Process optimization model trained successfully',
      data: {
        modelId: model.id,
        modelName: model.name,
        metrics: model.metrics,
        trainingDataSize: model.trainingDataSize,
        features: model.features,
        lastTrained: model.lastTrained
      }
    });

  } catch (error: any) {
    console.error('❌ Error training process model:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to train process optimization model'
    });
  }
});

/**
 * @route   POST /api/ml/train/anomaly
 * @desc    Train anomaly detection model
 * @access  Private
 */
router.post('/train/anomaly', protect, async (req: any, res: any) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    console.log(`🧠 Training anomaly detection model (Company: ${companyId})`);

    const model = await MLTrainingService.trainAnomalyDetectionModel(
      companyId.toString()
    );

    res.json({
      success: true,
      message: 'Anomaly detection model trained successfully',
      data: {
        modelId: model.id,
        modelName: model.name,
        metrics: model.metrics,
        trainingDataSize: model.trainingDataSize,
        features: model.features,
        lastTrained: model.lastTrained
      }
    });

  } catch (error: any) {
    console.error('❌ Error training anomaly model:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to train anomaly detection model'
    });
  }
});

/**
 * @route   POST /api/ml/predict/:modelId
 * @desc    Make real-time prediction using trained model
 * @access  Private
 */
router.post('/predict/:modelId', protect, async (req: any, res: any) => {
  try {
    const { modelId } = req.params;
    const { features } = req.body;

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: 'Features array is required'
      });
    }

    console.log(`🔮 Making prediction with model ${modelId}`);

    const prediction = await MLTrainingService.makePrediction(modelId, features);

    res.json({
      success: true,
      message: 'Prediction generated successfully',
      data: {
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        trendDirection: prediction.trendDirection,
        anomalyScore: prediction.anomalyScore,
        modelMetrics: prediction.modelMetrics,
        timestamp: new Date()
      }
    });

  } catch (error: any) {
    console.error('❌ Error making prediction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to make prediction'
    });
  }
});

/**
 * @route   GET /api/ml/models
 * @desc    Get all trained models for company
 * @access  Private
 */
router.get('/models', protect, async (req: any, res: any) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    const models = MLTrainingService.getModelPerformance(companyId.toString());

    res.json({
      success: true,
      message: 'Models retrieved successfully',
      data: models.map(model => ({
        id: model.id,
        type: model.type,
        name: model.name,
        metrics: model.metrics,
        lastTrained: model.lastTrained,
        trainingDataSize: model.trainingDataSize,
        features: model.features,
        targetMetric: model.targetMetric
      }))
    });

  } catch (error: any) {
    console.error('❌ Error retrieving models:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve models'
    });
  }
});

/**
 * @route   POST /api/ml/retrain/:modelId
 * @desc    Retrain existing model with new data
 * @access  Private
 */
router.post('/retrain/:modelId', protect, async (req: any, res: any) => {
  try {
    const { modelId } = req.params;

    console.log(`🔄 Retraining model ${modelId}`);

    const model = await MLTrainingService.retrainModel(modelId);

    res.json({
      success: true,
      message: 'Model retrained successfully',
      data: {
        modelId: model.id,
        modelName: model.name,
        metrics: model.metrics,
        trainingDataSize: model.trainingDataSize,
        lastTrained: model.lastTrained,
        improvementMetrics: {
          accuracyChange: model.metrics.accuracy,
          r2Change: model.metrics.r2,
          confidenceChange: model.metrics.confidence
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error retraining model:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrain model'
    });
  }
});

/**
 * @route   GET /api/ml/predict/kpi/:metricName
 * @desc    Get KPI predictions with confidence intervals
 * @access  Private
 */
router.get('/predict/kpi/:metricName', protect, async (req: any, res: any) => {
  try {
    const { metricName } = req.params;
    const { days = 7 } = req.query;
    const companyId = req.user.companyId || req.user._id;

    // Find the latest KPI model for this metric
    const models = MLTrainingService.getModelPerformance(companyId.toString());
    const kpiModel = models.find(m => m.type === 'kpi' && m.targetMetric === metricName);

    if (!kpiModel) {
      return res.status(404).json({
        success: false,
        message: `No trained model found for metric: ${metricName}`
      });
    }

    // Generate predictions for the next N days
    const predictions = [];
    const currentDate = new Date();

    for (let i = 1; i <= parseInt(days as string); i++) {
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate() + i);

      // Create synthetic features for prediction (in real app, use actual recent data)
      const features = [
        1000 + Math.random() * 200, // current value
        950 + Math.random() * 100,  // prev values
        1050 + Math.random() * 150,
        980 + Math.random() * 120,
        1020 + Math.random() * 180,
        1000 + Math.random() * 100,
        1000, // moving average
        50 + Math.random() * 20 // volatility
      ];

      const prediction = await MLTrainingService.makePrediction(kpiModel.id, features);
      
      predictions.push({
        date: futureDate,
        value: Math.round(prediction.prediction * 100) / 100,
        confidence: Math.round(prediction.confidence * 100),
        trendDirection: prediction.trendDirection,
        confidenceInterval: {
          lower: Math.round((prediction.prediction * (1 - (1 - prediction.confidence) * 0.5)) * 100) / 100,
          upper: Math.round((prediction.prediction * (1 + (1 - prediction.confidence) * 0.5)) * 100) / 100
        }
      });
    }

    res.json({
      success: true,
      message: 'KPI predictions generated successfully',
      data: {
        metricName,
        predictions,
        modelMetrics: kpiModel.metrics,
        forecastHorizon: parseInt(days as string),
        generatedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating KPI predictions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate KPI predictions'
    });
  }
});

/**
 * @route   GET /api/ml/analyze/process/:processId
 * @desc    Analyze process performance and predict optimization opportunities
 * @access  Private
 */
router.get('/analyze/process/:processId', protect, async (req: any, res: any) => {
  try {
    const { processId } = req.params;
    const companyId = req.user.companyId || req.user._id;

    // Find process optimization model
    const models = MLTrainingService.getModelPerformance(companyId.toString());
    const processModel = models.find(m => m.type === 'process');

    if (!processModel) {
      return res.status(404).json({
        success: false,
        message: 'No trained process optimization model found'
      });
    }

    // Simulate process analysis (in real app, get actual process data)
    const processFeatures = [
      4.5, // duration (hours)
      8,   // complexity
      3,   // resources
      1,   // bottlenecks
      0    // errors
    ];

    const analysis = await MLTrainingService.makePrediction(processModel.id, processFeatures);
    
    // Generate optimization recommendations
    const recommendations = [];
    
    if (processFeatures[0] > 6) { // Long duration
      recommendations.push({
        type: 'duration',
        priority: 'high',
        suggestion: 'Consider parallelizing tasks to reduce overall duration',
        estimatedImprovement: '25-30% time reduction'
      });
    }
    
    if (processFeatures[3] > 0) { // Bottlenecks present
      recommendations.push({
        type: 'bottleneck',
        priority: 'medium',
        suggestion: 'Identify and eliminate process bottlenecks',
        estimatedImprovement: '15-20% efficiency gain'
      });
    }
    
    if (processFeatures[2] < 2) { // Low resources
      recommendations.push({
        type: 'resources',
        priority: 'low',
        suggestion: 'Consider allocating additional resources',
        estimatedImprovement: '10-15% faster completion'
      });
    }

    res.json({
      success: true,
      message: 'Process analysis completed successfully',
      data: {
        processId,
        currentEfficiency: Math.round(analysis.prediction),
        trendDirection: analysis.trendDirection,
        confidence: Math.round(analysis.confidence * 100),
        recommendations,
        benchmarks: {
          industryAverage: 75,
          topPerformers: 90,
          currentRanking: analysis.prediction > 80 ? 'top-quartile' : 
                          analysis.prediction > 60 ? 'above-average' : 'below-average'
        },
        analyzedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('❌ Error analyzing process:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze process'
    });
  }
});

/**
 * @route   GET /api/ml/anomalies
 * @desc    Detect anomalies in real-time operational data
 * @access  Private
 */
router.get('/anomalies', protect, async (req: any, res: any) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    // Find anomaly detection model
    const models = MLTrainingService.getModelPerformance(companyId.toString());
    const anomalyModel = models.find(m => m.type === 'anomaly');

    if (!anomalyModel) {
      return res.status(404).json({
        success: false,
        message: 'No trained anomaly detection model found'
      });
    }

    // Simulate current system metrics (in real app, get from monitoring)
    const currentMetrics = [
      Math.random() * 80 + 20, // cpu_usage
      Math.random() * 70 + 30, // memory_usage
      Math.random() * 200 + 50, // response_time
      Math.random() * 5,        // error_rate
      Math.random() * 1000 + 500 // throughput
    ];

    const anomalyResult = await MLTrainingService.makePrediction(anomalyModel.id, currentMetrics);
    
    const anomalies = [];
    
    // Check individual metrics for anomalies
    if (currentMetrics[0] > 90) {
      anomalies.push({
        metric: 'CPU Usage',
        value: Math.round(currentMetrics[0]),
        severity: 'high',
        threshold: 90,
        message: 'CPU usage is critically high'
      });
    }
    
    if (currentMetrics[2] > 500) {
      anomalies.push({
        metric: 'Response Time',
        value: Math.round(currentMetrics[2]),
        severity: 'medium',
        threshold: 500,
        message: 'Response time is above acceptable limits'
      });
    }
    
    if (currentMetrics[3] > 3) {
      anomalies.push({
        metric: 'Error Rate',
        value: Math.round(currentMetrics[3] * 100) / 100,
        severity: 'high',
        threshold: 3,
        message: 'Error rate is elevated'
      });
    }

    res.json({
      success: true,
      message: 'Anomaly detection completed successfully',
      data: {
        overallAnomalyScore: Math.round(anomalyResult.anomalyScore * 100),
        systemHealth: anomalyResult.anomalyScore < 0.3 ? 'healthy' : 
                     anomalyResult.anomalyScore < 0.7 ? 'warning' : 'critical',
        currentMetrics: {
          cpuUsage: Math.round(currentMetrics[0]),
          memoryUsage: Math.round(currentMetrics[1]),
          responseTime: Math.round(currentMetrics[2]),
          errorRate: Math.round(currentMetrics[3] * 100) / 100,
          throughput: Math.round(currentMetrics[4])
        },
        anomalies,
        recommendations: anomalies.length > 0 ? [
          'Review system resources and scaling policies',
          'Check for potential bottlenecks or failures',
          'Consider implementing auto-scaling mechanisms'
        ] : ['System is operating within normal parameters'],
        detectedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('❌ Error detecting anomalies:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to detect anomalies'
    });
  }
});

/**
 * @route   GET /api/ml/dashboard
 * @desc    Get ML dashboard with model performance and predictions
 * @access  Private
 */
router.get('/dashboard', protect, async (req: any, res: any) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    const models = MLTrainingService.getModelPerformance(companyId.toString());
    
    const dashboard = {
      totalModels: models.length,
      activeModels: models.filter(m => {
        const daysSinceTraining = (new Date().getTime() - m.lastTrained.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceTraining < 7; // Consider active if trained within last week
      }).length,
      modelTypes: {
        kpi: models.filter(m => m.type === 'kpi').length,
        process: models.filter(m => m.type === 'process').length,
        anomaly: models.filter(m => m.type === 'anomaly').length
      },
      averageAccuracy: models.length > 0 ? 
        Math.round(models.reduce((sum, m) => sum + m.metrics.accuracy, 0) / models.length) : 0,
      modelPerformance: models.slice(0, 5).map(model => ({
        id: model.id,
        name: model.name,
        type: model.type,
        accuracy: Math.round(model.metrics.accuracy),
        confidence: Math.round(model.metrics.confidence * 100),
        lastTrained: model.lastTrained,
        status: (new Date().getTime() - model.lastTrained.getTime()) / (1000 * 60 * 60 * 24) < 7 
          ? 'active' : 'outdated'
      })),
      recentPredictions: 0, // Would track this in production
      systemStatus: 'operational',
      activeAlerts: 0,
      modelsNeedingRetraining: 0
    };

    // Try to get enhanced performance data from monitoring service
    try {
      const performanceDashboard = await ModelPerformanceMonitor.getPerformanceDashboard(companyId.toString());
      
      // Merge with enhanced data if available
      if (performanceDashboard) {
        dashboard.totalModels = performanceDashboard.totalModels || dashboard.totalModels;
        dashboard.activeModels = performanceDashboard.activeModels || dashboard.activeModels;
        dashboard.averageAccuracy = Math.round(performanceDashboard.averageAccuracy * 100) || dashboard.averageAccuracy;
        dashboard.recentPredictions = performanceDashboard.totalPredictions || 0;
        dashboard.activeAlerts = performanceDashboard.activeAlerts || 0;
        dashboard.modelsNeedingRetraining = performanceDashboard.modelsNeedingRetraining || 0;
        
        if (performanceDashboard.modelPerformance.length > 0) {
          dashboard.modelPerformance = performanceDashboard.modelPerformance.slice(0, 5);
        }
      }
    } catch (perfError) {
      console.warn('Performance monitoring data unavailable:', perfError);
    }

    res.json({
      success: true,
      message: 'ML dashboard data retrieved successfully',
      data: dashboard
    });

  } catch (error: any) {
    console.error('❌ Error getting ML dashboard:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ML dashboard data'
    });
  }
});

/**
 * @route   GET /api/ml/performance/:modelId
 * @desc    Get detailed performance metrics for a specific model
 * @access  Private
 */
router.get('/performance/:modelId', protect, async (req: any, res: any) => {
  try {
    const { modelId } = req.params;
    const { days = 30 } = req.query;

    console.log(`📊 Getting performance data for model ${modelId}`);

    const performanceData = await ModelPerformanceMonitor.getModelHistory(
      modelId, 
      parseInt(days as string)
    );

    res.json({
      success: true,
      message: 'Model performance data retrieved successfully',
      data: performanceData
    });

  } catch (error: any) {
    console.error('❌ Error getting model performance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get model performance data'
    });
  }
});

/**
 * @route   GET /api/ml/performance/dashboard/:companyId
 * @desc    Get comprehensive performance dashboard for all models
 * @access  Private
 */
router.get('/performance/dashboard/:companyId', protect, async (req: any, res: any) => {
  try {
    const { companyId } = req.params;

    console.log(`📊 Getting performance dashboard for company ${companyId}`);

    const dashboard = await ModelPerformanceMonitor.getPerformanceDashboard(companyId);

    res.json({
      success: true,
      message: 'Performance dashboard retrieved successfully',
      data: dashboard
    });

  } catch (error: any) {
    console.error('❌ Error getting performance dashboard:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get performance dashboard'
    });
  }
});

/**
 * @route   POST /api/ml/performance/record/:modelId
 * @desc    Record prediction result for performance tracking
 * @access  Private
 */
router.post('/performance/record/:modelId', protect, async (req: any, res: any) => {
  try {
    const { modelId } = req.params;
    const { confidence, actualValue, predictedValue } = req.body;

    await ModelPerformanceMonitor.recordPrediction(
      modelId,
      confidence,
      actualValue,
      predictedValue
    );

    res.json({
      success: true,
      message: 'Prediction recorded successfully'
    });

  } catch (error: any) {
    console.error('❌ Error recording prediction:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record prediction'
    });
  }
});

/**
 * @route   POST /api/ml/performance/alert/:modelId/:alertId/resolve
 * @desc    Resolve a performance alert
 * @access  Private
 */
router.post('/performance/alert/:modelId/:alertId/resolve', protect, async (req: any, res: any) => {
  try {
    const { modelId, alertId } = req.params;

    await ModelPerformanceMonitor.resolveAlert(modelId, alertId);

    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve alert'
    });
  }
});

export default router;
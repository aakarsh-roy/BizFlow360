import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { PredictiveAnalyticsEngine } from '../services/PredictiveAnalyticsEngine';
import { NLPService } from '../services/NLPService';
import { IntelligentRecommendationSystem } from '../services/IntelligentRecommendationSystem';
import { AnomalyDetectionSystem } from '../services/AnomalyDetectionSystem';
import { AIAutomationEngine } from '../services/AIAutomationEngine';

/**
 * AI Controller - Advanced AI features for business intelligence
 */

interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    companyId?: Types.ObjectId;
    role: string;
    department?: string;
  };
}

// @desc    Get advanced ML-powered forecasts
// @route   GET /api/ai/forecast
// @access  Private
export const getAdvancedForecast = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { metricName, horizon = 30, method = 'ensemble', includeSeasonality = true } = req.query;

    const forecast = await PredictiveAnalyticsEngine.generateAdvancedForecast(
      companyId,
      metricName as string,
      {
        horizon: parseInt(horizon as string),
        method: method as any,
        include_seasonality: includeSeasonality === 'true'
      }
    );

    res.json({
      success: true,
      data: forecast,
      metadata: {
        generated_at: new Date(),
        method_used: method,
        horizon_days: horizon
      }
    });
  } catch (error: any) {
    console.error('Error in advanced forecast:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Advanced forecasting failed' 
    });
  }
};

// @desc    Get business metrics predictions
// @route   GET /api/ai/predict-metrics
// @access  Private
export const predictBusinessMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { timeframe = 'monthly' } = req.query;

    const predictions = await PredictiveAnalyticsEngine.predictBusinessMetrics(
      companyId,
      timeframe as 'daily' | 'weekly' | 'monthly'
    );

    res.json({
      success: true,
      data: predictions,
      insights: {
        total_metrics: predictions.length,
        high_risk_metrics: predictions.filter(p => p.risk_level === 'high').length,
        positive_trends: predictions.filter(p => p.change_percentage > 0).length
      }
    });
  } catch (error: any) {
    console.error('Error predicting business metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Business metrics prediction failed' 
    });
  }
};

// @desc    Get revenue forecasting with scenarios
// @route   GET /api/ai/revenue-forecast
// @access  Private
export const getRevenueForecast = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const externalFactors = req.body.external_factors ? {
      market_trend: parseFloat(req.body.external_factors.market_trend) || 0,
      seasonality: parseFloat(req.body.external_factors.seasonality) || 0,
      competition: parseFloat(req.body.external_factors.competition) || 0,
      economic_indicator: parseFloat(req.body.external_factors.economic_indicator) || 0
    } : undefined;

    const revenueForecast = await PredictiveAnalyticsEngine.predictRevenue(
      companyId,
      externalFactors
    );

    res.json({
      success: true,
      data: revenueForecast,
      summary: {
        forecast_period: '90 days',
        confidence_level: 'high',
        key_growth_drivers: revenueForecast.growth_drivers.length
      }
    });
  } catch (error: any) {
    console.error('Error in revenue forecast:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Revenue forecasting failed' 
    });
  }
};

// @desc    Analyze text with NLP
// @route   POST /api/ai/analyze-text
// @access  Private
export const analyzeTextWithNLP = async (req: AuthRequest, res: Response) => {
  try {
    const { text, context = 'business', analysis_types = ['sentiment', 'insights', 'classification'] } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Text content required' });
    }

    const results: any = {};

    if (analysis_types.includes('sentiment')) {
      results.sentiment = NLPService.analyzeSentiment(text);
    }

    if (analysis_types.includes('insights')) {
      results.insights = NLPService.extractInsights(text, context);
    }

    if (analysis_types.includes('classification')) {
      results.classification = NLPService.classifyText(text);
    }

    if (analysis_types.includes('entities')) {
      results.entities = NLPService.extractEntities(text);
    }

    if (analysis_types.includes('readability')) {
      results.readability = NLPService.analyzeReadability(text);
    }

    if (analysis_types.includes('summary')) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      results.summary = NLPService.generateSummary(sentences);
    }

    res.json({
      success: true,
      data: results,
      metadata: {
        text_length: text.length,
        analysis_types: analysis_types,
        processed_at: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error in NLP analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Text analysis failed' 
    });
  }
};

// @desc    Get process optimization recommendations
// @route   GET /api/ai/optimize-process
// @access  Private
export const getProcessOptimizationRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { processName } = req.query;

    const recommendations = await IntelligentRecommendationSystem.generateProcessOptimizationRecommendations(
      companyId,
      processName as string
    );

    res.json({
      success: true,
      data: recommendations,
      summary: {
        total_processes: recommendations.length,
        high_impact_opportunities: recommendations.filter(r => r.potential_improvement > 20).length,
        average_improvement_potential: recommendations.reduce((sum, r) => sum + r.potential_improvement, 0) / recommendations.length
      }
    });
  } catch (error: any) {
    console.error('Error in process optimization:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Process optimization failed' 
    });
  }
};

// @desc    Get resource allocation recommendations
// @route   GET /api/ai/optimize-resources
// @access  Private
export const getResourceOptimizationRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { resourceType = 'financial' } = req.query;

    const recommendations = await IntelligentRecommendationSystem.generateResourceAllocationRecommendations(
      companyId,
      resourceType as 'human' | 'financial' | 'technological' | 'infrastructure'
    );

    res.json({
      success: true,
      data: recommendations,
      insights: {
        optimization_opportunities: recommendations.optimization_strategy.reallocations.length + 
                                  recommendations.optimization_strategy.new_investments.length,
        risk_level: recommendations.risk_analysis.overall_risk_level,
        total_risk_factors: recommendations.risk_analysis.risks.length
      }
    });
  } catch (error: any) {
    console.error('Error in resource optimization:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Resource optimization failed' 
    });
  }
};

// @desc    Get business decision recommendations
// @route   POST /api/ai/business-decision
// @access  Private
export const getBusinessDecisionRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { decisionContext, options } = req.body;

    if (!decisionContext || !options || !Array.isArray(options)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Decision context and options array required' 
      });
    }

    const recommendations = await IntelligentRecommendationSystem.generateBusinessDecisionRecommendations(
      companyId,
      decisionContext,
      options
    );

    res.json({
      success: true,
      data: recommendations,
      summary: {
        total_options: recommendations.options.length,
        recommended_option: recommendations.recommended_option,
        decision_confidence: recommendations.options.find(o => o.option_name === recommendations.recommended_option)?.confidence_score || 0
      }
    });
  } catch (error: any) {
    console.error('Error in business decision analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Business decision analysis failed' 
    });
  }
};

// @desc    Get personalized insights for user
// @route   GET /api/ai/personalized-insights
// @access  Private
export const getPersonalizedInsights = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    const userId = req.user?._id.toString();
    const userRole = req.user?.role || 'employee';
    const userDepartment = req.user?.department || 'general';

    if (!companyId || !userId) {
      return res.status(400).json({ success: false, message: 'User authentication required' });
    }

    const insights = await IntelligentRecommendationSystem.generatePersonalizedInsights(
      companyId,
      userId,
      userRole,
      userDepartment
    );

    res.json({
      success: true,
      data: insights,
      profile: {
        user_role: userRole,
        department: userDepartment,
        insight_count: insights.insights.length,
        priority_areas: insights.priority_areas.length
      }
    });
  } catch (error: any) {
    console.error('Error generating personalized insights:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Personalized insights generation failed' 
    });
  }
};

// @desc    Detect real-time anomalies
// @route   GET /api/ai/detect-anomalies
// @access  Private
export const detectRealTimeAnomalies = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { sensitivity = 'medium', lookbackPeriod = 30, detectionMethods = 'statistical,ensemble' } = req.query;

    const config = {
      sensitivity: sensitivity as 'low' | 'medium' | 'high',
      lookback_period: parseInt(lookbackPeriod as string),
      detection_methods: (detectionMethods as string).split(',') as Array<'statistical' | 'isolation_forest' | 'lstm' | 'ensemble'>,
      thresholds: {
        statistical: sensitivity === 'high' ? 2.0 : sensitivity === 'low' ? 3.0 : 2.5,
        isolation: 0.7,
        confidence: 0.8
      }
    };

    const anomalies = await AnomalyDetectionSystem.detectRealTimeAnomalies(companyId, config);

    res.json({
      success: true,
      data: anomalies,
      summary: {
        total_anomalies: anomalies.length,
        critical_anomalies: anomalies.filter(a => a.severity === 'critical').length,
        high_severity: anomalies.filter(a => a.severity === 'high').length,
        detection_config: config
      }
    });
  } catch (error: any) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Anomaly detection failed' 
    });
  }
};

// @desc    Get system health status
// @route   GET /api/ai/system-health
// @access  Private
export const getSystemHealthStatus = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const healthStatus = await AnomalyDetectionSystem.getSystemHealthStatus(companyId);

    res.json({
      success: true,
      data: healthStatus,
      timestamp: new Date(),
      recommendations: generateHealthRecommendations(healthStatus)
    });
  } catch (error: any) {
    console.error('Error getting system health:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'System health monitoring failed' 
    });
  }
};

// @desc    Generate smart alerts
// @route   GET /api/ai/smart-alerts
// @access  Private
export const generateSmartAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { alertTypes = 'performance,anomaly,opportunity,risk' } = req.query;
    const types = (alertTypes as string).split(',') as Array<'performance' | 'anomaly' | 'opportunity' | 'risk'>;

    const alerts = await AnomalyDetectionSystem.generateRealTimeAlerts(companyId, {
      anomaly_score: 0.7,
      business_impact: 'medium'
    });

    // Map alert types to match the expected types
    const alertTypeMapping: Record<string, string> = {
      'threshold': 'performance',
      'pattern': 'anomaly',
      'prediction': 'opportunity'
    };

    const filteredAlerts = alerts.filter(alert => {
      const mappedType = alertTypeMapping[alert.alert_type] || alert.alert_type;
      return types.includes(mappedType as any);
    });

    res.json({
      success: true,
      data: filteredAlerts,
      summary: {
        total_alerts: filteredAlerts.length,
        critical_alerts: filteredAlerts.filter(a => a.priority === 'critical').length,
        high_priority: filteredAlerts.filter(a => a.priority === 'high').length,
        escalation_required: filteredAlerts.filter(a => a.escalation_required).length
      }
    });
  } catch (error: any) {
    console.error('Error generating smart alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Smart alerts generation failed' 
    });
  }
};

// @desc    Intelligent task routing
// @route   POST /api/ai/route-task
// @access  Private
export const intelligentTaskRouting = async (req: AuthRequest, res: Response) => {
  try {
    const { taskDetails, availableAssignees } = req.body;

    if (!taskDetails || !availableAssignees) {
      return res.status(400).json({ 
        success: false, 
        message: 'Task details and available assignees required' 
      });
    }

    const companyId = req.user?.companyId || req.user?._id;
    const assignment = await AIAutomationEngine.intelligentTaskRouting(
      companyId!,
      taskDetails,
      availableAssignees
    );

    res.json({
      success: true,
      data: assignment,
      optimization: {
        match_confidence: assignment.optimal_assignment.match_score,
        alternatives_available: assignment.alternative_assignments.length,
        complexity_assessment: assignment.task_details.complexity
      }
    });
  } catch (error: any) {
    console.error('Error in intelligent task routing:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Task routing failed' 
    });
  }
};

// @desc    Generate automation rules
// @route   GET /api/ai/automation-rules
// @access  Private
export const generateAutomationRules = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const { context = 'all' } = req.query;

    const rules = await AIAutomationEngine.generateSmartAutomationRules(
      companyId,
      context as 'performance' | 'quality' | 'efficiency' | 'cost' | 'all'
    );

    res.json({
      success: true,
      data: rules,
      statistics: {
        total_rules: rules.length,
        high_priority: rules.filter(r => r.priority === 'high' || r.priority === 'critical').length,
        ai_generated: rules.filter(r => r.ai_generated).length,
        average_success_rate: rules.reduce((sum, r) => sum + r.success_rate, 0) / rules.length
      }
    });
  } catch (error: any) {
    console.error('Error generating automation rules:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Automation rules generation failed' 
    });
  }
};

// @desc    Get AI-powered dashboard data
// @route   GET /api/ai/dashboard
// @access  Private
export const getAIDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.user?._id;
    const userId = req.user?._id.toString();
    const userRole = req.user?.role || 'employee';

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    // Gather comprehensive AI insights
    const [
      forecast,
      anomalies,
      healthStatus,
      alerts,
      personalizedInsights
    ] = await Promise.all([
      PredictiveAnalyticsEngine.generateAdvancedForecast(companyId, undefined, { horizon: 7 }),
      AnomalyDetectionSystem.detectRealTimeAnomalies(companyId, { sensitivity: 'medium', lookback_period: 7 }),
      AnomalyDetectionSystem.getSystemHealthStatus(companyId),
      AnomalyDetectionSystem.generateRealTimeAlerts(companyId),
      IntelligentRecommendationSystem.generatePersonalizedInsights(companyId, userId!, userRole, req.user?.department || 'general')
    ]);

    const dashboardData = {
      ai_insights: {
        forecast_summary: {
          trend_direction: forecast.trend_analysis.direction,
          confidence: forecast.predictions.reduce((sum, p) => sum + p.confidence, 0) / forecast.predictions.length,
          key_predictions: forecast.predictions.slice(0, 3)
        },
        anomaly_summary: {
          total_anomalies: anomalies.length,
          critical_count: anomalies.filter(a => a.severity === 'critical').length,
          recent_patterns: anomalies.slice(0, 5).map(a => ({
            metric: a.metric_name,
            severity: a.severity,
            score: a.anomaly_score
          }))
        },
        system_health: {
          overall_status: healthStatus.overall_health,
          health_score: healthStatus.health_score,
          critical_issues: healthStatus.critical_issues,
          system_metrics: healthStatus.system_metrics
        },
        smart_alerts: {
          total_alerts: alerts.length,
          priority_distribution: {
            critical: alerts.filter(a => a.priority === 'critical').length,
            high: alerts.filter(a => a.priority === 'high').length,
            medium: alerts.filter(a => a.priority === 'medium').length,
            low: alerts.filter(a => a.priority === 'low').length
          },
          recent_alerts: alerts.slice(0, 5)
        },
        personalized: {
          priority_areas: personalizedInsights.priority_areas,
          actionable_insights: personalizedInsights.insights.filter(i => i.actionable).length,
          success_metrics: personalizedInsights.success_metrics.slice(0, 3)
        }
      },
      recommendations: {
        immediate_actions: generateImmediateActions(anomalies, alerts),
        optimization_opportunities: identifyOptimizationOpportunities(forecast, healthStatus),
        risk_mitigation: generateRiskMitigation(anomalies, alerts)
      },
      ai_automation: {
        active_rules: 15, // Mock - would come from actual automation rules
        successful_predictions: Math.round(forecast.model_performance.r_squared * 100),
        automation_coverage: 78 // Mock percentage
      }
    };

    res.json({
      success: true,
      data: dashboardData,
      generated_at: new Date(),
      user_context: {
        role: userRole,
        department: req.user?.department,
        personalization_level: 'high'
      }
    });
  } catch (error: any) {
    console.error('Error generating AI dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'AI dashboard generation failed' 
    });
  }
};

// Helper functions
function generateHealthRecommendations(healthStatus: any): string[] {
  const recommendations = [];
  
  if (healthStatus.overall_health === 'critical') {
    recommendations.push('Immediate intervention required - multiple critical issues detected');
    recommendations.push('Escalate to senior management and technical teams');
  } else if (healthStatus.overall_health === 'warning') {
    recommendations.push('Monitor system closely and address warning indicators');
    recommendations.push('Review and optimize underperforming processes');
  } else {
    recommendations.push('System performing well - maintain current strategies');
    recommendations.push('Consider scaling successful initiatives');
  }

  if (healthStatus.health_score < 70) {
    recommendations.push('Implement comprehensive system health improvement plan');
  }

  return recommendations;
}

function generateImmediateActions(anomalies: any[], alerts: any[]): string[] {
  const actions = [];
  
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
  if (criticalAnomalies.length > 0) {
    actions.push(`Address ${criticalAnomalies.length} critical anomalies immediately`);
  }

  const criticalAlerts = alerts.filter(a => a.priority === 'critical');
  if (criticalAlerts.length > 0) {
    actions.push(`Respond to ${criticalAlerts.length} critical alerts`);
  }

  if (actions.length === 0) {
    actions.push('Monitor ongoing performance and maintain current operations');
  }

  return actions;
}

function identifyOptimizationOpportunities(forecast: any, healthStatus: any): string[] {
  const opportunities = [];
  
  if (forecast.trend_analysis.direction === 'increasing') {
    opportunities.push('Scale successful processes to capitalize on positive trends');
  }

  if (healthStatus.health_score > 80) {
    opportunities.push('System performing well - consider expanding capabilities');
  }

  if (forecast.model_performance.r_squared > 0.8) {
    opportunities.push('High prediction accuracy - implement automated optimization');
  }

  return opportunities;
}

function generateRiskMitigation(anomalies: any[], alerts: any[]): string[] {
  const risks = [];
  
  const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical');
  if (highSeverityAnomalies.length > 3) {
    risks.push('Multiple high-severity anomalies - implement risk management protocols');
  }

  const escalationAlerts = alerts.filter(a => a.escalation_required);
  if (escalationAlerts.length > 0) {
    risks.push('Escalation required for critical issues - activate incident response');
  }

  return risks;
}

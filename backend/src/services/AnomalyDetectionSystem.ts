import { AIService, AnomalyResult } from './AIService';
import KPI, { IKPI } from '../models/KPI';
import { Types } from 'mongoose';

/**
 * Advanced Anomaly Detection System
 * Real-time detection of unusual patterns in business metrics and processes
 */

export interface AnomalyDetectionConfig {
  sensitivity: 'low' | 'medium' | 'high';
  lookback_period: number; // Days
  detection_methods: Array<'statistical' | 'isolation_forest' | 'lstm' | 'ensemble'>;
  thresholds: {
    statistical: number; // Standard deviations
    isolation: number;   // Isolation score threshold
    confidence: number;  // Minimum confidence level
  };
}

export interface AnomalyReport {
  anomaly_id: string;
  timestamp: Date;
  metric_name: string;
  metric_value: number;
  expected_range: {
    lower: number;
    upper: number;
  };
  anomaly_score: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detection_method: string;
  contributing_factors: Array<{
    factor: string;
    impact: number;
    explanation: string;
  }>;
  similar_incidents: Array<{
    date: Date;
    metric: string;
    similarity: number;
  }>;
  recommended_actions: string[];
  auto_resolved: boolean;
}

export interface SystemHealthStatus {
  overall_health: 'healthy' | 'warning' | 'critical';
  health_score: number; // 0-100
  active_anomalies: number;
  critical_issues: number;
  trending_concerns: Array<{
    concern: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    impact: number;
  }>;
  system_metrics: {
    data_quality: number;
    prediction_accuracy: number;
    response_time: number;
    uptime: number;
  };
}

export interface RealTimeAlert {
  alert_id: string;
  timestamp: Date;
  alert_type: 'anomaly' | 'threshold' | 'pattern' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_metrics: string[];
  business_impact: string;
  immediate_actions: string[];
  escalation_required: boolean;
  estimated_resolution_time: string;
}

export class AnomalyDetectionSystem {

  /**
   * Real-time Anomaly Detection
   */
  static async detectRealTimeAnomalies(
    companyId: Types.ObjectId | string,
    config: Partial<AnomalyDetectionConfig> = {}
  ): Promise<AnomalyReport[]> {
    try {
      const defaultConfig: AnomalyDetectionConfig = {
        sensitivity: 'medium',
        lookback_period: 30,
        detection_methods: ['statistical', 'ensemble'],
        thresholds: {
          statistical: 2.5,
          isolation: 0.7,
          confidence: 0.8
        },
        ...config
      };

      // Fetch recent data for analysis
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - defaultConfig.lookback_period);

      const recentKPIs = await KPI.find({
        companyId: companyId,
        isActive: true,
        date: { $gte: lookbackDate }
      }).sort({ date: 1 });

      if (recentKPIs.length < 10) {
        console.warn('Insufficient data for anomaly detection');
        return [];
      }

      const anomalies: AnomalyReport[] = [];

      // Group KPIs by metric name for time series analysis
      const metricGroups = this.groupKPIsByMetric(recentKPIs);

      for (const [metricName, kpis] of Object.entries(metricGroups)) {
        if (kpis.length < 5) continue; // Need minimum data points

        const metricAnomalies = await this.detectMetricAnomalies(
          metricName,
          kpis,
          defaultConfig
        );

        anomalies.push(...metricAnomalies);
      }

      // Sort by severity and timestamp
      return anomalies.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        return severityDiff !== 0 ? severityDiff : b.timestamp.getTime() - a.timestamp.getTime();
      });

    } catch (error: any) {
      console.error('Error in real-time anomaly detection:', error);
      throw new Error(`Anomaly detection failed: ${error.message}`);
    }
  }

  /**
   * Statistical Anomaly Detection
   */
  static async performStatisticalAnomalyDetection(
    companyId: Types.ObjectId | string,
    metricName?: string,
    threshold: number = 2.5
  ): Promise<AnomalyReport[]> {
    try {
      const filter: any = { companyId: companyId, isActive: true };
      if (metricName) filter.name = metricName;

      const kpis = await KPI.find(filter)
        .sort({ date: 1 })
        .limit(1000);

      const anomalies: AnomalyReport[] = [];
      const metricGroups = this.groupKPIsByMetric(kpis);

      for (const [metric, values] of Object.entries(metricGroups)) {
        const dataPoints = values.map(kpi => ({
          timestamp: kpi.date,
          value: kpi.value,
          metadata: { target: kpi.target, category: kpi.category }
        }));

        const { statistics } = AIService.preprocessTimeSeriesData(dataPoints);
        const { outliers, outlier_indices } = AIService.detectOutliers(
          dataPoints.map(p => p.value)
        );

        // Analyze outliers for anomalies
        for (const index of outlier_indices) {
          const kpi = values[index];
          const zScore = Math.abs((kpi.value - statistics.mean) / statistics.std);

          if (zScore > threshold) {
            anomalies.push({
              anomaly_id: this.generateAnomalyId(),
              timestamp: kpi.date,
              metric_name: metric,
              metric_value: kpi.value,
              expected_range: {
                lower: statistics.mean - threshold * statistics.std,
                upper: statistics.mean + threshold * statistics.std
              },
              anomaly_score: Math.min(1, zScore / 5), // Normalize to 0-1
              confidence: Math.min(0.95, 0.5 + zScore * 0.1),
              severity: this.calculateSeverity(zScore, threshold),
              detection_method: 'Statistical Z-Score',
              contributing_factors: this.identifyContributingFactors(kpi, statistics),
              similar_incidents: await this.findSimilarIncidents(companyId, kpi),
              recommended_actions: this.generateAnomalyActions(kpi, zScore),
              auto_resolved: false
            });
          }
        }
      }

      return anomalies;
    } catch (error: any) {
      console.error('Error in statistical anomaly detection:', error);
      throw new Error(`Statistical anomaly detection failed: ${error.message}`);
    }
  }

  /**
   * Pattern-based Anomaly Detection
   */
  static async detectPatternAnomalies(
    companyId: Types.ObjectId | string,
    patternTypes: Array<'trend_break' | 'seasonality_violation' | 'correlation_break'> = ['trend_break', 'seasonality_violation']
  ): Promise<AnomalyReport[]> {
    try {
      const anomalies: AnomalyReport[] = [];
      
      const recentKPIs = await KPI.find({
        companyId: companyId,
        isActive: true,
        date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } // Last 60 days
      }).sort({ date: 1 });

      const metricGroups = this.groupKPIsByMetric(recentKPIs);

      for (const [metricName, kpis] of Object.entries(metricGroups)) {
        if (kpis.length < 14) continue; // Need at least 2 weeks of data

        const values = kpis.map(k => k.value);
        const timestamps = kpis.map(k => k.date);

        // Detect trend breaks
        if (patternTypes.includes('trend_break')) {
          const trendAnomalies = this.detectTrendBreaks(metricName, values, timestamps, kpis);
          anomalies.push(...trendAnomalies);
        }

        // Detect seasonality violations
        if (patternTypes.includes('seasonality_violation')) {
          const seasonalAnomalies = this.detectSeasonalityViolations(metricName, values, timestamps, kpis);
          anomalies.push(...seasonalAnomalies);
        }

        // Detect correlation breaks (requires multiple metrics)
        if (patternTypes.includes('correlation_break') && Object.keys(metricGroups).length > 1) {
          const correlationAnomalies = this.detectCorrelationBreaks(metricName, metricGroups);
          anomalies.push(...correlationAnomalies);
        }
      }

      return anomalies;
    } catch (error: any) {
      console.error('Error in pattern anomaly detection:', error);
      throw new Error(`Pattern anomaly detection failed: ${error.message}`);
    }
  }

  /**
   * System Health Monitoring
   */
  static async getSystemHealthStatus(
    companyId: Types.ObjectId | string
  ): Promise<SystemHealthStatus> {
    try {
      // Get recent anomalies
      const recentAnomalies = await this.detectRealTimeAnomalies(companyId, {
        lookback_period: 7,
        sensitivity: 'medium'
      });

      const active_anomalies = recentAnomalies.length;
      const critical_issues = recentAnomalies.filter(a => a.severity === 'critical').length;

      // Calculate health score
      const health_score = this.calculateHealthScore(recentAnomalies);
      
      // Determine overall health
      let overall_health: 'healthy' | 'warning' | 'critical';
      if (health_score >= 80 && critical_issues === 0) {
        overall_health = 'healthy';
      } else if (health_score >= 60 && critical_issues <= 2) {
        overall_health = 'warning';
      } else {
        overall_health = 'critical';
      }

      // Identify trending concerns
      const trending_concerns = await this.identifyTrendingConcerns(companyId);

      // Calculate system metrics
      const system_metrics = await this.calculateSystemMetrics(companyId);

      return {
        overall_health,
        health_score,
        active_anomalies,
        critical_issues,
        trending_concerns,
        system_metrics
      };
    } catch (error: any) {
      console.error('Error getting system health status:', error);
      throw new Error(`System health monitoring failed: ${error.message}`);
    }
  }

  /**
   * Generate Real-time Alerts
   */
  static async generateRealTimeAlerts(
    companyId: Types.ObjectId | string,
    alertThresholds?: {
      anomaly_score: number;
      business_impact: 'low' | 'medium' | 'high';
    }
  ): Promise<RealTimeAlert[]> {
    try {
      const thresholds = {
        anomaly_score: 0.7,
        business_impact: 'medium',
        ...alertThresholds
      };

      const alerts: RealTimeAlert[] = [];
      
      // Get recent anomalies that meet threshold criteria
      const anomalies = await this.detectRealTimeAnomalies(companyId, {
        sensitivity: 'high',
        lookback_period: 1 // Last 24 hours
      });

      const significantAnomalies = anomalies.filter(a => 
        a.anomaly_score >= thresholds.anomaly_score ||
        a.severity === 'critical' ||
        a.severity === 'high'
      );

      // Generate anomaly alerts
      significantAnomalies.forEach(anomaly => {
        alerts.push({
          alert_id: this.generateAlertId(),
          timestamp: new Date(),
          alert_type: 'anomaly',
          priority: this.mapSeverityToPriority(anomaly.severity),
          title: `Anomaly Detected: ${anomaly.metric_name}`,
          description: `${anomaly.metric_name} shows unusual behavior with ${(anomaly.anomaly_score * 100).toFixed(1)}% anomaly score`,
          affected_metrics: [anomaly.metric_name],
          business_impact: this.assessBusinessImpact(anomaly),
          immediate_actions: anomaly.recommended_actions.slice(0, 3),
          escalation_required: anomaly.severity === 'critical',
          estimated_resolution_time: this.estimateResolutionTime(anomaly.severity)
        });
      });

      // Generate threshold breach alerts
      const thresholdAlerts = await this.generateThresholdAlerts(companyId);
      alerts.push(...thresholdAlerts);

      // Generate prediction-based alerts
      const predictionAlerts = await this.generatePredictionAlerts(companyId);
      alerts.push(...predictionAlerts);

      return alerts.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error: any) {
      console.error('Error generating real-time alerts:', error);
      throw new Error(`Real-time alert generation failed: ${error.message}`);
    }
  }

  /**
   * Private Helper Methods
   */
  private static groupKPIsByMetric(kpis: IKPI[]): Record<string, IKPI[]> {
    return kpis.reduce((groups, kpi) => {
      if (!groups[kpi.name]) {
        groups[kpi.name] = [];
      }
      groups[kpi.name].push(kpi);
      return groups;
    }, {} as Record<string, IKPI[]>);
  }

  private static async detectMetricAnomalies(
    metricName: string,
    kpis: IKPI[],
    config: AnomalyDetectionConfig
  ): Promise<AnomalyReport[]> {
    const anomalies: AnomalyReport[] = [];
    const values = kpis.map(k => k.value);
    
    // Statistical detection
    if (config.detection_methods.includes('statistical')) {
      const { statistics } = AIService.preprocessTimeSeriesData(
        kpis.map(k => ({ timestamp: k.date, value: k.value }))
      );

      const threshold = config.thresholds.statistical;
      
      kpis.forEach((kpi, index) => {
        const zScore = Math.abs((kpi.value - statistics.mean) / statistics.std);
        
        if (zScore > threshold) {
          anomalies.push({
            anomaly_id: this.generateAnomalyId(),
            timestamp: kpi.date,
            metric_name: metricName,
            metric_value: kpi.value,
            expected_range: {
              lower: statistics.mean - threshold * statistics.std,
              upper: statistics.mean + threshold * statistics.std
            },
            anomaly_score: Math.min(1, zScore / 5),
            confidence: Math.min(0.95, 0.6 + zScore * 0.1),
            severity: this.calculateSeverity(zScore, threshold),
            detection_method: 'Statistical Analysis',
            contributing_factors: this.identifyContributingFactors(kpi, statistics),
            similar_incidents: [],
            recommended_actions: this.generateAnomalyActions(kpi, zScore),
            auto_resolved: false
          });
        }
      });
    }

    // Isolation Forest detection (simplified)
    if (config.detection_methods.includes('isolation_forest')) {
      const isolationAnomalies = this.performIsolationForestDetection(metricName, kpis);
      anomalies.push(...isolationAnomalies);
    }

    return anomalies;
  }

  private static performIsolationForestDetection(
    metricName: string,
    kpis: IKPI[]
  ): AnomalyReport[] {
    const anomalies: AnomalyReport[] = [];
    
    // Simplified isolation forest implementation
    const values = kpis.map(k => k.value);
    const { mean, std } = this.calculateBasicStats(values);
    
    kpis.forEach(kpi => {
      // Simplified isolation score calculation
      const isolationScore = Math.abs(kpi.value - mean) / (std * Math.sqrt(values.length));
      
      if (isolationScore > 0.8) {
        anomalies.push({
          anomaly_id: this.generateAnomalyId(),
          timestamp: kpi.date,
          metric_name: metricName,
          metric_value: kpi.value,
          expected_range: {
            lower: mean - 2 * std,
            upper: mean + 2 * std
          },
          anomaly_score: Math.min(1, isolationScore),
          confidence: 0.7,
          severity: isolationScore > 1.2 ? 'high' : 'medium',
          detection_method: 'Isolation Forest',
          contributing_factors: [
            {
              factor: 'Statistical Isolation',
              impact: isolationScore,
              explanation: 'Value significantly isolated from normal distribution'
            }
          ],
          similar_incidents: [],
          recommended_actions: ['Verify data accuracy', 'Investigate underlying causes'],
          auto_resolved: false
        });
      }
    });

    return anomalies;
  }

  private static detectTrendBreaks(
    metricName: string,
    values: number[],
    timestamps: Date[],
    kpis: IKPI[]
  ): AnomalyReport[] {
    const anomalies: AnomalyReport[] = [];
    
    if (values.length < 10) return anomalies;

    // Calculate moving trends
    const windowSize = Math.min(7, Math.floor(values.length / 3));
    const trends = [];
    
    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const x = window.map((_, idx) => idx);
      const regression = AIService.performLinearRegression(x, window);
      trends.push(regression.slope);
    }

    // Detect significant trend changes
    for (let i = 1; i < trends.length; i++) {
      const trendChange = Math.abs(trends[i] - trends[i - 1]);
      const avgTrend = trends.reduce((a, b) => a + b, 0) / trends.length;
      const trendStd = this.calculateStandardDeviation(trends);
      
      if (trendChange > Math.abs(avgTrend) + 2 * trendStd) {
        const anomalyIndex = i + windowSize;
        if (anomalyIndex < kpis.length) {
          anomalies.push({
            anomaly_id: this.generateAnomalyId(),
            timestamp: kpis[anomalyIndex].date,
            metric_name: metricName,
            metric_value: kpis[anomalyIndex].value,
            expected_range: {
              lower: values[anomalyIndex] - trendStd,
              upper: values[anomalyIndex] + trendStd
            },
            anomaly_score: Math.min(1, trendChange / (Math.abs(avgTrend) + trendStd)),
            confidence: 0.75,
            severity: 'medium',
            detection_method: 'Trend Break Analysis',
            contributing_factors: [
              {
                factor: 'Trend Discontinuity',
                impact: trendChange,
                explanation: 'Significant change in metric trend pattern'
              }
            ],
            similar_incidents: [],
            recommended_actions: [
              'Analyze external factors affecting trend',
              'Review process changes around this time'
            ],
            auto_resolved: false
          });
        }
      }
    }

    return anomalies;
  }

  private static detectSeasonalityViolations(
    metricName: string,
    values: number[],
    timestamps: Date[],
    kpis: IKPI[]
  ): AnomalyReport[] {
    const anomalies: AnomalyReport[] = [];
    
    if (values.length < 14) return anomalies; // Need at least 2 weeks

    // Detect weekly seasonality
    const { seasonal, seasonal_strength } = AIService.detectSeasonality(values, 7);
    
    if (seasonal_strength > 0.3) { // Significant seasonality detected
      kpis.forEach((kpi, index) => {
        if (index < seasonal.length) {
          const expectedSeasonal = seasonal[index];
          const actualValue = kpi.value;
          const deviation = Math.abs(actualValue - expectedSeasonal);
          const threshold = this.calculateStandardDeviation(values) * 1.5;
          
          if (deviation > threshold) {
            anomalies.push({
              anomaly_id: this.generateAnomalyId(),
              timestamp: kpi.date,
              metric_name: metricName,
              metric_value: actualValue,
              expected_range: {
                lower: expectedSeasonal - threshold,
                upper: expectedSeasonal + threshold
              },
              anomaly_score: Math.min(1, deviation / threshold),
              confidence: seasonal_strength,
              severity: deviation > threshold * 2 ? 'high' : 'medium',
              detection_method: 'Seasonality Analysis',
              contributing_factors: [
                {
                  factor: 'Seasonal Pattern Violation',
                  impact: deviation / threshold,
                  explanation: 'Value deviates significantly from expected seasonal pattern'
                }
              ],
              similar_incidents: [],
              recommended_actions: [
                'Check for calendar events or external factors',
                'Verify seasonal adjustment models'
              ],
              auto_resolved: false
            });
          }
        }
      });
    }

    return anomalies;
  }

  private static detectCorrelationBreaks(
    metricName: string,
    metricGroups: Record<string, IKPI[]>
  ): AnomalyReport[] {
    const anomalies: AnomalyReport[] = [];
    
    // Find metrics that typically correlate with the current metric
    const currentMetric = metricGroups[metricName];
    if (!currentMetric || currentMetric.length < 10) return anomalies;

    const currentValues = currentMetric.map(k => k.value);
    
    Object.entries(metricGroups).forEach(([otherMetricName, otherKpis]) => {
      if (otherMetricName === metricName || otherKpis.length !== currentMetric.length) return;
      
      const otherValues = otherKpis.map(k => k.value);
      const correlation = AIService.calculateCorrelation(currentValues, otherValues);
      
      // If historically correlated (>0.6), check for recent breaks
      if (Math.abs(correlation) > 0.6) {
        const recentCorrelation = this.calculateRecentCorrelation(
          currentValues.slice(-7), // Last 7 data points
          otherValues.slice(-7)
        );
        
        const correlationBreak = Math.abs(correlation - recentCorrelation);
        
        if (correlationBreak > 0.4) {
          anomalies.push({
            anomaly_id: this.generateAnomalyId(),
            timestamp: currentMetric[currentMetric.length - 1].date,
            metric_name: metricName,
            metric_value: currentMetric[currentMetric.length - 1].value,
            expected_range: {
              lower: 0,
              upper: 0
            },
            anomaly_score: correlationBreak,
            confidence: 0.6,
            severity: 'medium',
            detection_method: 'Correlation Analysis',
            contributing_factors: [
              {
                factor: 'Correlation Break',
                impact: correlationBreak,
                explanation: `Correlation with ${otherMetricName} significantly changed`
              }
            ],
            similar_incidents: [],
            recommended_actions: [
              'Investigate relationship changes between metrics',
              'Check for external factors affecting correlation'
            ],
            auto_resolved: false
          });
        }
      }
    });

    return anomalies;
  }

  private static calculateHealthScore(anomalies: AnomalyReport[]): number {
    if (anomalies.length === 0) return 100;

    const severityWeights = { critical: 10, high: 5, medium: 2, low: 1 };
    const totalWeight = anomalies.reduce((sum, anomaly) => 
      sum + severityWeights[anomaly.severity], 0
    );

    // Health score decreases with weighted anomaly count
    const baseScore = Math.max(0, 100 - totalWeight * 2);
    
    // Adjust for confidence levels
    const avgConfidence = anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length;
    
    return Math.round(baseScore * avgConfidence);
  }

  private static async identifyTrendingConcerns(
    companyId: Types.ObjectId | string
  ): Promise<Array<{
    concern: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    impact: number;
  }>> {
    // Simplified implementation
    return [
      {
        concern: 'Performance Degradation',
        trend: 'increasing',
        impact: 0.7
      },
      {
        concern: 'Data Quality Issues',
        trend: 'stable',
        impact: 0.3
      }
    ];
  }

  private static async calculateSystemMetrics(
    companyId: Types.ObjectId | string
  ): Promise<{
    data_quality: number;
    prediction_accuracy: number;
    response_time: number;
    uptime: number;
  }> {
    // Mock implementation - would calculate real metrics
    return {
      data_quality: 92,
      prediction_accuracy: 87,
      response_time: 150, // ms
      uptime: 99.8
    };
  }

  private static async generateThresholdAlerts(
    companyId: Types.ObjectId | string
  ): Promise<RealTimeAlert[]> {
    const alerts: RealTimeAlert[] = [];
    
    // Get KPIs that are significantly below target
    const underperformingKPIs = await KPI.find({
      companyId: companyId,
      isActive: true,
      date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      $expr: {
        $lt: ['$value', { $multiply: ['$target', 0.8] }] // Less than 80% of target
      }
    });

    underperformingKPIs.forEach(kpi => {
      const achievement = (kpi.value / kpi.target) * 100;
      
      alerts.push({
        alert_id: this.generateAlertId(),
        timestamp: new Date(),
        alert_type: 'threshold',
        priority: achievement < 50 ? 'critical' : achievement < 70 ? 'high' : 'medium',
        title: `Threshold Breach: ${kpi.name}`,
        description: `${kpi.name} is at ${achievement.toFixed(1)}% of target`,
        affected_metrics: [kpi.name],
        business_impact: achievement < 50 ? 'Critical business impact' : 'Moderate impact on performance',
        immediate_actions: [
          'Review current performance',
          'Identify improvement opportunities',
          'Implement corrective measures'
        ],
        escalation_required: achievement < 40,
        estimated_resolution_time: achievement < 50 ? '1-2 days' : '3-5 days'
      });
    });

    return alerts;
  }

  private static async generatePredictionAlerts(
    companyId: Types.ObjectId | string
  ): Promise<RealTimeAlert[]> {
    // Simplified prediction-based alerts
    const alerts: RealTimeAlert[] = [];
    
    // Mock prediction that identifies potential future issues
    alerts.push({
      alert_id: this.generateAlertId(),
      timestamp: new Date(),
      alert_type: 'prediction',
      priority: 'medium',
      title: 'Predicted Performance Decline',
      description: 'AI model predicts 15% performance decline in next 7 days',
      affected_metrics: ['Revenue', 'Customer Satisfaction'],
      business_impact: 'Potential revenue loss if trend continues',
      immediate_actions: [
        'Review trending factors',
        'Implement preventive measures',
        'Monitor closely'
      ],
      escalation_required: false,
      estimated_resolution_time: '5-7 days'
    });

    return alerts;
  }

  private static generateAnomalyId(): string {
    return `ANOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateAlertId(): string {
    return `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateSeverity(score: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = score / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  private static identifyContributingFactors(kpi: IKPI, statistics: any): Array<{
    factor: string;
    impact: number;
    explanation: string;
  }> {
    const factors = [];
    
    if (kpi.value > statistics.mean + 2 * statistics.std) {
      factors.push({
        factor: 'Unusually High Value',
        impact: (kpi.value - statistics.mean) / statistics.std,
        explanation: 'Value significantly above historical average'
      });
    }
    
    if (kpi.value < statistics.mean - 2 * statistics.std) {
      factors.push({
        factor: 'Unusually Low Value',
        impact: (statistics.mean - kpi.value) / statistics.std,
        explanation: 'Value significantly below historical average'
      });
    }

    return factors;
  }

  private static async findSimilarIncidents(
    companyId: Types.ObjectId | string,
    currentKPI: IKPI
  ): Promise<Array<{
    date: Date;
    metric: string;
    similarity: number;
  }>> {
    // Simplified similar incident detection
    return [];
  }

  private static generateAnomalyActions(kpi: IKPI, score: number): string[] {
    const actions = ['Verify data accuracy', 'Investigate root cause'];
    
    if (score > 3) {
      actions.push('Immediate escalation required');
      actions.push('Implement emergency measures');
    } else if (score > 2) {
      actions.push('Schedule detailed analysis');
      actions.push('Monitor closely');
    }

    return actions;
  }

  private static mapSeverityToPriority(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    return severity as 'low' | 'medium' | 'high' | 'critical';
  }

  private static assessBusinessImpact(anomaly: AnomalyReport): string {
    const impactMap = {
      critical: 'Severe business impact - immediate attention required',
      high: 'Significant impact on business operations',
      medium: 'Moderate impact on performance metrics',
      low: 'Minor deviation from normal patterns'
    };
    
    return impactMap[anomaly.severity];
  }

  private static estimateResolutionTime(severity: string): string {
    const timeMap = {
      critical: '1-4 hours',
      high: '4-24 hours',
      medium: '1-3 days',
      low: '3-7 days'
    };
    
    return timeMap[severity as keyof typeof timeMap] || '1-3 days';
  }

  private static calculateBasicStats(values: number[]): { mean: number; std: number } {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    return { mean, std };
  }

  private static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static calculateRecentCorrelation(values1: number[], values2: number[]): number {
    return AIService.calculateCorrelation(values1, values2);
  }
}

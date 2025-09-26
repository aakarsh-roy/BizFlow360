import { AIService, PredictionResult, AnomalyResult, RecommendationResult } from './AIService';

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: string;
  timestamp: Date;
  historicalData: Array<{ timestamp: Date; value: number }>;
}

export interface AIKPIInsight {
  metricId: string;
  type: 'anomaly' | 'prediction' | 'recommendation' | 'correlation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data?: any;
  actionItems: string[];
  expectedImpact?: string;
  timeframe?: string;
}

export interface PredictiveAnalytics {
  forecasts: Array<{
    metricId: string;
    predictions: PredictionResult[];
    scenario: 'best_case' | 'worst_case' | 'most_likely';
    timeframe: '1_week' | '1_month' | '3_months' | '6_months';
  }>;
  trends: Array<{
    metricId: string;
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    strength: number;
    significance: number;
    changePoints: Date[];
  }>;
  correlations: Array<{
    metric1: string;
    metric2: string;
    correlation: number;
    significance: number;
    relationship: string;
  }>;
}

export interface AnomalyDetection {
  anomalies: Array<{
    metricId: string;
    timestamp: Date;
    value: number;
    expectedValue: number;
    deviation: number;
    anomalyResult: AnomalyResult;
    possibleCauses: string[];
    recommendations: string[];
  }>;
  patterns: Array<{
    type: 'seasonal' | 'cyclical' | 'trend' | 'outlier';
    description: string;
    confidence: number;
    affectedMetrics: string[];
  }>;
}

export interface BusinessIntelligence {
  insights: AIKPIInsight[];
  recommendations: RecommendationResult[];
  alerts: Array<{
    id: string;
    type: 'performance' | 'anomaly' | 'target' | 'trend';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    actionRequired: boolean;
  }>;
  optimization: Array<{
    area: string;
    currentPerformance: number;
    potentialImprovement: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    steps: string[];
  }>;
}

export class AIKPIDashboardService {

  /**
   * Generate comprehensive AI insights for KPI metrics
   */
  static async generateKPIInsights(metrics: KPIMetric[]): Promise<{
    predictiveAnalytics: PredictiveAnalytics;
    anomalyDetection: AnomalyDetection;
    businessIntelligence: BusinessIntelligence;
  }> {
    
    const predictiveAnalytics = await this.generatePredictiveAnalytics(metrics);
    const anomalyDetection = this.detectAnomalies(metrics);
    const businessIntelligence = this.generateBusinessIntelligence(metrics, predictiveAnalytics, anomalyDetection);
    
    return {
      predictiveAnalytics,
      anomalyDetection,
      businessIntelligence
    };
  }

  /**
   * Generate predictive analytics for metrics
   */
  private static async generatePredictiveAnalytics(metrics: KPIMetric[]): Promise<PredictiveAnalytics> {
    const forecasts = await Promise.all(
      metrics.map(async (metric) => {
        const predictions = await this.generateMetricForecast(metric);
        return {
          metricId: metric.id,
          predictions,
          scenario: 'most_likely' as const,
          timeframe: '1_month' as const
        };
      })
    );

    const trends = metrics.map(metric => this.analyzeTrend(metric));
    const correlations = this.findCorrelations(metrics);

    return {
      forecasts,
      trends,
      correlations
    };
  }

  /**
   * Generate forecast for a specific metric
   */
  private static async generateMetricForecast(metric: KPIMetric): Promise<PredictionResult[]> {
    const historicalData = metric.historicalData.map(d => d.value);
    const timestamps = metric.historicalData.map(d => d.timestamp);
    
    if (historicalData.length < 3) {
      return [{
        predicted_value: metric.value,
        confidence: 0.5,
        trend: 'stable',
        factors: ['Insufficient historical data'],
        accuracy_score: 0.5
      }];
    }

    // Simple linear regression for trend prediction
    const x = historicalData.map((_, i) => i);
    const regression = AIService.performLinearRegression(x, historicalData);
    
    // Generate predictions for next 30 days
    const predictions: PredictionResult[] = [];
    const lastIndex = historicalData.length - 1;
    
    for (let i = 1; i <= 30; i++) {
      const predictedValue = regression.slope * (lastIndex + i) + regression.intercept;
      const confidence = Math.max(0.3, regression.r_squared);
      
      predictions.push({
        predicted_value: Math.max(0, predictedValue),
        confidence,
        trend: regression.slope > 0.1 ? 'increasing' : regression.slope < -0.1 ? 'decreasing' : 'stable',
        factors: this.identifyPredictionFactors(metric, regression),
        accuracy_score: confidence
      });
    }

    return predictions;
  }

  /**
   * Analyze trend for a metric
   */
  private static analyzeTrend(metric: KPIMetric) {
    const values = metric.historicalData.map(d => d.value);
    const recentValues = values.slice(-7); // Last 7 data points
    
    if (recentValues.length < 2) {
      return {
        metricId: metric.id,
        direction: 'stable' as const,
        strength: 0,
        significance: 0,
        changePoints: []
      };
    }

    const slope = this.calculateSlope(recentValues);
    const volatility = this.calculateVolatility(recentValues);
    
    let direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    if (volatility > 0.3) {
      direction = 'volatile';
    } else if (slope > 0.05) {
      direction = 'increasing';
    } else if (slope < -0.05) {
      direction = 'decreasing';
    } else {
      direction = 'stable';
    }

    const strength = Math.abs(slope);
    const significance = Math.min(1, strength / volatility || 0);

    // Simple change point detection
    const changePoints = this.detectChangePoints(metric.historicalData);

    return {
      metricId: metric.id,
      direction,
      strength,
      significance,
      changePoints
    };
  }

  /**
   * Find correlations between metrics
   */
  private static findCorrelations(metrics: KPIMetric[]) {
    const correlations: Array<{
      metric1: string;
      metric2: string;
      correlation: number;
      significance: number;
      relationship: string;
    }> = [];

    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const correlation = this.calculateCorrelation(
          metric1.historicalData.map(d => d.value),
          metric2.historicalData.map(d => d.value)
        );

        if (Math.abs(correlation) > 0.3) { // Only significant correlations
          correlations.push({
            metric1: metric1.id,
            metric2: metric2.id,
            correlation,
            significance: Math.abs(correlation),
            relationship: this.interpretCorrelation(correlation, metric1.name, metric2.name)
          });
        }
      }
    }

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Detect anomalies in metrics
   */
  private static detectAnomalies(metrics: KPIMetric[]): AnomalyDetection {
    const anomalies: AnomalyDetection['anomalies'] = [];
    const patterns: AnomalyDetection['patterns'] = [];

    metrics.forEach(metric => {
      const values = metric.historicalData.map(d => d.value);
      const timestamps = metric.historicalData.map(d => d.timestamp);
      
      if (values.length < 5) return;

      // Statistical anomaly detection using z-score
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

      values.forEach((value, index) => {
        const zScore = Math.abs((value - mean) / (std || 1));
        
        if (zScore > 2.5) { // Anomaly threshold
          const expectedValue = mean;
          const deviation = value - expectedValue;
          
          const anomalyResult: AnomalyResult = {
            is_anomaly: true,
            anomaly_score: zScore / 3, // Normalize to 0-1
            threshold: 2.5,
            explanation: `Value deviates ${zScore.toFixed(1)} standard deviations from mean`,
            severity: zScore > 3 ? 'critical' : zScore > 2.8 ? 'high' : 'medium'
          };

          anomalies.push({
            metricId: metric.id,
            timestamp: timestamps[index],
            value,
            expectedValue,
            deviation,
            anomalyResult,
            possibleCauses: this.identifyAnomalyCauses(metric, value, mean),
            recommendations: this.generateAnomalyRecommendations(metric, anomalyResult)
          });
        }
      });

      // Pattern detection
      const seasonality = this.detectSeasonality(values);
      if (seasonality.isPresent) {
        patterns.push({
          type: 'seasonal',
          description: `${metric.name} shows seasonal pattern with period of ${seasonality.period} data points`,
          confidence: seasonality.confidence,
          affectedMetrics: [metric.id]
        });
      }

      const trendPattern = this.detectTrendPattern(values);
      if (trendPattern.significance > 0.7) {
        patterns.push({
          type: 'trend',
          description: `${metric.name} shows ${trendPattern.direction} trend`,
          confidence: trendPattern.significance,
          affectedMetrics: [metric.id]
        });
      }
    });

    return { anomalies, patterns };
  }

  /**
   * Generate business intelligence insights
   */
  private static generateBusinessIntelligence(
    metrics: KPIMetric[],
    predictiveAnalytics: PredictiveAnalytics,
    anomalyDetection: AnomalyDetection
  ): BusinessIntelligence {
    
    const insights: AIKPIInsight[] = [];
    const recommendations: RecommendationResult[] = [];
    const alerts: BusinessIntelligence['alerts'] = [];
    const optimization: BusinessIntelligence['optimization'] = [];

    // Generate insights from predictions
    predictiveAnalytics.forecasts.forEach(forecast => {
      const metric = metrics.find(m => m.id === forecast.metricId);
      if (!metric) return;

      const avgPrediction = forecast.predictions.reduce((sum, p) => sum + p.predicted_value, 0) / forecast.predictions.length;
      const trend = forecast.predictions[0]?.trend || 'stable';

      if (trend === 'decreasing' && metric.category === 'revenue') {
        insights.push({
          metricId: metric.id,
          type: 'prediction',
          title: 'Revenue Decline Predicted',
          description: `AI models predict a ${((metric.value - avgPrediction) / metric.value * 100).toFixed(1)}% decline in ${metric.name} over the next month`,
          severity: 'high',
          confidence: forecast.predictions[0]?.confidence || 0.5,
          actionItems: [
            'Review marketing strategies',
            'Analyze customer feedback',
            'Consider promotional campaigns'
          ],
          expectedImpact: 'Prevent potential revenue loss',
          timeframe: '1 month'
        });

        alerts.push({
          id: `alert-${Date.now()}-${metric.id}`,
          type: 'trend',
          title: 'Revenue Decline Alert',
          message: `Predicted decline in ${metric.name}`,
          severity: 'high',
          timestamp: new Date(),
          actionRequired: true
        });
      }
    });

    // Generate insights from anomalies
    anomalyDetection.anomalies.forEach(anomaly => {
      const metric = metrics.find(m => m.id === anomaly.metricId);
      if (!metric) return;

      insights.push({
        metricId: anomaly.metricId,
        type: 'anomaly',
        title: 'Unusual Pattern Detected',
        description: `${metric?.name} showed unusual behavior: ${anomaly.anomalyResult.explanation}`,
        severity: anomaly.anomalyResult.severity,
        confidence: 1 - anomaly.anomalyResult.anomaly_score,
        actionItems: anomaly.recommendations,
        timeframe: 'immediate'
      });

      if (anomaly.anomalyResult.severity === 'critical') {
        alerts.push({
          id: `alert-${Date.now()}-${anomaly.metricId}`,
          type: 'anomaly',
          title: 'Critical Anomaly Detected',
          message: `Unusual spike/drop in ${metric?.name}`,
          severity: 'critical',
          timestamp: anomaly.timestamp,
          actionRequired: true
        });
      }
    });

    // Generate optimization suggestions
    metrics.forEach(metric => {
      if (metric.value < metric.target * 0.8) { // 20% below target
        const improvement = ((metric.target - metric.value) / metric.value) * 100;
        
        optimization.push({
          area: metric.name,
          currentPerformance: (metric.value / metric.target) * 100,
          potentialImprovement: improvement,
          effort: improvement > 50 ? 'high' : improvement > 20 ? 'medium' : 'low',
          timeline: improvement > 50 ? '3-6 months' : '1-3 months',
          steps: this.generateOptimizationSteps(metric)
        });
      }
    });

    // Generate correlation insights
    predictiveAnalytics.correlations.forEach(corr => {
      if (Math.abs(corr.correlation) > 0.7) {
        const metric1 = metrics.find(m => m.id === corr.metric1);
        const metric2 = metrics.find(m => m.id === corr.metric2);
        
        if (metric1 && metric2) {
          insights.push({
            metricId: corr.metric1,
            type: 'correlation',
            title: 'Strong Correlation Detected',
            description: corr.relationship,
            severity: 'medium',
            confidence: corr.significance,
            actionItems: [
              `Monitor ${metric2.name} when optimizing ${metric1.name}`,
              'Consider joint optimization strategies',
              'Track correlation strength over time'
            ]
          });
        }
      }
    });

    return {
      insights: insights.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      recommendations,
      alerts: alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      optimization: optimization.sort((a, b) => b.potentialImprovement - a.potentialImprovement)
    };
  }

  // Helper methods
  private static calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const x = values.map((_, i) => i);
    const regression = AIService.performLinearRegression(x, values);
    return regression.slope;
  }

  private static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static detectChangePoints(data: Array<{ timestamp: Date; value: number }>): Date[] {
    // Simple change point detection based on significant slope changes
    const changePoints: Date[] = [];
    const values = data.map(d => d.value);
    
    for (let i = 2; i < values.length - 2; i++) {
      const beforeSlope = (values[i] - values[i-2]) / 2;
      const afterSlope = (values[i+2] - values[i]) / 2;
      
      if (Math.abs(beforeSlope - afterSlope) > Math.abs(beforeSlope) * 0.5) {
        changePoints.push(data[i].timestamp);
      }
    }
    
    return changePoints;
  }

  private static detectSeasonality(values: number[]): { isPresent: boolean; period: number; confidence: number } {
    // Simple autocorrelation-based seasonality detection
    if (values.length < 12) return { isPresent: false, period: 0, confidence: 0 };
    
    let maxCorrelation = 0;
    let bestPeriod = 0;
    
    for (let period = 2; period <= Math.min(values.length / 2, 24); period++) {
      const correlation = this.calculateSeasonalCorrelation(values, period);
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }
    
    return {
      isPresent: maxCorrelation > 0.3,
      period: bestPeriod,
      confidence: maxCorrelation
    };
  }

  private static calculateSeasonalCorrelation(values: number[], period: number): number {
    const pairs: Array<[number, number]> = [];
    
    for (let i = period; i < values.length; i++) {
      pairs.push([values[i - period], values[i]]);
    }
    
    if (pairs.length < 2) return 0;
    
    const x = pairs.map(pair => pair[0]);
    const y = pairs.map(pair => pair[1]);
    
    return Math.abs(this.calculateCorrelation(x, y));
  }

  private static detectTrendPattern(values: number[]): { direction: string; significance: number } {
    if (values.length < 3) return { direction: 'stable', significance: 0 };
    
    const x = values.map((_, i) => i);
    const regression = AIService.performLinearRegression(x, values);
    
    const direction = regression.slope > 0.1 ? 'increasing' : regression.slope < -0.1 ? 'decreasing' : 'stable';
    const significance = regression.r_squared;
    
    return { direction, significance };
  }

  private static identifyPredictionFactors(metric: KPIMetric, regression: any): string[] {
    const factors = ['Historical trend'];
    
    if (regression.r_squared > 0.8) factors.push('Strong historical pattern');
    if (regression.slope > 0) factors.push('Positive growth trend');
    if (regression.slope < 0) factors.push('Declining trend');
    if (metric.category === 'revenue') factors.push('Market conditions');
    if (metric.category === 'performance') factors.push('System optimizations');
    
    return factors;
  }

  private static identifyAnomalyCauses(metric: KPIMetric, value: number, mean: number): string[] {
    const causes = [];
    
    if (value > mean * 1.5) {
      causes.push('Unusual spike in activity');
      if (metric.category === 'revenue') causes.push('Successful campaign or promotion');
      if (metric.category === 'performance') causes.push('System optimization or infrastructure upgrade');
    } else if (value < mean * 0.5) {
      causes.push('Significant drop in performance');
      if (metric.category === 'revenue') causes.push('Market downturn or competitive pressure');
      if (metric.category === 'performance') causes.push('System issues or outages');
    }
    
    causes.push('Data quality issues', 'External factors', 'Seasonal variations');
    
    return causes;
  }

  private static generateAnomalyRecommendations(metric: KPIMetric, anomaly: AnomalyResult): string[] {
    const recommendations = [];
    
    if (anomaly.severity === 'critical') {
      recommendations.push('Immediate investigation required');
      recommendations.push('Check data sources for accuracy');
    }
    
    recommendations.push(`Analyze ${metric.name} historical patterns`);
    recommendations.push('Review related metrics for correlation');
    recommendations.push('Document findings for future reference');
    
    if (metric.category === 'revenue') {
      recommendations.push('Review sales and marketing activities');
    } else if (metric.category === 'performance') {
      recommendations.push('Check system health and performance logs');
    }
    
    return recommendations;
  }

  private static interpretCorrelation(correlation: number, metric1: string, metric2: string): string {
    const strength = Math.abs(correlation);
    const direction = correlation > 0 ? 'positive' : 'negative';
    const strengthText = strength > 0.8 ? 'very strong' : strength > 0.6 ? 'strong' : 'moderate';
    
    return `${strengthText} ${direction} correlation between ${metric1} and ${metric2} (${(correlation * 100).toFixed(1)}%)`;
  }

  private static generateOptimizationSteps(metric: KPIMetric): string[] {
    const steps = [];
    
    if (metric.category === 'revenue') {
      steps.push('Analyze customer acquisition costs');
      steps.push('Review pricing strategies');
      steps.push('Optimize marketing campaigns');
      steps.push('Improve customer retention');
    } else if (metric.category === 'performance') {
      steps.push('Identify performance bottlenecks');
      steps.push('Optimize system resources');
      steps.push('Implement caching strategies');
      steps.push('Monitor system health continuously');
    } else {
      steps.push(`Analyze ${metric.name} drivers`);
      steps.push('Identify improvement opportunities');
      steps.push('Implement targeted optimizations');
      steps.push('Monitor progress regularly');
    }
    
    return steps;
  }
}
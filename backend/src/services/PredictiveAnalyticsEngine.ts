import { AIService, DataPoint, PredictionResult } from './AIService';
import KPI, { IKPI } from '../models/KPI';
import { Types } from 'mongoose';

/**
 * Advanced Predictive Analytics Engine
 * Uses machine learning techniques for business forecasting and predictions
 */

export interface ForecastOptions {
  horizon: number; // Number of periods to forecast
  confidence_interval: number; // 0.95 for 95% confidence
  include_seasonality: boolean;
  method: 'linear' | 'exponential' | 'arima' | 'ensemble';
}

export interface MLForecastResult {
  predictions: Array<{
    date: Date;
    predicted_value: number;
    lower_bound: number;
    upper_bound: number;
    confidence: number;
  }>;
  model_performance: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    mae: number;  // Mean Absolute Error
    r_squared: number;
  };
  trend_analysis: {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    seasonal_components?: number[];
  };
  insights: string[];
  recommendations: string[];
}

export interface BusinessMetricPrediction {
  metric_name: string;
  current_value: number;
  predicted_value: number;
  change_percentage: number;
  risk_level: 'low' | 'medium' | 'high';
  factors: Array<{
    factor: string;
    impact: number;
    explanation: string;
  }>;
}

export class PredictiveAnalyticsEngine {

  /**
   * Advanced KPI Forecasting with ML
   */
  static async generateAdvancedForecast(
    companyId: Types.ObjectId | string,
    metricName?: string,
    options: Partial<ForecastOptions> = {}
  ): Promise<MLForecastResult> {
    const defaultOptions: ForecastOptions = {
      horizon: 30,
      confidence_interval: 0.95,
      include_seasonality: true,
      method: 'ensemble',
      ...options
    };

    try {
      // Fetch historical data
      const filter: any = { 
        companyId: companyId, 
        isActive: true,
        date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
      };
      
      if (metricName) {
        filter.name = metricName;
      }

      const historicalData = await KPI.find(filter)
        .sort({ date: 1 })
        .limit(1000);

      if (historicalData.length < 7) {
        throw new Error('Insufficient historical data for reliable forecasting');
      }

      // Prepare data points
      const dataPoints: DataPoint[] = historicalData.map(kpi => ({
        timestamp: kpi.date,
        value: kpi.value,
        metadata: {
          target: kpi.target,
          category: kpi.category,
          trend: kpi.trend
        }
      }));

      // Preprocess data
      const { values, timestamps, statistics } = AIService.preprocessTimeSeriesData(dataPoints);

      // Generate multiple forecasts using different methods
      const forecasts = {
        linear: this.linearForecast(values, timestamps, defaultOptions.horizon),
        exponential: this.exponentialForecast(values, timestamps, defaultOptions.horizon),
        seasonal: this.seasonalForecast(values, timestamps, defaultOptions.horizon),
        arima: this.arimaForecast(values, timestamps, defaultOptions.horizon)
      };

      // Ensemble prediction (weighted average)
      const ensemblePredictions = this.createEnsembleForecast(forecasts, defaultOptions);

      // Calculate confidence intervals
      const confidenceIntervals = this.calculateConfidenceIntervals(
        values,
        ensemblePredictions.map(p => p.predicted_value),
        defaultOptions.confidence_interval
      );

      // Combine predictions with confidence intervals
      const predictions = ensemblePredictions.map((pred, index) => ({
        ...pred,
        lower_bound: confidenceIntervals.lower[index] || pred.predicted_value * 0.8,
        upper_bound: confidenceIntervals.upper[index] || pred.predicted_value * 1.2,
        confidence: this.calculatePredictionConfidence(index, defaultOptions.horizon)
      }));

      // Calculate model performance
      const model_performance = this.calculateModelPerformance(values, forecasts.linear);

      // Analyze trends
      const trend_analysis = this.analyzeTrends(values, predictions);

      // Generate insights and recommendations
      const insights = this.generateInsights(values, predictions, statistics);
      const recommendations = this.generateRecommendations(trend_analysis, model_performance);

      return {
        predictions,
        model_performance,
        trend_analysis,
        insights,
        recommendations
      };

    } catch (error: any) {
      console.error('Error in advanced forecasting:', error);
      throw new Error(`Forecasting failed: ${error.message}`);
    }
  }

  /**
   * Business Metrics Prediction
   */
  static async predictBusinessMetrics(
    companyId: Types.ObjectId | string,
    timeframe: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<BusinessMetricPrediction[]> {
    try {
      const predictions: BusinessMetricPrediction[] = [];
      
      // Define key business metrics to predict
      const metrics = [
        'Total Revenue',
        'Active Users',
        'Customer Acquisition Cost',
        'Customer Lifetime Value',
        'Conversion Rate',
        'Monthly Recurring Revenue',
        'Churn Rate',
        'Average Order Value'
      ];

      for (const metricName of metrics) {
        try {
          const forecast = await this.generateAdvancedForecast(companyId, metricName, {
            horizon: timeframe === 'daily' ? 7 : timeframe === 'weekly' ? 4 : 12,
            method: 'ensemble'
          });

          if (forecast.predictions.length > 0) {
            const currentKPI = await KPI.findOne({
              companyId: companyId,
              name: metricName,
              isActive: true
            }).sort({ date: -1 });

            const currentValue = currentKPI?.value || 0;
            const predictedValue = forecast.predictions[forecast.predictions.length - 1].predicted_value;
            const changePercentage = currentValue > 0 
              ? ((predictedValue - currentValue) / currentValue) * 100 
              : 0;

            // Assess risk level
            const risk_level = this.assessRiskLevel(changePercentage, forecast.model_performance.mape);

            // Extract key factors
            const factors = this.extractPredictionFactors(forecast, metricName);

            predictions.push({
              metric_name: metricName,
              current_value: currentValue,
              predicted_value: predictedValue,
              change_percentage: changePercentage,
              risk_level,
              factors
            });
          }
        } catch (metricError) {
          console.warn(`Could not predict ${metricName}:`, metricError);
        }
      }

      return predictions;
    } catch (error: any) {
      console.error('Error predicting business metrics:', error);
      throw new Error(`Business metrics prediction failed: ${error.message}`);
    }
  }

  /**
   * Revenue Forecasting with External Factors
   */
  static async predictRevenue(
    companyId: Types.ObjectId | string,
    externalFactors?: {
      market_trend: number;
      seasonality: number;
      competition: number;
      economic_indicator: number;
    }
  ): Promise<{
    revenue_forecast: MLForecastResult;
    scenario_analysis: {
      optimistic: number;
      realistic: number;
      pessimistic: number;
    };
    growth_drivers: Array<{
      factor: string;
      impact: number;
      recommendation: string;
    }>;
  }> {
    try {
      // Generate base revenue forecast
      const revenue_forecast = await this.generateAdvancedForecast(companyId, 'Total Revenue', {
        horizon: 90,
        include_seasonality: true,
        method: 'ensemble'
      });

      // Apply external factors if provided
      let adjustedPredictions = revenue_forecast.predictions;
      if (externalFactors) {
        adjustedPredictions = this.applyExternalFactors(revenue_forecast.predictions, externalFactors);
      }

      // Scenario analysis
      const baseRevenue = adjustedPredictions[adjustedPredictions.length - 1].predicted_value;
      const scenario_analysis = {
        optimistic: baseRevenue * 1.15, // 15% upside
        realistic: baseRevenue,
        pessimistic: baseRevenue * 0.85 // 15% downside
      };

      // Identify growth drivers
      const growth_drivers = this.identifyGrowthDrivers(revenue_forecast, externalFactors);

      return {
        revenue_forecast: {
          ...revenue_forecast,
          predictions: adjustedPredictions
        },
        scenario_analysis,
        growth_drivers
      };
    } catch (error: any) {
      console.error('Error in revenue prediction:', error);
      throw new Error(`Revenue forecasting failed: ${error.message}`);
    }
  }

  /**
   * Forecasting Methods Implementation
   */
  private static linearForecast(values: number[], timestamps: Date[], horizon: number): number[] {
    const x = values.map((_, i) => i);
    const regression = AIService.performLinearRegression(x, values);
    
    const forecast = [];
    for (let i = 0; i < horizon; i++) {
      const futureX = values.length + i;
      const prediction = regression.slope * futureX + regression.intercept;
      forecast.push(Math.max(0, prediction));
    }
    
    return forecast;
  }

  private static exponentialForecast(values: number[], timestamps: Date[], horizon: number): number[] {
    const smoothed = AIService.exponentialSmoothing(values, 0.3);
    const trend = smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2] || 0;
    
    const forecast = [];
    let lastValue = smoothed[smoothed.length - 1];
    
    for (let i = 0; i < horizon; i++) {
      lastValue += trend * (1 + i * 0.1); // Exponential growth factor
      forecast.push(Math.max(0, lastValue));
    }
    
    return forecast;
  }

  private static seasonalForecast(values: number[], timestamps: Date[], horizon: number): number[] {
    const seasonalData = AIService.detectSeasonality(values, 7); // Weekly seasonality
    const trendValues = seasonalData.trend;
    const seasonalPattern = seasonalData.seasonal;
    
    const forecast = [];
    const lastTrend = trendValues[trendValues.length - 1];
    const trendGrowth = trendValues.length > 1 
      ? (lastTrend - trendValues[trendValues.length - 2]) 
      : 0;
    
    for (let i = 0; i < horizon; i++) {
      const trendComponent = lastTrend + (trendGrowth * i);
      const seasonalComponent = seasonalPattern[i % seasonalPattern.length] || 0;
      const prediction = trendComponent + seasonalComponent;
      forecast.push(Math.max(0, prediction));
    }
    
    return forecast;
  }

  private static arimaForecast(values: number[], timestamps: Date[], horizon: number): number[] {
    // Simplified ARIMA implementation
    if (values.length < 10) return this.linearForecast(values, timestamps, horizon);
    
    // Calculate moving average
    const movingAvg = AIService.calculateMovingAverage(values, 3);
    const residuals = values.slice(2).map((val, i) => val - movingAvg[i + 2]);
    
    // Simple autoregressive component
    const forecast = [];
    let lastValue = values[values.length - 1];
    const avgResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    
    for (let i = 0; i < horizon; i++) {
      const autoregressive = 0.7 * lastValue; // AR coefficient
      const movingAvgComponent = avgResidual * 0.3; // MA coefficient
      lastValue = autoregressive + movingAvgComponent;
      forecast.push(Math.max(0, lastValue));
    }
    
    return forecast;
  }

  private static createEnsembleForecast(
    forecasts: Record<string, number[]>,
    options: ForecastOptions
  ): Array<{ date: Date; predicted_value: number }> {
    const weights = {
      linear: 0.25,
      exponential: 0.25,
      seasonal: 0.3,
      arima: 0.2
    };

    const horizon = options.horizon;
    const ensemble = [];

    for (let i = 0; i < horizon; i++) {
      let weightedSum = 0;
      let totalWeight = 0;

      Object.entries(forecasts).forEach(([method, values]) => {
        if (values[i] !== undefined) {
          weightedSum += values[i] * weights[method as keyof typeof weights];
          totalWeight += weights[method as keyof typeof weights];
        }
      });

      const predictedValue = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i + 1);

      ensemble.push({
        date: futureDate,
        predicted_value: predictedValue
      });
    }

    return ensemble;
  }

  private static calculateConfidenceIntervals(
    historical: number[],
    predictions: number[],
    confidence: number
  ): { lower: number[]; upper: number[] } {
    const residuals = this.calculateResiduals(historical);
    const residualStd = this.calculateStandardDeviation(residuals);
    
    const zScore = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.58 : 1.645;
    
    const lower = predictions.map((pred, i) => {
      const errorGrowth = Math.sqrt(i + 1); // Error grows with time
      return pred - (zScore * residualStd * errorGrowth);
    });
    
    const upper = predictions.map((pred, i) => {
      const errorGrowth = Math.sqrt(i + 1);
      return pred + (zScore * residualStd * errorGrowth);
    });

    return { lower, upper };
  }

  private static calculatePredictionConfidence(index: number, horizon: number): number {
    // Confidence decreases over time
    return Math.max(0.3, 1 - (index / horizon) * 0.7);
  }

  private static calculateModelPerformance(actual: number[], predicted: number[]): {
    mape: number;
    rmse: number;
    mae: number;
    r_squared: number;
  } {
    const n = Math.min(actual.length, predicted.length);
    if (n === 0) return { mape: 100, rmse: 0, mae: 0, r_squared: 0 };

    let mape = 0;
    let mae = 0;
    let mse = 0;

    for (let i = 0; i < n; i++) {
      const error = Math.abs(actual[i] - predicted[i]);
      mape += actual[i] !== 0 ? (error / Math.abs(actual[i])) * 100 : 0;
      mae += error;
      mse += Math.pow(error, 2);
    }

    mape /= n;
    mae /= n;
    const rmse = Math.sqrt(mse / n);

    // Calculate R-squared
    const actualMean = actual.reduce((a, b) => a + b, 0) / actual.length;
    const totalSS = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const residualSS = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    const r_squared = totalSS > 0 ? 1 - (residualSS / totalSS) : 0;

    return { mape, rmse, mae, r_squared };
  }

  private static analyzeTrends(
    historical: number[],
    predictions: Array<{ predicted_value: number }>
  ): {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    seasonal_components?: number[];
  } {
    const allValues = [...historical, ...predictions.map(p => p.predicted_value)];
    const x = allValues.map((_, i) => i);
    const regression = AIService.performLinearRegression(x, allValues);

    const direction = regression.slope > 0.1 ? 'increasing' : 
                     regression.slope < -0.1 ? 'decreasing' : 'stable';
    
    const strength = Math.abs(regression.slope) / (allValues.reduce((a, b) => a + b, 0) / allValues.length);

    return {
      direction,
      strength: Math.min(1, strength),
      seasonal_components: AIService.detectSeasonality(allValues).seasonal
    };
  }

  private static generateInsights(
    historical: number[],
    predictions: Array<{ predicted_value: number; confidence: number }>,
    statistics: any
  ): string[] {
    const insights = [];

    // Trend insights
    const avgHistorical = historical.reduce((a, b) => a + b, 0) / historical.length;
    const avgPredicted = predictions.reduce((a, b) => a + b.predicted_value, 0) / predictions.length;
    const change = ((avgPredicted - avgHistorical) / avgHistorical) * 100;

    if (change > 10) {
      insights.push(`Strong upward trend expected with ${change.toFixed(1)}% growth`);
    } else if (change < -10) {
      insights.push(`Declining trend predicted with ${Math.abs(change).toFixed(1)}% decrease`);
    } else {
      insights.push(`Stable performance expected with minimal volatility`);
    }

    // Volatility insights
    if (statistics.std > avgHistorical * 0.3) {
      insights.push(`High volatility detected - expect significant fluctuations`);
    }

    // Confidence insights
    const avgConfidence = predictions.reduce((a, b) => a + b.confidence, 0) / predictions.length;
    if (avgConfidence < 0.7) {
      insights.push(`Low prediction confidence - monitor closely for deviations`);
    }

    return insights;
  }

  private static generateRecommendations(
    trendAnalysis: any,
    modelPerformance: any
  ): string[] {
    const recommendations = [];

    if (trendAnalysis.direction === 'decreasing') {
      recommendations.push('Implement intervention strategies to reverse declining trend');
      recommendations.push('Investigate root causes of performance degradation');
    } else if (trendAnalysis.direction === 'increasing') {
      recommendations.push('Maintain current strategies and scale successful initiatives');
      recommendations.push('Prepare infrastructure for anticipated growth');
    }

    if (modelPerformance.mape > 20) {
      recommendations.push('Collect more granular data to improve prediction accuracy');
      recommendations.push('Consider external factors that may influence performance');
    }

    return recommendations;
  }

  private static assessRiskLevel(changePercentage: number, mape: number): 'low' | 'medium' | 'high' {
    if (Math.abs(changePercentage) > 25 || mape > 30) return 'high';
    if (Math.abs(changePercentage) > 10 || mape > 15) return 'medium';
    return 'low';
  }

  private static extractPredictionFactors(forecast: MLForecastResult, metricName: string): Array<{
    factor: string;
    impact: number;
    explanation: string;
  }> {
    // Simplified factor extraction based on metric type and trend
    const factors = [];
    
    if (forecast.trend_analysis.seasonal_components) {
      factors.push({
        factor: 'Seasonal Variation',
        impact: forecast.trend_analysis.seasonal_components.reduce((a, b) => a + Math.abs(b), 0) / forecast.trend_analysis.seasonal_components.length,
        explanation: 'Regular seasonal patterns affecting performance'
      });
    }

    factors.push({
      factor: 'Historical Trend',
      impact: forecast.trend_analysis.strength,
      explanation: `${forecast.trend_analysis.direction} trend influencing future values`
    });

    return factors;
  }

  private static applyExternalFactors(
    predictions: Array<{ date: Date; predicted_value: number; lower_bound: number; upper_bound: number; confidence: number }>,
    factors: { market_trend: number; seasonality: number; competition: number; economic_indicator: number }
  ): Array<{ date: Date; predicted_value: number; lower_bound: number; upper_bound: number; confidence: number }> {
    const totalFactor = (factors.market_trend + factors.seasonality + factors.competition + factors.economic_indicator) / 4;
    
    return predictions.map(pred => ({
      ...pred,
      predicted_value: pred.predicted_value * (1 + totalFactor),
      lower_bound: pred.lower_bound * (1 + totalFactor * 0.5),
      upper_bound: pred.upper_bound * (1 + totalFactor * 1.5)
    }));
  }

  private static identifyGrowthDrivers(
    forecast: MLForecastResult,
    externalFactors?: any
  ): Array<{ factor: string; impact: number; recommendation: string }> {
    const drivers = [];

    if (forecast.trend_analysis.direction === 'increasing') {
      drivers.push({
        factor: 'Positive Market Momentum',
        impact: forecast.trend_analysis.strength,
        recommendation: 'Capitalize on current growth trajectory with increased investment'
      });
    }

    if (externalFactors?.market_trend > 0.05) {
      drivers.push({
        factor: 'Favorable Market Conditions',
        impact: externalFactors.market_trend,
        recommendation: 'Expand market presence while conditions are favorable'
      });
    }

    return drivers;
  }

  private static calculateResiduals(values: number[]): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.map(val => val - mean);
  }

  private static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

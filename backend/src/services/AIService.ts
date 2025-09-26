import { Types } from 'mongoose';

/**
 * Core AI Service - Foundation for all AI-powered features
 * Provides data preprocessing, model utilities, and AI infrastructure
 */

export interface DataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface PredictionResult {
  predicted_value: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
  accuracy_score?: number;
}

export interface AnomalyResult {
  is_anomaly: boolean;
  anomaly_score: number;
  threshold: number;
  explanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RecommendationResult {
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  impact_score: number;
  action_items: string[];
  expected_outcome: string;
}

export class AIService {
  
  /**
   * Data Preprocessing Utilities
   */
  static preprocessTimeSeriesData(data: DataPoint[]): {
    values: number[];
    timestamps: Date[];
    normalized: number[];
    statistics: any;
  } {
    if (!data || data.length === 0) {
      return { values: [], timestamps: [], normalized: [], statistics: {} };
    }

    const values = data.map(d => d.value);
    const timestamps = data.map(d => d.timestamp);
    
    // Calculate statistics
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Normalize data (z-score normalization)
    const normalized = values.map(val => (val - mean) / (std || 1));
    
    const statistics = {
      mean,
      variance,
      std,
      min,
      max,
      count: values.length,
      median: this.calculateMedian(values),
      percentiles: {
        p25: this.calculatePercentile(values, 25),
        p75: this.calculatePercentile(values, 75),
        p90: this.calculatePercentile(values, 90),
        p95: this.calculatePercentile(values, 95)
      }
    };

    return { values, timestamps, normalized, statistics };
  }

  /**
   * Linear Regression for Trend Analysis
   */
  static performLinearRegression(x: number[], y: number[]): {
    slope: number;
    intercept: number;
    r_squared: number;
    predictions: number[];
  } {
    if (x.length !== y.length || x.length === 0) {
      return { slope: 0, intercept: 0, r_squared: 0, predictions: [] };
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const predictions = x.map(xi => slope * xi + intercept);
    const totalSS = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSS = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
    const r_squared = 1 - (residualSS / totalSS);

    return { slope, intercept, r_squared, predictions };
  }

  /**
   * Moving Average Calculation
   */
  static calculateMovingAverage(data: number[], window: number): number[] {
    const movingAvg: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        movingAvg.push(data[i]);
      } else {
        const windowData = data.slice(i - window + 1, i + 1);
        const avg = windowData.reduce((a, b) => a + b, 0) / window;
        movingAvg.push(avg);
      }
    }
    
    return movingAvg;
  }

  /**
   * Exponential Smoothing for Time Series
   */
  static exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    if (data.length === 0) return [];
    
    const smoothed = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const smoothedValue = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
      smoothed.push(smoothedValue);
    }
    
    return smoothed;
  }

  /**
   * Seasonal Decomposition (Basic)
   */
  static detectSeasonality(data: number[], period: number = 7): {
    trend: number[];
    seasonal: number[];
    residual: number[];
    seasonal_strength: number;
  } {
    if (data.length < period * 2) {
      return {
        trend: data,
        seasonal: new Array(data.length).fill(0),
        residual: new Array(data.length).fill(0),
        seasonal_strength: 0
      };
    }

    // Calculate trend using moving average
    const trend = this.calculateMovingAverage(data, period);
    
    // Calculate seasonal component
    const seasonal: number[] = new Array(data.length).fill(0);
    const seasonalPatterns: number[][] = Array(period).fill(null).map(() => []);
    
    for (let i = 0; i < data.length; i++) {
      const seasonIndex = i % period;
      if (i >= period - 1) {
        const detrended = data[i] - trend[i];
        seasonalPatterns[seasonIndex].push(detrended);
      }
    }
    
    // Average seasonal patterns
    const avgSeasonal = seasonalPatterns.map(pattern => 
      pattern.length > 0 ? pattern.reduce((a, b) => a + b, 0) / pattern.length : 0
    );
    
    for (let i = 0; i < data.length; i++) {
      seasonal[i] = avgSeasonal[i % period];
    }
    
    // Calculate residual
    const residual = data.map((val, i) => val - trend[i] - seasonal[i]);
    
    // Calculate seasonal strength
    const variance = data.reduce((sum, val, i) => sum + Math.pow(val - trend[i], 2), 0) / data.length;
    const seasonalVariance = seasonal.reduce((sum, val) => sum + Math.pow(val, 2), 0) / seasonal.length;
    const seasonal_strength = variance > 0 ? Math.min(1, seasonalVariance / variance) : 0;
    
    return { trend, seasonal, residual, seasonal_strength };
  }

  /**
   * Correlation Analysis
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Outlier Detection using IQR method
   */
  static detectOutliers(data: number[]): {
    outliers: number[];
    outlier_indices: number[];
    lower_bound: number;
    upper_bound: number;
  } {
    if (data.length === 0) {
      return { outliers: [], outlier_indices: [], lower_bound: 0, upper_bound: 0 };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    
    const lower_bound = q1 - 1.5 * iqr;
    const upper_bound = q3 + 1.5 * iqr;
    
    const outliers: number[] = [];
    const outlier_indices: number[] = [];
    
    data.forEach((value, index) => {
      if (value < lower_bound || value > upper_bound) {
        outliers.push(value);
        outlier_indices.push(index);
      }
    });
    
    return { outliers, outlier_indices, lower_bound, upper_bound };
  }

  /**
   * Pattern Recognition in Time Series
   */
  static identifyPatterns(data: number[]): {
    patterns: Array<{
      type: 'spike' | 'dip' | 'trend_change' | 'cycle';
      start_index: number;
      end_index: number;
      strength: number;
      description: string;
    }>;
    overall_trend: 'increasing' | 'decreasing' | 'stable';
  } {
    const patterns: any[] = [];
    
    if (data.length < 3) {
      return { patterns, overall_trend: 'stable' };
    }

    // Calculate derivatives to find trend changes
    const derivatives = [];
    for (let i = 1; i < data.length; i++) {
      derivatives.push(data[i] - data[i - 1]);
    }

    const avgDerivative = derivatives.reduce((a, b) => a + b, 0) / derivatives.length;
    const overall_trend = avgDerivative > 0.1 ? 'increasing' : 
                         avgDerivative < -0.1 ? 'decreasing' : 'stable';

    // Detect spikes and dips
    const threshold = this.calculateStandardDeviation(data) * 2;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    
    for (let i = 1; i < data.length - 1; i++) {
      const value = data[i];
      const prevValue = data[i - 1];
      const nextValue = data[i + 1];
      
      // Spike detection
      if (value > mean + threshold && value > prevValue && value > nextValue) {
        patterns.push({
          type: 'spike',
          start_index: i - 1,
          end_index: i + 1,
          strength: (value - mean) / threshold,
          description: `Significant spike detected at index ${i}`
        });
      }
      
      // Dip detection
      if (value < mean - threshold && value < prevValue && value < nextValue) {
        patterns.push({
          type: 'dip',
          start_index: i - 1,
          end_index: i + 1,
          strength: (mean - value) / threshold,
          description: `Significant dip detected at index ${i}`
        });
      }
    }

    return { patterns, overall_trend };
  }

  /**
   * Utility Functions
   */
  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private static calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  private static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

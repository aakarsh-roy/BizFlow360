import express from 'express';
import { AIKPIController } from '../controllers/aiKPIController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route GET /api/ai/kpi/insights
 * @desc Get comprehensive AI insights for KPI metrics including predictions, anomalies, and business intelligence
 * @access Private
 * @query {string} timeRange - Time range for analysis (7d, 30d, 90d, 1y)
 * @query {string[]} categories - Filter by metric categories (revenue, marketing, performance, productivity)
 */
router.get('/kpi/insights', AIKPIController.getKPIAIInsights);

/**
 * @route POST /api/ai/kpi/forecasts
 * @desc Get predictive forecasts for specific metrics using machine learning models
 * @access Private
 * @body {string[]} metricIds - Array of metric IDs to forecast
 * @body {string} timeframe - Forecast timeframe (1_week, 1_month, 3_months, 6_months)
 */
router.post('/kpi/forecasts', AIKPIController.getPredictiveForecasts);

/**
 * @route GET /api/ai/kpi/anomalies
 * @desc Get anomaly detection results for all metrics with intelligent pattern recognition
 * @access Private
 * @query {string} sensitivity - Detection sensitivity (low, medium, high)
 * @query {string} timeWindow - Time window for analysis (1h, 24h, 7d, 30d)
 */
router.get('/kpi/anomalies', AIKPIController.getAnomalyDetection);

/**
 * @route GET /api/ai/kpi/recommendations
 * @desc Get AI-powered business recommendations based on KPI analysis
 * @access Private
 * @query {string} focus - Focus area (marketing, technology, business, operations)
 * @query {string} priority - Priority level filter (low, medium, high, urgent)
 */
router.get('/kpi/recommendations', AIKPIController.getBusinessRecommendations);

/**
 * @route GET /api/ai/kpi/alerts
 * @desc Get smart alerts and notifications based on AI analysis
 * @access Private
 * @query {string} severity - Alert severity filter (low, medium, high, critical)
 * @query {string} category - Alert category filter (performance, business, optimization)
 */
router.get('/kpi/alerts', AIKPIController.getSmartAlerts);

export default router;
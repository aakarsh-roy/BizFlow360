import express from 'express';
import { AITaskController } from '../controllers/aiTaskController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route GET /api/ai/tasks/prioritized
 * @desc Get AI-prioritized tasks with intelligent scoring and recommendations
 * @access Private
 * @query {string} userId - Filter tasks by user ID
 * @query {boolean} includeCompleted - Include completed tasks in results
 * @query {string} category - Filter tasks by category
 */
router.get('/tasks/prioritized', AITaskController.getAIPrioritizedTasks);

/**
 * @route GET /api/ai/tasks/:taskId/optimize/:userId
 * @desc Get AI recommendations for optimizing a specific task
 * @access Private
 * @param {string} taskId - ID of the task to optimize
 * @param {string} userId - ID of the current assignee
 */
router.get('/tasks/:taskId/optimize/:userId', AITaskController.getTaskOptimizationRecommendations);

/**
 * @route GET /api/ai/insights/productivity
 * @desc Get AI insights about team productivity and performance metrics
 * @access Private
 */
router.get('/insights/productivity', AITaskController.getTeamProductivityInsights);

/**
 * @route GET /api/ai/workload/balance
 * @desc Get AI-powered workload balancing suggestions for optimal team efficiency
 * @access Private
 */
router.get('/workload/balance', AITaskController.getWorkloadBalancingSuggestions);

export default router;
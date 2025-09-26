import express from 'express';
import { automatedWorkflowController } from '../controllers/automatedWorkflowController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   POST /api/workflows/generate
 * @desc    Generate workflow from natural language description
 * @access  Private
 */
router.post('/generate', automatedWorkflowController.generateWorkflow);

/**
 * @route   GET /api/workflows/templates
 * @desc    Get all available workflow templates
 * @access  Private
 * @query   category - Filter templates by category (optional)
 */
router.get('/templates', automatedWorkflowController.getTemplates);

/**
 * @route   GET /api/workflows/templates/:id
 * @desc    Get specific workflow template by ID
 * @access  Private
 */
router.get('/templates/:id', automatedWorkflowController.getTemplate);

/**
 * @route   POST /api/workflows/templates/:id/generate
 * @desc    Generate workflow from template with customizations
 * @access  Private
 */
router.post('/templates/:id/generate', automatedWorkflowController.generateFromTemplate);

/**
 * @route   GET /api/workflows/capabilities
 * @desc    Get workflow generation capabilities and supported features
 * @access  Private
 */
router.get('/capabilities', automatedWorkflowController.getCapabilities);

/**
 * @route   POST /api/workflows/analyze
 * @desc    Analyze workflow description without generating
 * @access  Private
 */
router.post('/analyze', automatedWorkflowController.analyzeDescription);

/**
 * @route   GET /api/workflows/template-stats
 * @desc    Get template categories and statistics
 * @access  Private
 */
router.get('/template-stats', automatedWorkflowController.getTemplateStats);

/**
 * @route   POST /api/workflows/validate
 * @desc    Validate generated workflow structure
 * @access  Private
 */
router.post('/validate', automatedWorkflowController.validateWorkflow);

/**
 * @route   GET /api/workflows/health
 * @desc    Health check for automated workflow service
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Automated Workflow Builder',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      aiGeneration: true,
      templateLibrary: true,
      workflowAnalysis: true,
      validation: true
    },
    version: '1.0.0'
  });
});

export default router;
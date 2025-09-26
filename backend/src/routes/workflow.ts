import express from 'express';
import {
  getProcessDefinitions,
  getProcessDefinition,
  createProcessDefinition,
  updateProcessDefinition,
  deleteProcessDefinition,
  startProcessInstance,
  getProcessInstances,
  getProcessInstance,
  completeTask,
  getWorkflowAnalytics,
  suspendProcessInstance,
  resumeProcessInstance,
  cancelProcessInstance,
  retryProcessInstance,
  getProcessInstanceSteps,
  getProcessVariables,
  updateProcessVariables,
  getProcessHistory,
  getActiveProcesses,
  getProcessHealth
} from '../controllers/workflowController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes for testing (no authentication required)
router.route('/')
  .get(getProcessDefinitions);

router.route('/instances')
  .get(getProcessInstances);

// Protected routes (authentication required)
router.use(protect);

router.route('/')
  .post(createProcessDefinition);

router.route('/:id')
  .get(getProcessDefinition)
  .put(updateProcessDefinition)
  .delete(deleteProcessDefinition);

// Process Instance routes
router.route('/:id/start')
  .post(startProcessInstance);

router.route('/instances/:id')
  .get(getProcessInstance);

router.route('/instances/:id/complete')
  .post(completeTask);

// Process Instance control routes
router.route('/instances/:id/suspend')
  .patch(suspendProcessInstance);

router.route('/instances/:id/resume')
  .patch(resumeProcessInstance);

router.route('/instances/:id/cancel')
  .patch(cancelProcessInstance);

router.route('/instances/:id/retry')
  .patch(retryProcessInstance);

// Process Instance Steps and Details routes
router.route('/instances/:id/steps')
  .get(getProcessInstanceSteps);

router.route('/instances/:id/variables')
  .get(getProcessVariables)
  .put(updateProcessVariables);

router.route('/instances/:id/history')
  .get(getProcessHistory);

// Process monitoring routes
router.route('/active')
  .get(getActiveProcesses);

router.route('/health')
  .get(getProcessHealth);

// Analytics routes
router.route('/analytics')
  .get(getWorkflowAnalytics);

export default router;

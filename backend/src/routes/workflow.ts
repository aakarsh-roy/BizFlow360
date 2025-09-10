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
  getWorkflowAnalytics
} from '../controllers/workflowController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Process Definition routes
router.route('/')
  .get(getProcessDefinitions)
  .post(createProcessDefinition);

router.route('/:id')
  .get(getProcessDefinition)
  .put(updateProcessDefinition)
  .delete(deleteProcessDefinition);

// Process Instance routes
router.route('/:id/start')
  .post(startProcessInstance);

router.route('/instances')
  .get(getProcessInstances);

router.route('/instances/:id')
  .get(getProcessInstance);

router.route('/instances/:id/complete')
  .post(completeTask);

// Analytics routes
router.route('/analytics')
  .get(getWorkflowAnalytics);

export default router;

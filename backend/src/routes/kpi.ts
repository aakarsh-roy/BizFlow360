import express from 'express';
import { 
  getKPIs, 
  getDashboard,
  createKPI, 
  updateKPI, 
  deleteKPI,
  getAnalytics
} from '../controllers/kpiController';
import { protect } from '../middleware/auth';

const router = express.Router();

// KPI routes
router.route('/')
  .get(protect, getKPIs)
  .post(protect, createKPI);

router.route('/dashboard')
  .get(protect, getDashboard);

router.route('/analytics')
  .get(protect, getAnalytics);

router.route('/:id')
  .put(protect, updateKPI)
  .delete(protect, deleteKPI);

export default router;

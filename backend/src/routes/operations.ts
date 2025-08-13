import express from 'express';
import { protect } from '../middleware/auth';
import BusinessOperationsService from '../services/BusinessOperationsService';

const router = express.Router();

// Logging middleware for operations
const logOperation = (operationType: string) => {
  return (req: any, res: any, next: any) => {
    console.log(`🔄 [${new Date().toISOString()}] ${operationType} - User: ${req.user?.id || 'Unknown'} - Company: ${req.body?.companyId || 'Unknown'}`);
    
    // Log the original response.json to capture results
    const originalJson = res.json;
    res.json = function(body: any) {
      if (body.success) {
        console.log(`✅ [${new Date().toISOString()}] ${operationType} - SUCCESS - ${body.message || 'Operation completed'}`);
      } else {
        console.log(`❌ [${new Date().toISOString()}] ${operationType} - FAILED - ${body.message || 'Operation failed'}`);
      }
      return originalJson.call(this, body);
    };
    
    next();
  };
};

// Simple validation middleware
const validateRequest = (validations: any[]) => {
  return (req: any, res: any, next: any) => {
    const errors: any[] = [];
    
    validations.forEach(validation => {
      const { field, required, type, values } = validation;
      const value = field.includes('.') ? 
        field.split('.').reduce((obj: any, key: string) => obj?.[key], req.body) : 
        req.body[field];

      if (required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
      }
      
      if (value !== undefined && type === 'array' && !Array.isArray(value)) {
        errors.push({ field, message: `${field} must be an array` });
      }
      
      if (value !== undefined && type === 'number' && isNaN(Number(value))) {
        errors.push({ field, message: `${field} must be a number` });
      }
      
      if (value !== undefined && values && !values.includes(value)) {
        errors.push({ field, message: `${field} must be one of: ${values.join(', ')}` });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors
      });
    }
    
    next();
  };
};

/**
 * @route   POST /api/operations/stock/movement
 * @desc    Create stock movement (in, out, transfer, adjustment, loss, return)
 * @access  Private
 */
router.post(
  '/stock/movement',
  protect,
  logOperation('STOCK_MOVEMENT'),
  validateRequest([
    { field: 'productId', required: true },
    { field: 'movementType', required: true, values: ['in', 'out', 'transfer', 'adjustment', 'loss', 'return'] },
    { field: 'quantity', required: true, type: 'number' },
    { field: 'reason', required: true },
    { field: 'reference', required: true },
    { field: 'unitCost', required: false, type: 'number' }
  ]),
  async (req: any, res: any) => {
    try {
      const operation = {
        ...req.body,
        processedBy: req.user.id,
        companyId: req.user.companyId
      };

      console.log(`📦 Processing stock movement: ${operation.movementType} - Product: ${operation.productId} - Qty: ${operation.quantity}`);
      
      const stockMovement = await BusinessOperationsService.createStockMovement(operation);

      res.status(201).json({
        success: true,
        message: 'Stock movement recorded successfully',
        data: stockMovement
      });
    } catch (error: any) {
      console.error('❌ Stock movement error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || 'Error recording stock movement'
      });
    }
  }
);

/**
 * @route   POST /api/operations/tasks
 * @desc    Create new task
 * @access  Private
 */
router.post(
  '/tasks',
  protect,
  logOperation('TASK_CREATE'),
  validateRequest([
    { field: 'taskName', required: true },
    { field: 'type', required: true, values: ['manual', 'approval', 'system', 'review', 'notification'] },
    { field: 'priority', required: true, values: ['low', 'medium', 'high', 'critical'] },
    { field: 'assignedTo', required: true },
    { field: 'estimatedHours', required: false, type: 'number' }
  ]),
  async (req: any, res: any) => {
    try {
      const operation = {
        ...req.body,
        assignedBy: req.user.id,
        companyId: req.user.companyId
      };

      console.log(`📋 Creating task: ${operation.taskName} - Priority: ${operation.priority} - Assigned to: ${operation.assignedTo}`);

      const task = await BusinessOperationsService.createTask(operation);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error: any) {
      console.error('❌ Task creation error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating task'
      });
    }
  }
);

/**
 * @route   PATCH /api/operations/tasks/:taskId/status
 * @desc    Update task status
 * @access  Private
 */
router.patch(
  '/tasks/:taskId/status',
  protect,
  validateRequest([
    { field: 'status', required: true, values: ['pending', 'in-progress', 'completed', 'cancelled', 'failed'] }
  ]),
  async (req: any, res: any) => {
    try {
      const { taskId } = req.params;
      const { status, notes } = req.body;

      const task = await BusinessOperationsService.updateTaskStatus(taskId, status, req.user.id, notes);

      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: task
      });
    } catch (error: any) {
      console.error('Task status update error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating task status'
      });
    }
  }
);

/**
 * @route   POST /api/operations/sales
 * @desc    Create sales transaction
 * @access  Private
 */
router.post(
  '/sales',
  protect,
  validateRequest([
    { field: 'customerId', required: true },
    { field: 'items', required: true, type: 'array' },
    { field: 'shippingAddress.street', required: true },
    { field: 'shippingAddress.city', required: true },
    { field: 'shippingAddress.state', required: true },
    { field: 'shippingAddress.postalCode', required: true },
    { field: 'shippingAddress.country', required: true },
    { field: 'billingAddress.street', required: true },
    { field: 'billingAddress.city', required: true },
    { field: 'billingAddress.state', required: true },
    { field: 'billingAddress.postalCode', required: true },
    { field: 'billingAddress.country', required: true }
  ]),
  async (req: any, res: any) => {
    try {
      const operation = {
        ...req.body,
        salesPersonId: req.user.id,
        companyId: req.user.companyId
      };

      const salesTransaction = await BusinessOperationsService.createSalesTransaction(operation);

      res.status(201).json({
        success: true,
        message: 'Sales transaction created successfully',
        data: salesTransaction
      });
    } catch (error: any) {
      console.error('Sales transaction error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating sales transaction'
      });
    }
  }
);

/**
 * @route   POST /api/operations/kpi
 * @desc    Record KPI metric
 * @access  Private
 */
router.post(
  '/kpi',
  protect,
  validateRequest([
    { field: 'metricName', required: true },
    { field: 'category', required: true, values: ['process', 'financial', 'user', 'system', 'operational', 'customer'] },
    { field: 'value', required: true, type: 'number' },
    { field: 'unit', required: true },
    { field: 'period', required: true, values: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] },
    { field: 'periodStart', required: true },
    { field: 'periodEnd', required: true },
    { field: 'calculationMethod', required: true }
  ]),
  async (req: any, res: any) => {
    try {
      const {
        metricName,
        category,
        value,
        target,
        unit,
        period,
        periodStart,
        periodEnd,
        calculationMethod,
        processId,
        departmentId,
        metadata
      } = req.body;

      const kpiMetric = await BusinessOperationsService.recordKPIMetric(
        metricName,
        category,
        value,
        req.user.companyId,
        {
          target,
          unit,
          period,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          calculationMethod,
          processId,
          departmentId,
          userId: req.user.id,
          metadata
        }
      );

      res.status(201).json({
        success: true,
        message: 'KPI metric recorded successfully',
        data: kpiMetric
      });
    } catch (error: any) {
      console.error('KPI metric error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error recording KPI metric'
      });
    }
  }
);

/**
 * @route   POST /api/operations/workflow/step
 * @desc    Process workflow step
 * @access  Private
 */
router.post(
  '/workflow/step',
  protect,
  validateRequest([
    { field: 'processInstanceId', required: true },
    { field: 'stepName', required: true }
  ]),
  async (req: any, res: any) => {
    try {
      const { processInstanceId, stepName, variables, action } = req.body;

      const processInstance = await BusinessOperationsService.processWorkflowStep(
        processInstanceId,
        stepName,
        req.user.id,
        variables || {},
        action || 'step_completed'
      );

      res.json({
        success: true,
        message: 'Workflow step processed successfully',
        data: processInstance
      });
    } catch (error: any) {
      console.error('Workflow step error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error processing workflow step'
      });
    }
  }
);

/**
 * @route   GET /api/operations/history
 * @desc    Get operation history with filters
 * @access  Private
 */
router.get(
  '/history',
  protect,
  async (req: any, res: any) => {
    try {
      const {
        entityType,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const history = await BusinessOperationsService.getOperationHistory(
        req.user.companyId,
        entityType,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        message: 'Operation history retrieved successfully',
        data: history
      });
    } catch (error: any) {
      console.error('Operation history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving operation history'
      });
    }
  }
);

/**
 * @route   GET /api/operations/metrics
 * @desc    Get real-time business metrics
 * @access  Private
 */
router.get(
  '/metrics',
  protect,
  async (req: any, res: any) => {
    try {
      const { period = 'daily' } = req.query;

      const metrics = await BusinessOperationsService.getBusinessMetrics(
        req.user.companyId,
        period as string
      );

      res.json({
        success: true,
        message: 'Business metrics retrieved successfully',
        data: metrics
      });
    } catch (error: any) {
      console.error('Business metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving business metrics'
      });
    }
  }
);

/**
 * @route   GET /api/operations/audit/:entityId
 * @desc    Get audit trail for specific entity
 * @access  Private
 */
router.get(
  '/audit/:entityId',
  protect,
  async (req: any, res: any) => {
    try {
      const { entityId } = req.params;
      const { limit = 20 } = req.query;

      const auditTrail = await BusinessOperationsService.getOperationHistory(
        req.user.companyId,
        undefined,
        undefined,
        undefined,
        1,
        parseInt(limit)
      );

      // Filter by entity ID
      const filteredTrail = auditTrail.logs.filter((log: any) => 
        log.entityId.toString() === entityId
      );

      res.json({
        success: true,
        message: 'Audit trail retrieved successfully',
        data: {
          logs: filteredTrail,
          entityId
        }
      });
    } catch (error: any) {
      console.error('Audit trail error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving audit trail'
      });
    }
  }
);

export default router;

import { Task, SalesTransaction } from '../models/Task';
import StockMovement from '../modules/inventory/models/StockMovement';
import { ProcessInstance } from '../models/Workflow';
import { KPIMetric, AuditLog, Customer } from '../models/BusinessOperations';
import Product from '../modules/inventory/models/Product';
import mongoose from 'mongoose';

export interface StockUpdateOperation {
  productId: string;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment' | 'loss' | 'return';
  quantity: number;
  reason: string;
  reference: string;
  warehouseFrom?: string;
  warehouseTo?: string;
  unitCost?: number;
  batchNumber?: string;
  expiryDate?: Date;
  processedBy: string;
  approvedBy?: string;
  notes?: string;
  companyId: string;
  relatedDocuments?: Array<{
    type: 'purchase_order' | 'sales_order' | 'transfer_order' | 'adjustment_note';
    documentId: string;
    documentNumber: string;
  }>;
}

export interface TaskOperation {
  processInstanceId?: string;
  taskName: string;
  description: string;
  type: 'manual' | 'approval' | 'system' | 'review' | 'notification';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  assignedBy: string;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
  customFields?: Record<string, any>;
  companyId: string;
  departmentId?: string;
}

export interface SalesOperation {
  customerId: string;
  salesPersonId: string;
  orderDate?: Date;
  deliveryDate?: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
    notes?: string;
  }>;
  shippingCost?: number;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'check' | 'credit' | 'online';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  internalNotes?: string;
  companyId: string;
}

export class BusinessOperationsService {
  
  /**
   * Create and store stock movement operation in MongoDB
   */
  static async createStockMovement(operation: StockUpdateOperation): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get current product stock
      const product = await Product.findById(operation.productId).session(session);
      if (!product) {
        throw new Error('Product not found');
      }

      const previousQuantity = product.stockQuantity;
      let newQuantity: number;

      // Calculate new quantity based on movement type
      switch (operation.movementType) {
        case 'in':
        case 'return':
          newQuantity = previousQuantity + Math.abs(operation.quantity);
          break;
        case 'out':
        case 'loss':
          newQuantity = Math.max(0, previousQuantity - Math.abs(operation.quantity));
          break;
        case 'adjustment':
          newQuantity = operation.quantity; // Direct set for adjustments
          break;
        case 'transfer':
          newQuantity = Math.max(0, previousQuantity - Math.abs(operation.quantity));
          break;
        default:
          throw new Error('Invalid movement type');
      }

      // Create stock movement record
      const stockMovement = new StockMovement({
        productId: operation.productId,
        movementType: operation.movementType,
        quantity: operation.movementType === 'adjustment' ? newQuantity - previousQuantity : operation.quantity,
        previousQuantity,
        newQuantity,
        unitCost: operation.unitCost || product.costPrice,
        totalValue: operation.unitCost ? operation.unitCost * Math.abs(operation.quantity) : product.costPrice * Math.abs(operation.quantity),
        reason: operation.reason,
        reference: operation.reference,
        warehouseFrom: operation.warehouseFrom,
        warehouseTo: operation.warehouseTo,
        batchNumber: operation.batchNumber,
        expiryDate: operation.expiryDate,
        processedBy: operation.processedBy,
        approvedBy: operation.approvedBy,
        notes: operation.notes,
        relatedDocuments: operation.relatedDocuments || [],
        companyId: operation.companyId
      });

      await stockMovement.save({ session });

      // Update product stock
      product.stockQuantity = newQuantity;
      product.updatedBy = new mongoose.Types.ObjectId(operation.processedBy);
      await product.save({ session });

      // Create audit log
      await this.createAuditLog({
        action: `stock_${operation.movementType}`,
        entityType: 'stock',
        entityId: stockMovement._id,
        userId: operation.processedBy,
        userEmail: '', // Will be filled by middleware
        previousState: { currentStock: previousQuantity },
        newState: { currentStock: newQuantity },
        changes: [{
          field: 'currentStock',
          oldValue: previousQuantity,
          newValue: newQuantity
        }],
        metadata: {
          productId: operation.productId,
          movementType: operation.movementType,
          quantity: operation.quantity,
          reason: operation.reason,
          reference: operation.reference
        },
        severity: 'medium',
        companyId: operation.companyId
      }, session);

      await session.commitTransaction();
      return stockMovement;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Create and store task operation in MongoDB
   */
  static async createTask(operation: TaskOperation): Promise<any> {
    try {
      // Generate task name if not provided
      if (!operation.taskName.trim()) {
        operation.taskName = `Task-${Date.now()}`;
      }

      const task = new Task({
        processInstanceId: operation.processInstanceId,
        taskName: operation.taskName,
        description: operation.description,
        type: operation.type,
        priority: operation.priority,
        assignedTo: operation.assignedTo,
        assignedBy: operation.assignedBy,
        dueDate: operation.dueDate,
        estimatedHours: operation.estimatedHours,
        tags: operation.tags || [],
        customFields: operation.customFields || {},
        companyId: operation.companyId,
        departmentId: operation.departmentId
      });

      await task.save();

      // Create audit log
      await this.createAuditLog({
        action: 'task_created',
        entityType: 'task',
        entityId: task._id,
        userId: operation.assignedBy,
        userEmail: '', // Will be filled by middleware
        newState: task.toObject(),
        metadata: {
          taskName: operation.taskName,
          assignedTo: operation.assignedTo,
          priority: operation.priority,
          type: operation.type
        },
        severity: 'low',
        companyId: operation.companyId
      });

      return task;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Update task status and store in MongoDB
   */
  static async updateTaskStatus(taskId: string, status: string, userId: string, notes?: string): Promise<any> {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const previousStatus = task.status;
      task.status = status as any;

      // Set timestamps based on status
      if (status === 'in-progress' && !task.startedAt) {
        task.startedAt = new Date();
      } else if ((status === 'completed' || status === 'cancelled') && !task.completedAt) {
        task.completedAt = new Date();
      }

      await task.save();

      // Add comment if notes provided
      if (notes) {
        task.comments.push({
          content: notes,
          author: new mongoose.Types.ObjectId(userId),
          timestamp: new Date(),
          isInternal: false,
          mentions: []
        } as any);
        await task.save();
      }

      // Create audit log
      await this.createAuditLog({
        action: 'task_status_updated',
        entityType: 'task',
        entityId: task._id,
        userId: userId,
        userEmail: '', // Will be filled by middleware
        previousState: { status: previousStatus },
        newState: { status: status },
        changes: [{
          field: 'status',
          oldValue: previousStatus,
          newValue: status
        }],
        metadata: {
          notes: notes,
          taskName: task.taskName
        },
        severity: 'low',
        companyId: task.companyId.toString()
      });

      return task;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Create and store sales transaction in MongoDB
   */
  static async createSalesTransaction(operation: SalesOperation): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Generate order number
      const orderNumber = `SO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Calculate item totals
      const processedItems = await Promise.all(operation.items.map(async (item) => {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const unitPrice = item.unitPrice || product.unitPrice;
        const discount = item.discount || 0;
        const tax = item.tax || 0; // Remove tax calculation for now since inventory model doesn't have taxRate
        const totalPrice = (unitPrice * item.quantity) - discount + tax;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          discount,
          tax,
          totalPrice,
          notes: item.notes
        };
      }));

      // Calculate totals
      const subtotal = processedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const totalDiscount = processedItems.reduce((sum, item) => sum + item.discount, 0);
      const totalTax = processedItems.reduce((sum, item) => sum + item.tax, 0);
      const shippingCost = operation.shippingCost || 0;
      const grandTotal = subtotal - totalDiscount + totalTax + shippingCost;

      // Create sales transaction
      const salesTransaction = new SalesTransaction({
        orderNumber,
        customerId: operation.customerId,
        salesPersonId: operation.salesPersonId,
        orderDate: operation.orderDate || new Date(),
        deliveryDate: operation.deliveryDate,
        status: 'draft',
        items: processedItems,
        subtotal,
        totalDiscount,
        totalTax,
        shippingCost,
        grandTotal,
        paymentStatus: 'pending',
        paymentMethod: operation.paymentMethod,
        shippingAddress: operation.shippingAddress,
        billingAddress: operation.billingAddress,
        notes: operation.notes,
        internalNotes: operation.internalNotes,
        companyId: operation.companyId
      });

      await salesTransaction.save({ session });

      // Create stock movements for reserved items
      for (const item of processedItems) {
        await this.createStockMovement({
          productId: item.productId.toString(),
          movementType: 'out',
          quantity: item.quantity,
          reason: 'Sales reservation',
          reference: orderNumber,
          processedBy: operation.salesPersonId,
          notes: `Reserved for sales order ${orderNumber}`,
          companyId: operation.companyId,
          relatedDocuments: [{
            type: 'sales_order',
            documentId: salesTransaction._id.toString(),
            documentNumber: orderNumber
          }]
        });
      }

      // Create audit log
      await this.createAuditLog({
        action: 'sales_transaction_created',
        entityType: 'sales',
        entityId: salesTransaction._id,
        userId: operation.salesPersonId,
        userEmail: '', // Will be filled by middleware
        newState: salesTransaction.toObject(),
        metadata: {
          orderNumber,
          customerId: operation.customerId,
          grandTotal,
          itemCount: processedItems.length
        },
        severity: 'medium',
        companyId: operation.companyId
      }, session);

      await session.commitTransaction();
      return salesTransaction;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Create KPI metrics and store in MongoDB
   */
  static async recordKPIMetric(
    metricName: string,
    category: 'process' | 'financial' | 'user' | 'system' | 'operational' | 'customer',
    value: number,
    companyId: string,
    options: {
      target?: number;
      unit: string;
      period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
      periodStart: Date;
      periodEnd: Date;
      calculationMethod: string;
      processId?: string;
      departmentId?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<any> {
    try {
      const kpiMetric = new KPIMetric({
        metricName,
        category,
        value,
        target: options.target,
        unit: options.unit,
        period: options.period,
        periodStart: options.periodStart,
        periodEnd: options.periodEnd,
        calculationMethod: options.calculationMethod,
        processId: options.processId,
        departmentId: options.departmentId,
        userId: options.userId,
        metadata: options.metadata || {},
        companyId
      });

      await kpiMetric.save();

      // Create audit log for KPI recording
      await this.createAuditLog({
        action: 'kpi_metric_recorded',
        entityType: 'system',
        entityId: kpiMetric._id,
        userId: options.userId || 'system',
        userEmail: 'system@bizflow360.com',
        newState: kpiMetric.toObject(),
        metadata: {
          metricName,
          category,
          value,
          period: options.period
        },
        severity: 'low',
        companyId
      });

      return kpiMetric;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Create audit log entry
   */
  static async createAuditLog(
    logData: {
      action: string;
      entityType: 'user' | 'task' | 'process' | 'workflow' | 'stock' | 'sales' | 'customer' | 'product' | 'company' | 'system';
      entityId: mongoose.Types.ObjectId;
      userId: string;
      userEmail: string;
      ipAddress?: string;
      userAgent?: string;
      previousState?: Record<string, any>;
      newState?: Record<string, any>;
      changes?: Array<{
        field: string;
        oldValue: any;
        newValue: any;
      }>;
      metadata?: Record<string, any>;
      severity: 'low' | 'medium' | 'high' | 'critical';
      companyId: string;
    },
    session?: mongoose.ClientSession
  ): Promise<any> {
    try {
      const auditLog = new AuditLog({
        ...logData,
        timestamp: new Date()
      });

      if (session) {
        await auditLog.save({ session });
      } else {
        await auditLog.save();
      }

      return auditLog;

    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error for audit log failures to avoid breaking main operations
      return null;
    }
  }

  /**
   * Process workflow step and store process instance
   */
  static async processWorkflowStep(
    processInstanceId: string,
    stepName: string,
    userId: string,
    variables: Record<string, any> = {},
    action: string = 'step_completed'
  ): Promise<any> {
    try {
      const processInstance = await ProcessInstance.findById(processInstanceId);
      if (!processInstance) {
        throw new Error('Process instance not found');
      }

      // Update process instance
      const previousStep = processInstance.currentStep;
      processInstance.currentStep = stepName;
      processInstance.variables = { ...processInstance.variables, ...variables };

      // Add to audit log
      processInstance.auditLog.push({
        timestamp: new Date(),
        action,
        userId: new mongoose.Types.ObjectId(userId),
        details: {
          stepName,
          variables,
          previousStep
        },
        previousState: { currentStep: previousStep },
        newState: { currentStep: stepName }
      } as any);

      await processInstance.save();

      // Create system audit log
      await this.createAuditLog({
        action: `process_${action}`,
        entityType: 'process',
        entityId: processInstance._id,
        userId: userId,
        userEmail: '', // Will be filled by middleware
        previousState: { currentStep: previousStep },
        newState: { currentStep: stepName },
        changes: [{
          field: 'currentStep',
          oldValue: previousStep,
          newValue: stepName
        }],
        metadata: {
          processInstanceId,
          stepName,
          variables,
          action
        },
        severity: 'medium',
        companyId: processInstance.companyId.toString()
      });

      return processInstance;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get operation history with pagination
   */
  static async getOperationHistory(
    companyId: string,
    entityType?: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    try {
      const filter: any = { companyId };
      
      if (entityType) {
        filter.entityType = entityType;
      }
      
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = startDate;
        if (endDate) filter.timestamp.$lte = endDate;
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email')
          .lean(),
        AuditLog.countDocuments(filter)
      ]);

      return {
        logs,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: skip + logs.length < total,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get real-time business metrics
   */
  static async getBusinessMetrics(companyId: string, period: string = 'daily'): Promise<any> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const [
        activeTasks,
        completedTasks,
        activeProcesses,
        completedProcesses,
        stockMovements,
        salesTransactions,
        recentKPIs
      ] = await Promise.all([
        Task.countDocuments({ companyId, status: { $in: ['pending', 'in-progress'] } }),
        Task.countDocuments({ companyId, status: 'completed', completedAt: { $gte: startDate } }),
        ProcessInstance.countDocuments({ companyId, status: 'running' }),
        ProcessInstance.countDocuments({ companyId, status: 'completed', endTime: { $gte: startDate } }),
        StockMovement.countDocuments({ companyId, createdAt: { $gte: startDate } }),
        SalesTransaction.countDocuments({ companyId, orderDate: { $gte: startDate } }),
        KPIMetric.find({ companyId, calculatedAt: { $gte: startDate } }).sort({ calculatedAt: -1 }).limit(10)
      ]);

      return {
        tasks: {
          active: activeTasks,
          completed: completedTasks
        },
        processes: {
          active: activeProcesses,
          completed: completedProcesses
        },
        operations: {
          stockMovements,
          salesTransactions
        },
        recentKPIs,
        generatedAt: new Date()
      };

    } catch (error) {
      throw error;
    }
  }
}

export default BusinessOperationsService;

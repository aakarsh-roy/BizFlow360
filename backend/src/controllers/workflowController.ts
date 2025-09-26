import { Request, Response } from 'express';
import { ProcessDefinition, ProcessInstance, IProcessDefinition, IProcessInstance } from '../models/Workflow';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all process definitions
// @route   GET /api/workflows
// @access  Private
export const getProcessDefinitions = async (req: AuthRequest, res: Response) => {
  try {
    console.log('GET /api/workflows called by user:', req.user?._id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Only filter by company if user is authenticated
    if (req.user && req.user.companyId) {
      filter.companyId = req.user.companyId;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const processDefinitions = await ProcessDefinition.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProcessDefinition.countDocuments(filter);

    res.json({
      success: true,
      data: {
        processDefinitions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching process definitions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single process definition
// @route   GET /api/workflows/:id
// @access  Private
export const getProcessDefinition = async (req: AuthRequest, res: Response) => {
  try {
    const processDefinition = await ProcessDefinition.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!processDefinition) {
      return res.status(404).json({ success: false, message: 'Process definition not found' });
    }

    // Check if user has access to this process definition
    // Note: Access control can be implemented based on user roles or other criteria
    // if (processDefinition.companyId.toString() !== (req.user.companyId || req.user._id).toString()) {
    //   return res.status(403).json({ success: false, message: 'Access denied' });
    // }

    res.json({ success: true, data: processDefinition });
  } catch (error: any) {
    console.error('Error fetching process definition:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new process definition
// @route   POST /api/workflows
// @access  Private
export const createProcessDefinition = async (req: AuthRequest, res: Response) => {
  try {
    const processDefinitionData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const processDefinition = await ProcessDefinition.create(processDefinitionData);

    const populatedProcessDefinition = await ProcessDefinition.findById(processDefinition._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Process definition created successfully',
      data: populatedProcessDefinition
    });
  } catch (error: any) {
    console.error('Error creating process definition:', error);

    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name && error.keyPattern.version) {
      return res.status(409).json({
        success: false,
        message: `A process definition with name "${req.body.name}" and version "${req.body.version}" already exists. Please choose a different name or version.`,
        error: 'DUPLICATE_PROCESS_DEFINITION'
      });
    }

    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update process definition
// @route   PUT /api/workflows/:id
// @access  Private
export const updateProcessDefinition = async (req: AuthRequest, res: Response) => {
  try {
    const processDefinition = await ProcessDefinition.findById(req.params.id);

    if (!processDefinition) {
      return res.status(404).json({ success: false, message: 'Process definition not found' });
    }

    // Check if user has access to this process definition
    // Note: Access control can be implemented based on user roles or other criteria
    // if (processDefinition.companyId.toString() !== (req.user.companyId || req.user._id).toString()) {
    //   return res.status(403).json({ success: false, message: 'Access denied' });
    // }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };

    const updatedProcessDefinition = await ProcessDefinition.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Process definition updated successfully',
      data: updatedProcessDefinition
    });
  } catch (error: any) {
    console.error('Error updating process definition:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete process definition
// @route   DELETE /api/workflows/:id
// @access  Private
export const deleteProcessDefinition = async (req: AuthRequest, res: Response) => {
  try {
    const processDefinition = await ProcessDefinition.findById(req.params.id);

    if (!processDefinition) {
      return res.status(404).json({ success: false, message: 'Process definition not found' });
    }

    // Check if user has access to this process definition
    // Note: Access control can be implemented based on user roles or other criteria
    // if (processDefinition.companyId.toString() !== (req.user.companyId || req.user._id).toString()) {
    //   return res.status(403).json({ success: false, message: 'Access denied' });
    // }

    // Check if there are active process instances
    const activeInstances = await ProcessInstance.countDocuments({
      processDefinitionId: req.params.id,
      status: { $in: ['running', 'suspended'] }
    });

    if (activeInstances > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete process definition with active instances'
      });
    }

    await ProcessDefinition.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Process definition deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting process definition:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start process instance
// @route   POST /api/workflows/:id/start
// @access  Private
export const startProcessInstance = async (req: AuthRequest, res: Response) => {
  try {
    console.log('POST /api/workflows/:id/start called by user:', req.user?._id, 'for definition:', req.params.id);
    console.log('Request body:', req.body);
    
    const processDefinition = await ProcessDefinition.findById(req.params.id);

    if (!processDefinition) {
      console.log('Process definition not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Process definition not found' });
    }

    // Check if user has access to this process definition
    // Note: Access control can be implemented based on user roles or other criteria
    // if (processDefinition.companyId.toString() !== (req.user.companyId || req.user._id).toString()) {
    //   return res.status(403).json({ success: false, message: 'Access denied' });
    // }

    if (!processDefinition.isActive) {
      return res.status(400).json({ success: false, message: 'Process definition is not active' });
    }

    // Find the start node
    const startNode = processDefinition.definition.nodes.find(node => node.type === 'start');
    if (!startNode) {
      return res.status(400).json({ success: false, message: 'Process definition has no start node' });
    }

    const processInstanceData = {
      processDefinitionId: req.params.id,
      businessKey: req.body.businessKey || `PROC_${Date.now()}`,
      status: 'running' as const,
      variables: req.body.variables || {},
      currentStep: startNode.id,
      startTime: new Date(),
      initiatedBy: req.user._id,
      assignedTo: req.body.assignedTo || [],
      priority: req.body.priority || 'medium',
      companyId: req.user.companyId || req.user._id,
      departmentId: req.body.departmentId,
      auditLog: [{
        timestamp: new Date(),
        action: 'process_started',
        userId: req.user._id,
        details: { startNode: startNode.id }
      }]
    };

    const processInstance = await ProcessInstance.create(processInstanceData);

    const populatedProcessInstance = await ProcessInstance.findById(processInstance._id)
      .populate('processDefinitionId', 'name version')
      .populate('initiatedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Process instance started successfully',
      data: populatedProcessInstance
    });
  } catch (error: any) {
    console.error('Error starting process instance:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get process instances
// @route   GET /api/workflows/instances
// @access  Private
export const getProcessInstances = async (req: AuthRequest, res: Response) => {
  try {
    console.log('GET /api/workflows/instances called by user:', req.user?._id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Only filter by company if user is authenticated
    if (req.user && (req.user.companyId || req.user._id)) {
      filter.companyId = req.user.companyId || req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.processDefinitionId) {
      filter.processDefinitionId = req.query.processDefinitionId;
    }

    if (req.query.businessKey) {
      filter.businessKey = { $regex: req.query.businessKey, $options: 'i' };
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const processInstances = await ProcessInstance.find(filter)
      .populate('processDefinitionId', 'name version category')
      .populate('initiatedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProcessInstance.countDocuments(filter);

    res.json({
      success: true,
      data: {
        processInstances,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching process instances:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single process instance
// @route   GET /api/workflows/instances/:id
// @access  Private
export const getProcessInstance = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id)
      .populate('processDefinitionId')
      .populate('initiatedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('auditLog.userId', 'name email');

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // Check if user has access to this process instance
    if (processInstance.companyId.toString() !== (req.user.companyId || req.user._id).toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: processInstance });
  } catch (error: any) {
    console.error('Error fetching process instance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete task in process instance
// @route   POST /api/workflows/instances/:id/complete
// @access  Private
export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id)
      .populate('processDefinitionId');

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // Check if user has access to this process instance
    if (processInstance.companyId.toString() !== (req.user.companyId || req.user._id).toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (processInstance.status !== 'running') {
      return res.status(400).json({ success: false, message: 'Process instance is not running' });
    }

    const processDefinition = processInstance.processDefinitionId as unknown as IProcessDefinition;
    const currentNode = processDefinition.definition.nodes.find(
      node => node.id === processInstance.currentStep
    );

    if (!currentNode) {
      return res.status(400).json({ success: false, message: 'Current step not found in process definition' });
    }

    // Update variables with task completion data
    const updatedVariables = {
      ...processInstance.variables,
      ...req.body.variables,
      [`${currentNode.id}_completed`]: true,
      [`${currentNode.id}_completedAt`]: new Date(),
      [`${currentNode.id}_completedBy`]: req.user._id
    };

    // Determine next step
    let nextStep: string | null = null;
    if (currentNode.connections && currentNode.connections.length > 0) {
      // For now, take the first connection (can be enhanced with conditions)
      nextStep = currentNode.connections[0];
    }

    const auditEntry = {
      timestamp: new Date(),
      action: 'task_completed',
      userId: req.user._id,
      details: {
        completedStep: currentNode.id,
        nextStep: nextStep,
        variables: req.body.variables
      },
      previousState: { currentStep: processInstance.currentStep },
      newState: { currentStep: nextStep }
    };

    const updateData: any = {
      variables: updatedVariables,
      auditLog: [...processInstance.auditLog, auditEntry],
      updatedAt: new Date()
    };

    if (nextStep) {
      updateData.currentStep = nextStep;

      // Check if next step is an end node
      const nextNode = processDefinition.definition.nodes.find(node => node.id === nextStep);
      if (nextNode && nextNode.type === 'end') {
        updateData.status = 'completed';
        updateData.endTime = new Date();
      }
    } else {
      // No next step, process is completed
      updateData.status = 'completed';
      updateData.endTime = new Date();
    }

    const updatedProcessInstance = await ProcessInstance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('processDefinitionId')
     .populate('initiatedBy', 'name email')
     .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: updatedProcessInstance
    });
  } catch (error: any) {
    console.error('Error completing task:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get workflow analytics
// @route   GET /api/workflows/analytics
// @access  Private
export const getWorkflowAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    // Process definition statistics
    const processStats = await ProcessDefinition.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    // Process instance statistics
    const instanceStats = await ProcessInstance.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: {
            $avg: {
              $cond: {
                if: { $and: ['$endTime', { $ne: ['$status', 'running'] }] },
                then: { $subtract: ['$endTime', '$startTime'] },
                else: null
              }
            }
          }
        }
      }
    ]);

    // Monthly process starts
    const monthlyStarts = await ProcessInstance.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        processStats,
        instanceStats,
        monthlyStarts,
        summary: {
          totalDefinitions: await ProcessDefinition.countDocuments({ companyId }),
          activeDefinitions: await ProcessDefinition.countDocuments({ companyId, isActive: true }),
          totalInstances: await ProcessInstance.countDocuments({ companyId }),
          runningInstances: await ProcessInstance.countDocuments({ companyId, status: 'running' }),
          completedInstances: await ProcessInstance.countDocuments({ companyId, status: 'completed' })
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching workflow analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend process instance
// @route   PATCH /api/workflows/instances/:id/suspend
// @access  Private
export const suspendProcessInstance = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // Check if the instance can be suspended
    if (processInstance.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: 'Only running processes can be suspended'
      });
    }

    // Update status and add audit log
    processInstance.status = 'suspended';
    processInstance.auditLog = processInstance.auditLog || [];
    processInstance.auditLog.push({
      timestamp: new Date(),
      action: 'suspend',
      userId: req.user._id.toString(),
      details: { previousStatus: 'running' },
      previousState: { status: 'running' },
      newState: { status: 'suspended' }
    });

    await processInstance.save();

    res.json({
      success: true,
      message: 'Process instance suspended successfully',
      data: processInstance
    });
  } catch (error: any) {
    console.error('Error suspending process instance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resume process instance
// @route   PATCH /api/workflows/instances/:id/resume
// @access  Private
export const resumeProcessInstance = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // Check if the instance can be resumed
    if (processInstance.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Only suspended processes can be resumed'
      });
    }

    // Update status and add audit log
    processInstance.status = 'running';
    processInstance.auditLog = processInstance.auditLog || [];
    processInstance.auditLog.push({
      timestamp: new Date(),
      action: 'resume',
      userId: req.user._id.toString(),
      details: { previousStatus: 'suspended' },
      previousState: { status: 'suspended' },
      newState: { status: 'running' }
    });

    await processInstance.save();

    res.json({
      success: true,
      message: 'Process instance resumed successfully',
      data: processInstance
    });
  } catch (error: any) {
    console.error('Error resuming process instance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel process instance
// @route   PATCH /api/workflows/instances/:id/cancel
// @access  Private
export const cancelProcessInstance = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // Check if the instance can be cancelled
    if (!['running', 'suspended'].includes(processInstance.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only running or suspended processes can be cancelled'
      });
    }

    const previousStatus = processInstance.status;
    
    // Update status and add audit log
    processInstance.status = 'cancelled';
    processInstance.endTime = new Date();
    processInstance.auditLog = processInstance.auditLog || [];
    processInstance.auditLog.push({
      timestamp: new Date(),
      action: 'cancel',
      userId: req.user._id.toString(),
      details: { previousStatus, reason: req.body.reason || 'Manual cancellation' },
      previousState: { status: previousStatus },
      newState: { status: 'cancelled' }
    });

    await processInstance.save();

    res.json({
      success: true,
      message: 'Process instance cancelled successfully',
      data: processInstance
    });
  } catch (error: any) {
    console.error('Error cancelling process instance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retry failed process instance
// @route   PATCH /api/workflows/instances/:id/retry
// @access  Private
export const retryProcessInstance = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // Check if the instance can be retried
    if (processInstance.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed processes can be retried'
      });
    }

    // Update status and add audit log
    processInstance.status = 'running';
    processInstance.endTime = undefined; // Clear end time since we're retrying
    processInstance.auditLog = processInstance.auditLog || [];
    processInstance.auditLog.push({
      timestamp: new Date(),
      action: 'retry',
      userId: req.user._id.toString(),
      details: { previousStatus: 'failed', retryAttempt: processInstance.auditLog.filter(log => log.action === 'retry').length + 1 },
      previousState: { status: 'failed' },
      newState: { status: 'running' }
    });

    await processInstance.save();

    res.json({
      success: true,
      message: 'Process instance retry initiated successfully',
      data: processInstance
    });
  } catch (error: any) {
    console.error('Error retrying process instance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get process instance steps/activities
// @route   GET /api/workflows/instances/:id/steps
// @access  Private
export const getProcessInstanceSteps = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // For now, we'll generate basic steps based on the process definition
    // In a real workflow engine, this would come from the actual process execution
    const processDefinition = await ProcessDefinition.findById(processInstance.processDefinitionId);
    
    let steps = [];
    if (processDefinition && processDefinition.definition && processDefinition.definition.nodes) {
      steps = processDefinition.definition.nodes.map((node: any, index: number) => ({
        id: node.id || `step_${index + 1}`,
        name: node.label || node.name || `Step ${index + 1}`,
        type: node.type || 'task',
        status: index === 0 ? 'completed' : 
                index === 1 && processInstance.status === 'running' ? 'active' :
                processInstance.status === 'completed' ? 'completed' :
                processInstance.status === 'failed' && index === 1 ? 'failed' :
                'pending',
        assignee: node.assignee,
        startTime: index === 0 ? processInstance.startTime : undefined,
        endTime: index === 0 && processInstance.status !== 'running' ? processInstance.endTime : undefined,
        duration: index === 0 && processInstance.endTime ? 
                 Math.floor((processInstance.endTime.getTime() - processInstance.startTime.getTime()) / (1000 * 60)) : 
                 undefined,
        variables: node.variables || {}
      }));
    } else {
      // Fallback: Create basic steps
      steps = [
        {
          id: 'start',
          name: 'Process Started',
          type: 'start',
          status: 'completed',
          startTime: processInstance.startTime,
          endTime: processInstance.status !== 'running' ? processInstance.endTime : undefined
        },
        {
          id: 'processing',
          name: 'Processing',
          type: 'task',
          status: processInstance.status === 'running' ? 'active' : 
                  processInstance.status === 'completed' ? 'completed' : 
                  processInstance.status === 'failed' ? 'failed' : 'pending'
        }
      ];
    }

    res.json({
      success: true,
      data: steps
    });
  } catch (error: any) {
    console.error('Error fetching process instance steps:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get process instance variables
// @route   GET /api/workflows/instances/:id/variables
// @access  Private
export const getProcessVariables = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    res.json({
      success: true,
      data: processInstance.variables || {}
    });
  } catch (error: any) {
    console.error('Error fetching process variables:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update process instance variables
// @route   PUT /api/workflows/instances/:id/variables
// @access  Private
export const updateProcessVariables = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    // Update variables
    processInstance.variables = { ...processInstance.variables, ...req.body };
    
    // Add audit log
    processInstance.auditLog = processInstance.auditLog || [];
    processInstance.auditLog.push({
      timestamp: new Date(),
      action: 'update_variables',
      userId: req.user._id.toString(),
      details: { updatedVariables: req.body },
      previousState: { variables: processInstance.variables },
      newState: { variables: processInstance.variables }
    });

    await processInstance.save();

    res.json({
      success: true,
      message: 'Process variables updated successfully',
      data: processInstance.variables
    });
  } catch (error: any) {
    console.error('Error updating process variables:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get process instance history/audit log
// @route   GET /api/workflows/instances/:id/history
// @access  Private
export const getProcessHistory = async (req: AuthRequest, res: Response) => {
  try {
    const processInstance = await ProcessInstance.findById(req.params.id);

    if (!processInstance) {
      return res.status(404).json({ success: false, message: 'Process instance not found' });
    }

    res.json({
      success: true,
      data: processInstance.auditLog || []
    });
  } catch (error: any) {
    console.error('Error fetching process history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active processes summary
// @route   GET /api/workflows/active
// @access  Private
export const getActiveProcesses = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    const [running, completed, failed, suspended] = await Promise.all([
      ProcessInstance.find({ companyId, status: 'running' })
        .populate('processDefinitionId', 'name version')
        .sort({ startTime: -1 })
        .limit(10),
      ProcessInstance.find({ companyId, status: 'completed' })
        .populate('processDefinitionId', 'name version')
        .sort({ endTime: -1 })
        .limit(5),
      ProcessInstance.find({ companyId, status: 'failed' })
        .populate('processDefinitionId', 'name version')
        .sort({ startTime: -1 })
        .limit(10),
      ProcessInstance.find({ companyId, status: 'suspended' })
        .populate('processDefinitionId', 'name version')
        .sort({ startTime: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        running,
        completed,
        failed,
        suspended
      }
    });
  } catch (error: any) {
    console.error('Error fetching active processes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get process health and system status
// @route   GET /api/workflows/health
// @access  Private
export const getProcessHealth = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user.companyId || req.user._id;

    // Get basic system metrics
    const [runningCount, queuedCount, errorCount] = await Promise.all([
      ProcessInstance.countDocuments({ companyId, status: 'running' }),
      ProcessInstance.countDocuments({ companyId, status: 'suspended' }), // Using suspended as "queued"
      ProcessInstance.countDocuments({ companyId, status: 'failed' })
    ]);

    // Calculate system load (simple metric based on running processes)
    const systemLoad = Math.min((runningCount / 100) * 100, 100); // Cap at 100%

    // Determine system status
    let systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorCount > 5 || systemLoad > 80) {
      systemStatus = 'critical';
    } else if (errorCount > 2 || systemLoad > 60) {
      systemStatus = 'warning';
    }

    // Generate alerts based on system state
    const alerts = [];
    if (errorCount > 5) {
      alerts.push({
        type: 'error' as const,
        message: `${errorCount} failed processes detected`,
        timestamp: new Date()
      });
    }
    if (systemLoad > 80) {
      alerts.push({
        type: 'warning' as const,
        message: 'High system load detected',
        timestamp: new Date()
      });
    }
    if (queuedCount > 10) {
      alerts.push({
        type: 'info' as const,
        message: `${queuedCount} processes are suspended/queued`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        systemLoad,
        activeProcesses: runningCount,
        queuedTasks: queuedCount,
        systemStatus,
        alerts
      }
    });
  } catch (error: any) {
    console.error('Error fetching process health:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

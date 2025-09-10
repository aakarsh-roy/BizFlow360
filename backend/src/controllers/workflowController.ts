import { Request, Response } from 'express';
import { ProcessDefinition, ProcessInstance, IProcessDefinition, IProcessInstance } from '../models/Workflow';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all process definitions
// @route   GET /api/workflows
// @access  Private
export const getProcessDefinitions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

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
    const processDefinition = await ProcessDefinition.findById(req.params.id);

    if (!processDefinition) {
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
      variables: req.body.variables || {},
      currentStep: startNode.id,
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { companyId: req.user.companyId || req.user._id };

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

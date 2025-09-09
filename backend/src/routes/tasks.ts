import express from 'express';
import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest, protect } from '../middleware/auth';

const router = express.Router();

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    
    if (req.query.search) {
      filter.$or = [
        { taskName: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task'
    });
  }
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    // Map frontend fields to backend schema
    const taskData: any = {
      taskName: req.body.title || req.body.taskName,
      description: req.body.description || '',
      status: req.body.status || 'pending',
      priority: req.body.priority || 'medium',
      assignedTo: req.body.assignedTo || null,
      assignedBy: req.user._id,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      category: req.body.category || 'General',
      type: req.body.type || 'manual',
      companyId: req.user.companyId || req.user._id, // Fallback to user ID if no company
      estimatedHours: req.body.estimatedHours || null,
      tags: req.body.tags || [],
      customFields: req.body.customFields || {}
    };

    // Validation checks
    if (!taskData.taskName) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Set progress based on status
    if (req.body.status === 'completed') {
      taskData.completedAt = new Date();
    } else if (req.body.status === 'in-progress') {
      taskData.startedAt = new Date();
    }

    const task = new Task(taskData);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating task'
    });
  }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const updateData = { ...req.body };

    // Handle status changes
    if (req.body.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    } else if (req.body.status === 'in-progress' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('assignedTo', 'name email')
     .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating task'
    });
  }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
router.get('/stats', protect, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        priorityStats
      }
    });
  } catch (error: any) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics'
    });
  }
});

export default router;

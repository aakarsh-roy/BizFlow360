import { Request, Response } from 'express';
import { AITaskPrioritizationService, Task, UserWorkPattern } from '../services/aiTaskPrioritizationService';

export class AITaskController {
  
  /**
   * Get AI-prioritized tasks with intelligent scoring
   */
  static async getAIPrioritizedTasks(req: Request, res: Response) {
    try {
      const { userId, includeCompleted = false, category } = req.query;
      
      // Mock task data (in real implementation, fetch from database)
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Fix critical production bug in payment system',
          description: 'Payment processing failing for customers, urgent fix needed',
          assignee: 'user1',
          priority: 'urgent',
          status: 'pending',
          dueDate: new Date(Date.now() - 86400000), // Yesterday (overdue)
          createdAt: new Date(Date.now() - 2 * 86400000),
          updatedAt: new Date(),
          category: 'critical-bug',
          estimatedHours: 4,
          dependencies: [],
          tags: ['production', 'payment', 'urgent']
        },
        {
          id: '2',
          title: 'Implement user authentication feature',
          description: 'Add OAuth integration and session management',
          assignee: 'user2',
          priority: 'high',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 7 * 86400000), // Next week
          createdAt: new Date(Date.now() - 5 * 86400000),
          updatedAt: new Date(),
          category: 'feature',
          estimatedHours: 16,
          dependencies: ['3'],
          tags: ['authentication', 'security']
        },
        {
          id: '3',
          title: 'Database schema migration',
          description: 'Update user table structure for new auth system',
          assignee: 'user1',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 3 * 86400000), // In 3 days
          createdAt: new Date(Date.now() - 3 * 86400000),
          updatedAt: new Date(),
          category: 'maintenance',
          estimatedHours: 6,
          dependencies: [],
          tags: ['database', 'migration']
        },
        {
          id: '4',
          title: 'Code review for dashboard redesign',
          description: 'Review pull request for new dashboard UI components',
          assignee: 'user3',
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(Date.now() + 2 * 86400000), // In 2 days
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
          category: 'review',
          estimatedHours: 2,
          dependencies: [],
          tags: ['review', 'frontend']
        },
        {
          id: '5',
          title: 'Update API documentation',
          description: 'Document new endpoints and update existing ones',
          assignee: 'user2',
          priority: 'low',
          status: 'pending',
          dueDate: new Date(Date.now() + 14 * 86400000), // In 2 weeks
          createdAt: new Date(Date.now() - 7 * 86400000),
          updatedAt: new Date(),
          category: 'documentation',
          estimatedHours: 8,
          dependencies: ['2'],
          tags: ['documentation', 'api']
        }
      ];
      
      // Mock user work patterns (in real implementation, calculate from historical data)
      const userPatterns: UserWorkPattern[] = [
        {
          userId: 'user1',
          avgCompletionTime: 6.5,
          preferredCategories: ['critical-bug', 'maintenance', 'performance'],
          peakProductivityHours: [9, 10, 11, 14, 15],
          taskSuccessRate: 0.92,
          workloadCapacity: 40
        },
        {
          userId: 'user2',
          avgCompletionTime: 8.2,
          preferredCategories: ['feature', 'security', 'documentation'],
          peakProductivityHours: [10, 11, 13, 14, 15, 16],
          taskSuccessRate: 0.88,
          workloadCapacity: 35
        },
        {
          userId: 'user3',
          avgCompletionTime: 4.8,
          preferredCategories: ['review', 'testing', 'frontend'],
          peakProductivityHours: [9, 10, 13, 14],
          taskSuccessRate: 0.95,
          workloadCapacity: 30
        }
      ];
      
      // Mock current workloads
      const currentWorkloads = {
        'user1': 25, // 62.5% capacity
        'user2': 30, // 85.7% capacity
        'user3': 15  // 50% capacity
      };
      
      // Filter tasks if needed
      let filteredTasks = tasks;
      if (!includeCompleted) {
        filteredTasks = tasks.filter(task => task.status !== 'completed');
      }
      if (category) {
        filteredTasks = filteredTasks.filter(task => task.category === category);
      }
      if (userId) {
        filteredTasks = filteredTasks.filter(task => task.assignee === userId);
      }
      
      // Get AI prioritization results
      const result = await AITaskPrioritizationService.prioritizeTasks(
        filteredTasks,
        userPatterns,
        currentWorkloads
      );
      
      res.json({
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          requestParams: { userId, includeCompleted, category },
          processingTime: '45ms'
        }
      });
      
    } catch (error) {
      console.error('Error in AI task prioritization:', error);
      res.status(500).json({
        error: 'Failed to prioritize tasks',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get AI recommendations for task optimization
   */
  static async getTaskOptimizationRecommendations(req: Request, res: Response) {
    try {
      const { taskId, userId } = req.params;
      
      // Mock implementation - analyze specific task
      const recommendations = {
        taskId,
        optimizations: [
          {
            type: 'assignee',
            current: userId,
            recommended: 'user3',
            reason: 'Better category match and lower workload',
            impact: 'Reduce completion time by 25%'
          },
          {
            type: 'timing',
            current: 'anytime',
            recommended: '10:00-11:00 AM',
            reason: 'Peak productivity hours for assignee',
            impact: 'Improve quality and speed'
          },
          {
            type: 'dependencies',
            current: 'pending',
            recommended: 'resolve_first',
            reason: 'Blocking dependencies detected',
            impact: 'Prevent delays and rework'
          }
        ],
        predictedImpact: {
          timeReduction: '2.5 hours',
          qualityImprovement: '15%',
          riskReduction: '40%'
        }
      };
      
      res.json({
        success: true,
        data: recommendations
      });
      
    } catch (error) {
      console.error('Error getting task optimization recommendations:', error);
      res.status(500).json({
        error: 'Failed to get recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get AI insights about team productivity and workload
   */
  static async getTeamProductivityInsights(req: Request, res: Response) {
    try {
      const insights = {
        overview: {
          totalTasks: 127,
          completionRate: 0.84,
          averageTaskTime: 6.2,
          teamEfficiency: 0.91,
          bottlenecks: ['code-review', 'testing']
        },
        predictions: {
          nextWeekWorkload: 'high',
          estimatedCompletions: 23,
          potentialDelays: 3,
          resourceNeeded: 'senior-developer'
        },
        recommendations: [
          {
            title: 'Optimize Code Review Process',
            description: 'Implement automated checks to reduce manual review time',
            priority: 'high',
            estimatedImpact: '30% faster reviews'
          },
          {
            title: 'Balance Workload Distribution',
            description: 'Redistribute tasks to prevent burnout and improve delivery',
            priority: 'medium',
            estimatedImpact: '15% better team satisfaction'
          }
        ],
        trends: {
          productivityTrend: 'increasing',
          qualityTrend: 'stable',
          velocityTrend: 'increasing',
          burnoutRisk: 'low'
        }
      };
      
      res.json({
        success: true,
        data: insights,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error getting team productivity insights:', error);
      res.status(500).json({
        error: 'Failed to get insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get AI-powered workload balancing suggestions
   */
  static async getWorkloadBalancingSuggestions(req: Request, res: Response) {
    try {
      const suggestions = {
        currentDistribution: [
          { userId: 'user1', currentTasks: 8, capacity: 10, utilization: 0.8, risk: 'low' },
          { userId: 'user2', currentTasks: 12, capacity: 10, utilization: 1.2, risk: 'high' },
          { userId: 'user3', currentTasks: 5, capacity: 8, utilization: 0.625, risk: 'low' }
        ],
        rebalancingOptions: [
          {
            description: 'Move 2 documentation tasks from user2 to user3',
            impact: {
              user2Utilization: 1.0,
              user3Utilization: 0.875,
              overallEfficiency: '+12%'
            },
            feasibility: 0.9,
            timeToImplement: '30 minutes'
          },
          {
            description: 'Reassign frontend review task to user3',
            impact: {
              user2Utilization: 0.9,
              user3Utilization: 0.75,
              deliveryTime: '-1 day'
            },
            feasibility: 0.95,
            timeToImplement: '10 minutes'
          }
        ],
        aiRecommendation: {
          priority: 'medium',
          action: 'Implement option 1 for better long-term balance',
          reasoning: 'User3 has expertise in documentation and available capacity'
        }
      };
      
      res.json({
        success: true,
        data: suggestions,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error getting workload balancing suggestions:', error);
      res.status(500).json({
        error: 'Failed to get suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
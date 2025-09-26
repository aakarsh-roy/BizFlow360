import { Types } from 'mongoose';
import { AIService, PredictionResult, RecommendationResult } from './AIService';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UserWorkPattern {
  userId: string;
  avgCompletionTime: number;
  preferredCategories: string[];
  peakProductivityHours: number[];
  taskSuccessRate: number;
  workloadCapacity: number;
}

export interface PrioritizedTask extends Task {
  aiPriorityScore: number;
  aiRecommendations: string[];
  predictedCompletionTime: number;
  urgencyFactors: string[];
  riskFactors: string[];
  optimizedAssignee?: string;
}

export interface TaskPrioritizationResult {
  prioritizedTasks: PrioritizedTask[];
  insights: {
    totalTasks: number;
    highPriorityCount: number;
    overdueTasks: number;
    averagePriorityScore: number;
    bottleneckAreas: string[];
    workloadDistribution: Record<string, number>;
    recommendations: RecommendationResult[];
  };
  predictions: {
    completionForecast: PredictionResult[];
    resourceNeeds: string[];
    potentialDelays: string[];
  };
}

export class AITaskPrioritizationService {
  
  /**
   * Intelligently prioritize tasks using AI algorithms
   */
  static async prioritizeTasks(
    tasks: Task[], 
    userPatterns: UserWorkPattern[],
    currentWorkloads: Record<string, number> = {}
  ): Promise<TaskPrioritizationResult> {
    
    // Step 1: Calculate AI priority scores
    const prioritizedTasks = await this.calculateTaskPriorities(tasks, userPatterns, currentWorkloads);
    
    // Step 2: Generate insights and recommendations
    const insights = this.generateTaskInsights(prioritizedTasks, userPatterns);
    
    // Step 3: Make predictions
    const predictions = this.generateTaskPredictions(prioritizedTasks, userPatterns);
    
    return {
      prioritizedTasks: prioritizedTasks.sort((a, b) => b.aiPriorityScore - a.aiPriorityScore),
      insights,
      predictions
    };
  }

  /**
   * Calculate AI-driven priority scores for tasks
   */
  private static async calculateTaskPriorities(
    tasks: Task[], 
    userPatterns: UserWorkPattern[],
    currentWorkloads: Record<string, number>
  ): Promise<PrioritizedTask[]> {
    
    return tasks.map(task => {
      // Base priority score
      let priorityScore = this.getBasePriorityScore(task);
      
      // Time-based urgency
      const urgencyScore = this.calculateUrgencyScore(task);
      priorityScore += urgencyScore * 0.3;
      
      // Dependency impact
      const dependencyScore = this.calculateDependencyScore(task, tasks);
      priorityScore += dependencyScore * 0.2;
      
      // Business impact
      const businessImpactScore = this.calculateBusinessImpactScore(task);
      priorityScore += businessImpactScore * 0.25;
      
      // Resource availability
      const resourceScore = this.calculateResourceAvailabilityScore(task, userPatterns, currentWorkloads);
      priorityScore += resourceScore * 0.15;
      
      // Historical completion patterns
      const patternScore = this.calculatePatternScore(task, userPatterns);
      priorityScore += patternScore * 0.1;
      
      // Generate recommendations
      const recommendations = this.generateTaskRecommendations(task, priorityScore);
      
      // Calculate predicted completion time
      const predictedCompletionTime = this.predictCompletionTime(task, userPatterns);
      
      // Identify factors
      const urgencyFactors = this.identifyUrgencyFactors(task);
      const riskFactors = this.identifyRiskFactors(task, tasks);
      
      // Optimize assignee
      const optimizedAssignee = this.suggestOptimalAssignee(task, userPatterns, currentWorkloads);
      
      return {
        ...task,
        aiPriorityScore: Math.min(100, Math.max(0, priorityScore)),
        aiRecommendations: recommendations,
        predictedCompletionTime,
        urgencyFactors,
        riskFactors,
        optimizedAssignee
      };
    });
  }

  /**
   * Get base priority score from task priority level
   */
  private static getBasePriorityScore(task: Task): number {
    const priorityMap = {
      'urgent': 80,
      'high': 60,
      'medium': 40,
      'low': 20
    };
    return priorityMap[task.priority] || 30;
  }

  /**
   * Calculate urgency score based on due date
   */
  private static calculateUrgencyScore(task: Task): number {
    if (!task.dueDate) return 0;
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    
    if (daysUntilDue < 0) return 30; // Overdue
    if (daysUntilDue < 1) return 25; // Due today
    if (daysUntilDue < 3) return 20; // Due in 2-3 days
    if (daysUntilDue < 7) return 15; // Due this week
    if (daysUntilDue < 14) return 10; // Due in 2 weeks
    
    return 5; // Due later
  }

  /**
   * Calculate dependency impact score
   */
  private static calculateDependencyScore(task: Task, allTasks: Task[]): number {
    if (!task.dependencies || task.dependencies.length === 0) return 0;
    
    let score = 0;
    
    // Check how many tasks depend on this one
    const dependentTasks = allTasks.filter(t => 
      t.dependencies?.includes(task.id)
    );
    
    score += dependentTasks.length * 5; // 5 points per dependent task
    
    // Check if dependencies are blocking
    const blockingDependencies = task.dependencies.filter(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask && depTask.status !== 'completed';
    });
    
    score -= blockingDependencies.length * 3; // Reduce score for blocking dependencies
    
    return Math.max(0, score);
  }

  /**
   * Calculate business impact score based on task characteristics
   */
  private static calculateBusinessImpactScore(task: Task): number {
    let score = 0;
    
    // Category-based impact
    const categoryImpact = {
      'critical-bug': 25,
      'security': 20,
      'customer-facing': 18,
      'revenue-generating': 15,
      'compliance': 12,
      'performance': 10,
      'feature': 8,
      'maintenance': 5,
      'documentation': 3
    };
    
    score += categoryImpact[task.category as keyof typeof categoryImpact] || 5;
    
    // Keywords in title/description that indicate high impact
    const highImpactKeywords = [
      'critical', 'urgent', 'production', 'customer', 'revenue', 
      'security', 'compliance', 'legal', 'audit', 'deadline'
    ];
    
    const text = `${task.title} ${task.description}`.toLowerCase();
    const keywordMatches = highImpactKeywords.filter(keyword => text.includes(keyword));
    score += keywordMatches.length * 2;
    
    return score;
  }

  /**
   * Calculate resource availability score
   */
  private static calculateResourceAvailabilityScore(
    task: Task, 
    userPatterns: UserWorkPattern[],
    currentWorkloads: Record<string, number>
  ): number {
    const assigneePattern = userPatterns.find(p => p.userId === task.assignee);
    if (!assigneePattern) return 0;
    
    const currentWorkload = currentWorkloads[task.assignee] || 0;
    const capacity = assigneePattern.workloadCapacity;
    const utilizationRate = currentWorkload / capacity;
    
    // Higher score for users with lower utilization
    if (utilizationRate < 0.7) return 10; // Under-utilized
    if (utilizationRate < 0.9) return 5;  // Well-utilized
    if (utilizationRate < 1.1) return 0;  // At capacity
    
    return -5; // Over-utilized
  }

  /**
   * Calculate pattern-based score using historical data
   */
  private static calculatePatternScore(task: Task, userPatterns: UserWorkPattern[]): number {
    const assigneePattern = userPatterns.find(p => p.userId === task.assignee);
    if (!assigneePattern) return 0;
    
    let score = 0;
    
    // Assignee's success rate with this category
    if (assigneePattern.preferredCategories.includes(task.category)) {
      score += 5;
    }
    
    // Overall success rate bonus
    score += assigneePattern.taskSuccessRate * 5;
    
    // Time of day optimization
    const currentHour = new Date().getHours();
    if (assigneePattern.peakProductivityHours.includes(currentHour)) {
      score += 3;
    }
    
    return score;
  }

  /**
   * Generate AI recommendations for a task
   */
  private static generateTaskRecommendations(task: Task, priorityScore: number): string[] {
    const recommendations: string[] = [];
    
    if (priorityScore > 80) {
      recommendations.push("🔥 High priority - consider immediate attention");
    }
    
    if (!task.dueDate) {
      recommendations.push("📅 Consider setting a due date for better planning");
    }
    
    if (task.dependencies && task.dependencies.length > 0) {
      recommendations.push("🔗 Check dependency status before starting");
    }
    
    if (!task.estimatedHours) {
      recommendations.push("⏱️ Add time estimate for better resource planning");
    }
    
    if (task.category === 'undefined' || !task.category) {
      recommendations.push("🏷️ Categorize task for better tracking");
    }
    
    const daysSinceCreated = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 3600 * 24);
    if (daysSinceCreated > 7 && task.status === 'pending') {
      recommendations.push("⚠️ Task has been pending for over a week");
    }
    
    return recommendations;
  }

  /**
   * Predict completion time using ML-like algorithm
   */
  private static predictCompletionTime(task: Task, userPatterns: UserWorkPattern[]): number {
    const assigneePattern = userPatterns.find(p => p.userId === task.assignee);
    
    let baseTime = task.estimatedHours || 4; // Default 4 hours
    
    if (assigneePattern) {
      // Adjust based on assignee's average completion time
      const categoryMultiplier = assigneePattern.preferredCategories.includes(task.category) ? 0.8 : 1.2;
      baseTime *= categoryMultiplier;
      
      // Adjust based on success rate
      const skillMultiplier = 2 - assigneePattern.taskSuccessRate; // Higher success rate = faster completion
      baseTime *= skillMultiplier;
    }
    
    // Adjust based on task complexity indicators
    const complexityKeywords = ['complex', 'difficult', 'challenging', 'integration', 'migration'];
    const text = `${task.title} ${task.description}`.toLowerCase();
    const complexityMatches = complexityKeywords.filter(keyword => text.includes(keyword));
    baseTime *= (1 + complexityMatches.length * 0.3);
    
    return Math.round(baseTime * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Identify urgency factors
   */
  private static identifyUrgencyFactors(task: Task): string[] {
    const factors: string[] = [];
    
    if (task.dueDate) {
      const daysUntilDue = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
      if (daysUntilDue < 0) factors.push("Overdue");
      else if (daysUntilDue < 1) factors.push("Due today");
      else if (daysUntilDue < 3) factors.push("Due soon");
    }
    
    if (task.priority === 'urgent') factors.push("Marked as urgent");
    if (task.category === 'critical-bug') factors.push("Critical bug");
    if (task.category === 'security') factors.push("Security issue");
    
    const urgentKeywords = ['critical', 'urgent', 'asap', 'immediate', 'emergency'];
    const text = `${task.title} ${task.description}`.toLowerCase();
    urgentKeywords.forEach(keyword => {
      if (text.includes(keyword)) factors.push(`Contains keyword: ${keyword}`);
    });
    
    return factors;
  }

  /**
   * Identify risk factors
   */
  private static identifyRiskFactors(task: Task, allTasks: Task[]): string[] {
    const factors: string[] = [];
    
    if (task.dependencies && task.dependencies.length > 0) {
      factors.push(`Has ${task.dependencies.length} dependencies`);
      
      const blockingDeps = task.dependencies.filter(depId => {
        const depTask = allTasks.find(t => t.id === depId);
        return depTask && depTask.status !== 'completed';
      });
      
      if (blockingDeps.length > 0) {
        factors.push(`${blockingDeps.length} blocking dependencies`);
      }
    }
    
    if (!task.estimatedHours) factors.push("No time estimate");
    if (!task.assignee) factors.push("Unassigned");
    if (task.status === 'on-hold') factors.push("Currently on hold");
    
    const daysSinceCreated = (Date.now() - new Date(task.createdAt).getTime()) / (1000 * 3600 * 24);
    if (daysSinceCreated > 14) factors.push("Task older than 2 weeks");
    
    return factors;
  }

  /**
   * Suggest optimal assignee based on patterns and workload
   */
  private static suggestOptimalAssignee(
    task: Task,
    userPatterns: UserWorkPattern[],
    currentWorkloads: Record<string, number>
  ): string | undefined {
    
    // Find users who prefer this category and have capacity
    const suitableCandidates = userPatterns.filter(pattern => {
      const workload = currentWorkloads[pattern.userId] || 0;
      const utilizationRate = workload / pattern.workloadCapacity;
      
      return pattern.preferredCategories.includes(task.category) && 
             utilizationRate < 0.9 && // Not over-utilized
             pattern.taskSuccessRate > 0.7; // Good success rate
    });
    
    if (suitableCandidates.length === 0) return undefined;
    
    // Sort by combination of success rate and available capacity
    suitableCandidates.sort((a, b) => {
      const aUtilization = (currentWorkloads[a.userId] || 0) / a.workloadCapacity;
      const bUtilization = (currentWorkloads[b.userId] || 0) / b.workloadCapacity;
      
      const aScore = a.taskSuccessRate * (1 - aUtilization);
      const bScore = b.taskSuccessRate * (1 - bUtilization);
      
      return bScore - aScore;
    });
    
    return suitableCandidates[0].userId;
  }

  /**
   * Generate comprehensive insights about the task set
   */
  private static generateTaskInsights(
    tasks: PrioritizedTask[], 
    userPatterns: UserWorkPattern[]
  ) {
    const totalTasks = tasks.length;
    const highPriorityCount = tasks.filter(t => t.aiPriorityScore > 70).length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    
    const averagePriorityScore = tasks.reduce((sum, t) => sum + t.aiPriorityScore, 0) / totalTasks;
    
    // Identify bottleneck areas
    const categoryCount = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bottleneckAreas = Object.entries(categoryCount)
      .filter(([, count]) => count > totalTasks * 0.2)
      .map(([category]) => category);
    
    // Calculate workload distribution
    const workloadDistribution = tasks.reduce((acc, task) => {
      acc[task.assignee] = (acc[task.assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate recommendations
    const recommendations: RecommendationResult[] = [];
    
    if (overdueTasks > 0) {
      recommendations.push({
        recommendation: `Focus on ${overdueTasks} overdue tasks immediately`,
        priority: 'urgent',
        impact_score: 0.9,
        action_items: ['Review overdue tasks', 'Reassign if necessary', 'Set new realistic deadlines'],
        expected_outcome: 'Reduced backlog and improved delivery'
      });
    }
    
    if (bottleneckAreas.length > 0) {
      recommendations.push({
        recommendation: `Address bottlenecks in: ${bottleneckAreas.join(', ')}`,
        priority: 'high',
        impact_score: 0.7,
        action_items: ['Allocate more resources', 'Cross-train team members', 'Streamline processes'],
        expected_outcome: 'Improved workflow efficiency'
      });
    }
    
    return {
      totalTasks,
      highPriorityCount,
      overdueTasks,
      averagePriorityScore: Math.round(averagePriorityScore * 10) / 10,
      bottleneckAreas,
      workloadDistribution,
      recommendations
    };
  }

  /**
   * Generate predictions about task completion and resource needs
   */
  private static generateTaskPredictions(
    tasks: PrioritizedTask[],
    userPatterns: UserWorkPattern[]
  ) {
    const completionForecast: PredictionResult[] = [];
    const resourceNeeds: string[] = [];
    const potentialDelays: string[] = [];
    
    // Predict completion timeline
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.predictedCompletionTime, 0);
    const avgTeamCapacity = userPatterns.reduce((sum, p) => sum + p.workloadCapacity, 0);
    
    if (avgTeamCapacity > 0) {
      const weeksToComplete = totalEstimatedHours / (avgTeamCapacity * 40); // 40 hours per week
      
      completionForecast.push({
        predicted_value: weeksToComplete,
        confidence: 0.75,
        trend: weeksToComplete > 4 ? 'increasing' : 'stable',
        factors: ['Current workload', 'Team capacity', 'Task complexity'],
        accuracy_score: 0.8
      });
    }
    
    // Identify resource needs
    const highWorkloadUsers = Object.entries(
      tasks.reduce((acc, task) => {
        acc[task.assignee] = (acc[task.assignee] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).filter(([, count]) => count > 5);
    
    if (highWorkloadUsers.length > 0) {
      resourceNeeds.push(`Additional resources needed for: ${highWorkloadUsers.map(([user]) => user).join(', ')}`);
    }
    
    // Identify potential delays
    const riskTasks = tasks.filter(t => t.riskFactors.length > 2);
    if (riskTasks.length > 0) {
      potentialDelays.push(`${riskTasks.length} tasks have high risk of delays`);
    }
    
    const dependentTasks = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
    if (dependentTasks.length > tasks.length * 0.3) {
      potentialDelays.push('High dependency chains may cause cascading delays');
    }
    
    return {
      completionForecast,
      resourceNeeds,
      potentialDelays
    };
  }
}
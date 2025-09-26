import api from '../utils/api';

export interface AITaskPrioritizationResult {
  prioritizedTasks: Array<{
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: string;
    status: string;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    category: string;
    aiPriorityScore: number;
    aiRecommendations: string[];
    predictedCompletionTime: number;
    urgencyFactors: string[];
    riskFactors: string[];
    optimizedAssignee?: string;
  }>;
  insights: {
    totalTasks: number;
    highPriorityCount: number;
    overdueTasks: number;
    averagePriorityScore: number;
    bottleneckAreas: string[];
    workloadDistribution: Record<string, number>;
    recommendations: Array<{
      recommendation: string;
      priority: string;
      impact_score: number;
      action_items: string[];
      expected_outcome: string;
    }>;
  };
  predictions: {
    completionForecast: Array<{
      predicted_value: number;
      confidence: number;
      trend: string;
      factors: string[];
    }>;
    resourceNeeds: string[];
    potentialDelays: string[];
  };
}

export interface TaskOptimization {
  taskId: string;
  optimizations: Array<{
    type: string;
    current: string;
    recommended: string;
    reason: string;
    impact: string;
  }>;
  predictedImpact: {
    timeReduction: string;
    qualityImprovement: string;
    riskReduction: string;
  };
}

export interface ProductivityInsights {
  overview: {
    totalTasks: number;
    completionRate: number;
    averageTaskTime: number;
    teamEfficiency: number;
    bottlenecks: string[];
  };
  predictions: {
    nextWeekWorkload: string;
    estimatedCompletions: number;
    potentialDelays: number;
    resourceNeeded: string;
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    estimatedImpact: string;
  }>;
  trends: {
    productivityTrend: string;
    qualityTrend: string;
    velocityTrend: string;
    burnoutRisk: string;
  };
}

export interface WorkloadBalancing {
  currentDistribution: Array<{
    userId: string;
    currentTasks: number;
    capacity: number;
    utilization: number;
    risk: string;
  }>;
  rebalancingOptions: Array<{
    description: string;
    impact: {
      user2Utilization?: number;
      user3Utilization?: number;
      overallEfficiency?: string;
      deliveryTime?: string;
    };
    feasibility: number;
    timeToImplement: string;
  }>;
  aiRecommendation: {
    priority: string;
    action: string;
    reasoning: string;
  };
}

export class AITaskService {
  
  /**
   * Get AI-prioritized tasks with intelligent scoring
   */
  static async getAIPrioritizedTasks(params?: {
    userId?: string;
    includeCompleted?: boolean;
    category?: string;
  }): Promise<AITaskPrioritizationResult> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.includeCompleted) queryParams.append('includeCompleted', 'true');
      if (params?.category) queryParams.append('category', params.category);
      
      const response = await api.get(`/ai/tasks/prioritized?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching AI prioritized tasks:', error);
      throw error;
    }
  }
  
  /**
   * Get optimization recommendations for a specific task
   */
  static async getTaskOptimizationRecommendations(taskId: string, userId: string): Promise<TaskOptimization> {
    try {
      const response = await api.get(`/ai/tasks/${taskId}/optimize/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching task optimization recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Get team productivity insights
   */
  static async getTeamProductivityInsights(): Promise<ProductivityInsights> {
    try {
      const response = await api.get('/ai/insights/productivity');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching productivity insights:', error);
      throw error;
    }
  }
  
  /**
   * Get workload balancing suggestions
   */
  static async getWorkloadBalancingSuggestions(): Promise<WorkloadBalancing> {
    try {
      const response = await api.get('/ai/workload/balance');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching workload balancing suggestions:', error);
      throw error;
    }
  }
  
  /**
   * Generate AI task insights summary
   */
  static generateTaskInsightsSummary(insights: AITaskPrioritizationResult['insights']): string {
    const { totalTasks, highPriorityCount, overdueTasks, averagePriorityScore } = insights;
    
    let summary = `📊 **Task Overview**: ${totalTasks} total tasks with average AI priority score of ${averagePriorityScore.toFixed(1)}/100.\\n\\n`;
    
    if (highPriorityCount > 0) {
      summary += `🔥 **High Priority**: ${highPriorityCount} tasks require immediate attention.\\n`;
    }
    
    if (overdueTasks > 0) {
      summary += `⚠️ **Overdue**: ${overdueTasks} tasks are past their due date.\\n`;
    }
    
    if (insights.bottleneckAreas.length > 0) {
      summary += `🚧 **Bottlenecks**: Issues detected in ${insights.bottleneckAreas.join(', ')}.\\n`;
    }
    
    return summary;
  }
  
  /**
   * Calculate task urgency level based on AI score
   */
  static getTaskUrgencyLevel(aiScore: number): {
    level: 'low' | 'medium' | 'high' | 'critical';
    color: 'success' | 'warning' | 'error' | 'primary';
    icon: string;
  } {
    if (aiScore >= 90) {
      return { level: 'critical', color: 'error', icon: '🔥' };
    } else if (aiScore >= 70) {
      return { level: 'high', color: 'warning', icon: '⚡' };
    } else if (aiScore >= 50) {
      return { level: 'medium', color: 'primary', icon: '📋' };
    } else {
      return { level: 'low', color: 'success', icon: '📝' };
    }
  }
  
  /**
   * Format AI recommendations for display
   */
  static formatRecommendations(recommendations: string[]): Array<{
    text: string;
    icon: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    return recommendations.map(rec => {
      let icon = '💡';
      let priority: 'high' | 'medium' | 'low' = 'medium';
      
      if (rec.includes('High priority') || rec.includes('urgent')) {
        icon = '🔥';
        priority = 'high';
      } else if (rec.includes('Consider') || rec.includes('Add')) {
        icon = '📝';
        priority = 'low';
      } else if (rec.includes('Check') || rec.includes('Review')) {
        icon = '🔍';
        priority = 'medium';
      }
      
      return {
        text: rec,
        icon,
        priority
      };
    });
  }
  
  /**
   * Calculate team efficiency metrics
   */
  static calculateTeamEfficiency(workloadDistribution: Record<string, number>): {
    totalWorkload: number;
    averageTasksPerUser: number;
    workloadVariance: number;
    isBalanced: boolean;
  } {
    const workloads = Object.values(workloadDistribution);
    const totalWorkload = workloads.reduce((sum, load) => sum + load, 0);
    const averageTasksPerUser = totalWorkload / workloads.length;
    
    const variance = workloads.reduce((sum, load) => {
      return sum + Math.pow(load - averageTasksPerUser, 2);
    }, 0) / workloads.length;
    
    const workloadVariance = Math.sqrt(variance);
    const isBalanced = workloadVariance < averageTasksPerUser * 0.3; // 30% threshold
    
    return {
      totalWorkload,
      averageTasksPerUser: Math.round(averageTasksPerUser * 10) / 10,
      workloadVariance: Math.round(workloadVariance * 10) / 10,
      isBalanced
    };
  }
}
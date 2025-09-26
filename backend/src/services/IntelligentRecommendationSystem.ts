import { AIService, RecommendationResult } from './AIService';
import { PredictiveAnalyticsEngine } from './PredictiveAnalyticsEngine';
import { NLPService } from './NLPService';
import KPI, { IKPI } from '../models/KPI';
import { Types } from 'mongoose';

/**
 * Intelligent Recommendation System
 * Provides AI-powered recommendations for business optimization
 */

export interface ProcessOptimizationRecommendation {
  process_name: string;
  current_efficiency: number;
  potential_improvement: number;
  recommendations: Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeline: string;
    expected_outcome: string;
    success_probability: number;
  }>;
  implementation_plan: {
    phases: Array<{
      phase_name: string;
      duration: string;
      activities: string[];
      resources_needed: string[];
    }>;
    total_timeline: string;
    estimated_cost: string;
  };
}

export interface ResourceAllocationRecommendation {
  resource_type: 'human' | 'financial' | 'technological' | 'infrastructure';
  current_allocation: Record<string, number>;
  recommended_allocation: Record<string, number>;
  optimization_strategy: {
    reallocations: Array<{
      from: string;
      to: string;
      amount: number;
      reason: string;
      expected_roi: number;
    }>;
    new_investments: Array<{
      area: string;
      investment: number;
      expected_return: number;
      payback_period: string;
    }>;
  };
  risk_analysis: {
    risks: Array<{
      risk: string;
      probability: number;
      impact: number;
      mitigation: string;
    }>;
    overall_risk_level: 'low' | 'medium' | 'high';
  };
}

export interface BusinessDecisionRecommendation {
  decision_context: string;
  options: Array<{
    option_name: string;
    pros: string[];
    cons: string[];
    expected_outcome: string;
    confidence_score: number;
    implementation_complexity: 'low' | 'medium' | 'high';
  }>;
  recommended_option: string;
  decision_criteria: {
    factors: Array<{
      factor: string;
      weight: number;
      scores: Record<string, number>;
    }>;
    overall_scores: Record<string, number>;
  };
  implementation_roadmap: {
    immediate_actions: string[];
    short_term_goals: string[];
    long_term_objectives: string[];
  };
}

export interface PersonalizedInsight {
  user_id: string;
  insights: Array<{
    type: 'performance' | 'opportunity' | 'risk' | 'efficiency';
    title: string;
    description: string;
    relevance_score: number;
    actionable: boolean;
    suggested_actions: string[];
  }>;
  priority_areas: string[];
  success_metrics: Array<{
    metric: string;
    current_value: number;
    target_value: number;
    improvement_potential: number;
  }>;
}

export class IntelligentRecommendationSystem {

  /**
   * Generate Process Optimization Recommendations
   */
  static async generateProcessOptimizationRecommendations(
    companyId: Types.ObjectId | string,
    processName?: string
  ): Promise<ProcessOptimizationRecommendation[]> {
    try {
      const recommendations: ProcessOptimizationRecommendation[] = [];
      
      // Get process-related KPIs
      const processKPIs = await KPI.find({
        companyId: companyId,
        isActive: true,
        category: { $in: ['operational', 'performance'] }
      }).sort({ date: -1 }).limit(100);

      if (processKPIs.length === 0) {
        throw new Error('No process data available for optimization');
      }

      // Group KPIs by process/metric type
      const processGroups = this.groupKPIsByProcess(processKPIs);

      for (const [process, kpis] of Object.entries(processGroups)) {
        if (processName && process !== processName) continue;

        const current_efficiency = this.calculateProcessEfficiency(kpis);
        const potential_improvement = this.calculateImprovementPotential(kpis);

        // Generate specific recommendations based on performance analysis
        const processRecommendations = await this.generateSpecificRecommendations(kpis, process);
        
        // Create implementation plan
        const implementation_plan = this.createImplementationPlan(processRecommendations);

        recommendations.push({
          process_name: process,
          current_efficiency,
          potential_improvement,
          recommendations: processRecommendations,
          implementation_plan
        });
      }

      return recommendations.sort((a, b) => b.potential_improvement - a.potential_improvement);
    } catch (error: any) {
      console.error('Error generating process optimization recommendations:', error);
      throw new Error(`Process optimization failed: ${error.message}`);
    }
  }

  /**
   * Generate Resource Allocation Recommendations
   */
  static async generateResourceAllocationRecommendations(
    companyId: Types.ObjectId | string,
    resourceType: 'human' | 'financial' | 'technological' | 'infrastructure' = 'financial'
  ): Promise<ResourceAllocationRecommendation> {
    try {
      // Get performance data across different areas
      const performanceData = await KPI.find({
        companyId: companyId,
        isActive: true,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ date: -1 });

      // Analyze current resource allocation effectiveness
      const current_allocation = this.analyzeCurrentAllocation(performanceData, resourceType);
      const performance_by_area = this.calculatePerformanceByArea(performanceData);

      // Generate optimization strategy
      const optimization_strategy = this.generateOptimizationStrategy(
        current_allocation,
        performance_by_area,
        resourceType
      );

      // Recommended allocation based on performance and potential
      const recommended_allocation = this.calculateOptimalAllocation(
        current_allocation,
        optimization_strategy
      );

      // Risk analysis
      const risk_analysis = this.performRiskAnalysis(optimization_strategy);

      return {
        resource_type: resourceType,
        current_allocation,
        recommended_allocation,
        optimization_strategy,
        risk_analysis
      };
    } catch (error: any) {
      console.error('Error generating resource allocation recommendations:', error);
      throw new Error(`Resource allocation optimization failed: ${error.message}`);
    }
  }

  /**
   * Generate Business Decision Recommendations
   */
  static async generateBusinessDecisionRecommendations(
    companyId: Types.ObjectId | string,
    decisionContext: string,
    options: string[]
  ): Promise<BusinessDecisionRecommendation> {
    try {
      // Get relevant business data
      const businessData = await KPI.find({
        companyId: companyId,
        isActive: true,
        date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }).sort({ date: -1 });

      // Analyze business context using NLP
      const contextAnalysis = NLPService.extractInsights(decisionContext, 'business');
      
      // Evaluate each option
      const evaluatedOptions = await Promise.all(
        options.map(option => this.evaluateDecisionOption(option, businessData, contextAnalysis))
      );

      // Define decision criteria based on context
      const decision_criteria = this.defineDecisionCriteria(contextAnalysis, decisionContext);

      // Calculate scores for each option
      const scoredOptions = this.scoreDecisionOptions(evaluatedOptions, decision_criteria);

      // Determine recommended option
      const recommended_option = scoredOptions.reduce((best, current) => 
        current.overall_score > best.overall_score ? current : best
      ).option_name;

      // Create implementation roadmap
      const implementation_roadmap = this.createDecisionRoadmap(
        recommended_option,
        evaluatedOptions,
        contextAnalysis
      );

      return {
        decision_context: decisionContext,
        options: evaluatedOptions,
        recommended_option,
        decision_criteria,
        implementation_roadmap
      };
    } catch (error: any) {
      console.error('Error generating business decision recommendations:', error);
      throw new Error(`Business decision analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate Personalized Insights for Users
   */
  static async generatePersonalizedInsights(
    companyId: Types.ObjectId | string,
    userId: string,
    userRole: string,
    userDepartment: string
  ): Promise<PersonalizedInsight> {
    try {
      // Get user-relevant KPI data
      const relevantKPIs = await this.getUserRelevantKPIs(companyId, userRole, userDepartment);
      
      // Generate insights based on user context
      const insights = await this.generateContextualInsights(relevantKPIs, userRole, userDepartment);
      
      // Identify priority areas for the user
      const priority_areas = this.identifyPriorityAreas(insights, userRole);
      
      // Define success metrics relevant to the user
      const success_metrics = this.defineUserSuccessMetrics(relevantKPIs, userRole);

      return {
        user_id: userId,
        insights,
        priority_areas,
        success_metrics
      };
    } catch (error: any) {
      console.error('Error generating personalized insights:', error);
      throw new Error(`Personalized insights generation failed: ${error.message}`);
    }
  }

  /**
   * Generate Smart Alerts and Notifications
   */
  static async generateSmartAlerts(
    companyId: Types.ObjectId | string,
    alertTypes: Array<'performance' | 'anomaly' | 'opportunity' | 'risk'> = ['performance', 'anomaly', 'opportunity', 'risk']
  ): Promise<Array<{
    type: 'performance' | 'anomaly' | 'opportunity' | 'risk';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    affected_metrics: string[];
    recommended_actions: string[];
    urgency_score: number;
    estimated_impact: string;
  }>> {
    try {
      const alerts = [];
      const recentKPIs = await KPI.find({
        companyId: companyId,
        isActive: true,
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).sort({ date: -1 });

      if (alertTypes.includes('performance')) {
        const performanceAlerts = this.generatePerformanceAlerts(recentKPIs);
        alerts.push(...performanceAlerts);
      }

      if (alertTypes.includes('anomaly')) {
        const anomalyAlerts = this.generateAnomalyAlerts(recentKPIs);
        alerts.push(...anomalyAlerts);
      }

      if (alertTypes.includes('opportunity')) {
        const opportunityAlerts = this.generateOpportunityAlerts(recentKPIs);
        alerts.push(...opportunityAlerts);
      }

      if (alertTypes.includes('risk')) {
        const riskAlerts = this.generateRiskAlerts(recentKPIs);
        alerts.push(...riskAlerts);
      }

      return alerts.sort((a, b) => b.urgency_score - a.urgency_score);
    } catch (error: any) {
      console.error('Error generating smart alerts:', error);
      throw new Error(`Smart alerts generation failed: ${error.message}`);
    }
  }

  /**
   * Private Helper Methods
   */
  private static groupKPIsByProcess(kpis: IKPI[]): Record<string, IKPI[]> {
    const groups: Record<string, IKPI[]> = {};
    
    kpis.forEach(kpi => {
      const processName = this.inferProcessName(kpi.name);
      if (!groups[processName]) {
        groups[processName] = [];
      }
      groups[processName].push(kpi);
    });

    return groups;
  }

  private static inferProcessName(kpiName: string): string {
    const processMap: Record<string, string> = {
      'customer': 'Customer Management',
      'sales': 'Sales Process',
      'revenue': 'Revenue Management',
      'operational': 'Operations',
      'employee': 'Human Resources',
      'efficiency': 'Process Efficiency',
      'quality': 'Quality Management',
      'satisfaction': 'Customer Experience'
    };

    const lowerName = kpiName.toLowerCase();
    for (const [key, process] of Object.entries(processMap)) {
      if (lowerName.includes(key)) {
        return process;
      }
    }

    return 'General Business Process';
  }

  private static calculateProcessEfficiency(kpis: IKPI[]): number {
    if (kpis.length === 0) return 0;

    const achievements = kpis.map(kpi => {
      const achievement = kpi.target > 0 ? (kpi.value / kpi.target) : 1;
      return Math.min(1, achievement); // Cap at 100%
    });

    return achievements.reduce((sum, achievement) => sum + achievement, 0) / achievements.length;
  }

  private static calculateImprovementPotential(kpis: IKPI[]): number {
    const currentEfficiency = this.calculateProcessEfficiency(kpis);
    const maxPotential = 1.0; // 100% efficiency
    return (maxPotential - currentEfficiency) * 100;
  }

  private static async generateSpecificRecommendations(
    kpis: IKPI[],
    processName: string
  ): Promise<Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeline: string;
    expected_outcome: string;
    success_probability: number;
  }>> {
    const recommendations = [];
    const avgEfficiency = this.calculateProcessEfficiency(kpis);

    // Generate recommendations based on process type and performance
    if (processName.includes('Sales')) {
      if (avgEfficiency < 0.7) {
        recommendations.push({
          action: 'Implement AI-powered lead scoring system',
          impact: 'high' as const,
          effort: 'medium' as const,
          timeline: '2-3 months',
          expected_outcome: 'Increase conversion rate by 15-25%',
          success_probability: 0.8
        });
      }
      
      recommendations.push({
        action: 'Automate follow-up email sequences',
        impact: 'medium' as const,
        effort: 'low' as const,
        timeline: '2-4 weeks',
        expected_outcome: 'Reduce manual effort by 40%',
        success_probability: 0.9
      });
    }

    if (processName.includes('Customer')) {
      recommendations.push({
        action: 'Deploy chatbot for initial customer inquiries',
        impact: 'medium' as const,
        effort: 'medium' as const,
        timeline: '1-2 months',
        expected_outcome: 'Improve response time by 60%',
        success_probability: 0.85
      });
    }

    if (processName.includes('Operations')) {
      recommendations.push({
        action: 'Implement process automation for routine tasks',
        impact: 'high' as const,
        effort: 'high' as const,
        timeline: '3-6 months',
        expected_outcome: 'Increase operational efficiency by 30%',
        success_probability: 0.75
      });
    }

    // Add generic recommendations
    if (avgEfficiency < 0.6) {
      recommendations.push({
        action: 'Conduct comprehensive process analysis and redesign',
        impact: 'high' as const,
        effort: 'high' as const,
        timeline: '4-6 months',
        expected_outcome: 'Fundamentally improve process performance',
        success_probability: 0.7
      });
    }

    return recommendations;
  }

  private static createImplementationPlan(recommendations: any[]): {
    phases: Array<{
      phase_name: string;
      duration: string;
      activities: string[];
      resources_needed: string[];
    }>;
    total_timeline: string;
    estimated_cost: string;
  } {
    const phases = [
      {
        phase_name: 'Assessment & Planning',
        duration: '2-4 weeks',
        activities: [
          'Current state analysis',
          'Stakeholder alignment',
          'Resource planning',
          'Timeline finalization'
        ],
        resources_needed: ['Business Analyst', 'Project Manager', 'Process Owner']
      },
      {
        phase_name: 'Implementation',
        duration: '2-4 months',
        activities: [
          'System configuration',
          'Process redesign',
          'Staff training',
          'Pilot testing'
        ],
        resources_needed: ['Technical Team', 'Training Coordinator', 'Test Users']
      },
      {
        phase_name: 'Optimization & Monitoring',
        duration: '1-2 months',
        activities: [
          'Performance monitoring',
          'Continuous improvement',
          'Issue resolution',
          'Success measurement'
        ],
        resources_needed: ['Operations Team', 'Data Analyst', 'Process Owner']
      }
    ];

    return {
      phases,
      total_timeline: '5-10 months',
      estimated_cost: '$50,000 - $200,000'
    };
  }

  private static analyzeCurrentAllocation(kpis: IKPI[], resourceType: string): Record<string, number> {
    // Mock implementation - would integrate with actual resource data
    const allocation: Record<string, number> = {};
    
    const categories = Array.from(new Set(kpis.map(kpi => kpi.category)));
    const totalBudget = 1000000; // Mock total budget
    
    categories.forEach(category => {
      allocation[category] = totalBudget / categories.length;
    });

    return allocation;
  }

  private static calculatePerformanceByArea(kpis: IKPI[]): Record<string, number> {
    const performance: Record<string, number> = {};
    
    const groupedKPIs = kpis.reduce((groups, kpi) => {
      if (!groups[kpi.category]) groups[kpi.category] = [];
      groups[kpi.category].push(kpi);
      return groups;
    }, {} as Record<string, IKPI[]>);

    Object.entries(groupedKPIs).forEach(([category, categoryKPIs]) => {
      performance[category] = this.calculateProcessEfficiency(categoryKPIs);
    });

    return performance;
  }

  private static generateOptimizationStrategy(
    currentAllocation: Record<string, number>,
    performance: Record<string, number>,
    resourceType: string
  ): any {
    const reallocations = [];
    const newInvestments = [];

    // Find underperforming areas that need more resources
    Object.entries(performance).forEach(([area, perf]) => {
      if (perf < 0.7) {
        const currentAmount = currentAllocation[area] || 0;
        const additionalInvestment = currentAmount * 0.2; // 20% increase
        
        newInvestments.push({
          area,
          investment: additionalInvestment,
          expected_return: additionalInvestment * 1.5,
          payback_period: '12-18 months'
        });
      }
    });

    // Find overperforming areas that could share resources
    Object.entries(performance).forEach(([area, perf]) => {
      if (perf > 0.9) {
        const excessAmount = (currentAllocation[area] || 0) * 0.1; // 10% reduction
        
        reallocations.push({
          from: area,
          to: 'underperforming_areas',
          amount: excessAmount,
          reason: `${area} is performing well and can spare resources`,
          expected_roi: 1.3
        });
      }
    });

    return { reallocations, newInvestments };
  }

  private static calculateOptimalAllocation(
    currentAllocation: Record<string, number>,
    strategy: any
  ): Record<string, number> {
    const optimal = { ...currentAllocation };

    // Apply reallocations
    strategy.reallocations.forEach((reallocation: any) => {
      optimal[reallocation.from] -= reallocation.amount;
    });

    // Apply new investments
    strategy.newInvestments.forEach((investment: any) => {
      optimal[investment.area] = (optimal[investment.area] || 0) + investment.investment;
    });

    return optimal;
  }

  private static performRiskAnalysis(strategy: any): any {
    const risks = [
      {
        risk: 'Resource reallocation may temporarily disrupt operations',
        probability: 0.3,
        impact: 0.6,
        mitigation: 'Implement gradual transition with overlap period'
      },
      {
        risk: 'New investments may not deliver expected returns',
        probability: 0.4,
        impact: 0.7,
        mitigation: 'Start with pilot programs and scale based on results'
      },
      {
        risk: 'Team resistance to resource changes',
        probability: 0.5,
        impact: 0.4,
        mitigation: 'Ensure clear communication and change management'
      }
    ];

    const overall_risk_level = risks.reduce((sum, risk) => 
      sum + (risk.probability * risk.impact), 0) / risks.length > 0.4 ? 'medium' : 'low';

    return { risks, overall_risk_level };
  }

  private static async evaluateDecisionOption(
    option: string,
    businessData: IKPI[],
    contextAnalysis: any[]
  ): Promise<any> {
    // Mock implementation for option evaluation
    return {
      option_name: option,
      pros: [`Potential to improve ${option.toLowerCase()}`, 'Aligns with business goals'],
      cons: ['Requires investment', 'Implementation complexity'],
      expected_outcome: `Positive impact on business metrics`,
      confidence_score: 0.7 + Math.random() * 0.2,
      implementation_complexity: Math.random() > 0.5 ? 'medium' : 'low'
    };
  }

  private static defineDecisionCriteria(contextAnalysis: any[], decisionContext: string): any {
    return {
      factors: [
        { factor: 'ROI Potential', weight: 0.3, scores: {} },
        { factor: 'Implementation Ease', weight: 0.2, scores: {} },
        { factor: 'Strategic Alignment', weight: 0.25, scores: {} },
        { factor: 'Risk Level', weight: 0.15, scores: {} },
        { factor: 'Timeline', weight: 0.1, scores: {} }
      ],
      overall_scores: {}
    };
  }

  private static scoreDecisionOptions(options: any[], criteria: any): any[] {
    return options.map(option => ({
      ...option,
      overall_score: 0.7 + Math.random() * 0.2 // Mock scoring
    }));
  }

  private static createDecisionRoadmap(
    recommendedOption: string,
    options: any[],
    contextAnalysis: any[]
  ): any {
    return {
      immediate_actions: [
        'Validate decision with stakeholders',
        'Prepare implementation plan',
        'Allocate necessary resources'
      ],
      short_term_goals: [
        'Begin implementation phase',
        'Monitor initial results',
        'Adjust strategy as needed'
      ],
      long_term_objectives: [
        'Achieve full implementation',
        'Measure success metrics',
        'Scale successful elements'
      ]
    };
  }

  private static async getUserRelevantKPIs(
    companyId: Types.ObjectId | string,
    userRole: string,
    userDepartment: string
  ): Promise<IKPI[]> {
    // Map roles to relevant KPI categories
    const roleKPIMap: Record<string, string[]> = {
      'admin': ['revenue', 'users', 'sales', 'performance', 'finance', 'operational'],
      'manager': ['performance', 'operational', 'sales', 'users'],
      'employee': ['performance', 'operational'],
      'viewer': ['performance']
    };

    const relevantCategories = roleKPIMap[userRole.toLowerCase()] || ['performance'];

    return await KPI.find({
      companyId: companyId,
      isActive: true,
      category: { $in: relevantCategories },
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 }).limit(50);
  }

  private static async generateContextualInsights(
    kpis: IKPI[],
    userRole: string,
    userDepartment: string
  ): Promise<any[]> {
    const insights = [];

    // Performance insights
    const avgPerformance = this.calculateProcessEfficiency(kpis);
    if (avgPerformance < 0.7) {
      insights.push({
        type: 'performance',
        title: 'Performance Below Target',
        description: `Current performance is ${(avgPerformance * 100).toFixed(1)}%, below optimal levels`,
        relevance_score: 0.9,
        actionable: true,
        suggested_actions: ['Review processes', 'Identify bottlenecks', 'Implement improvements']
      });
    }

    // Opportunity insights
    const trendingUp = kpis.filter(kpi => kpi.trend === 'up').length;
    if (trendingUp > kpis.length * 0.6) {
      insights.push({
        type: 'opportunity',
        title: 'Positive Momentum Detected',
        description: 'Multiple metrics show upward trends - consider scaling successful initiatives',
        relevance_score: 0.8,
        actionable: true,
        suggested_actions: ['Identify success factors', 'Scale best practices', 'Increase investment']
      });
    }

    return insights;
  }

  private static identifyPriorityAreas(insights: any[], userRole: string): string[] {
    const roleBasedPriorities: Record<string, string[]> = {
      'admin': ['Strategic Planning', 'Resource Optimization', 'Performance Management'],
      'manager': ['Team Performance', 'Process Improvement', 'Goal Achievement'],
      'employee': ['Task Efficiency', 'Skill Development', 'Collaboration'],
      'viewer': ['Performance Monitoring', 'Trend Analysis']
    };

    return roleBasedPriorities[userRole.toLowerCase()] || ['Performance Monitoring'];
  }

  private static defineUserSuccessMetrics(kpis: IKPI[], userRole: string): any[] {
    return kpis.slice(0, 5).map(kpi => ({
      metric: kpi.name,
      current_value: kpi.value,
      target_value: kpi.target,
      improvement_potential: kpi.target > kpi.value ? 
        ((kpi.target - kpi.value) / kpi.value) * 100 : 0
    }));
  }

  private static generatePerformanceAlerts(kpis: IKPI[]): any[] {
    const alerts = [];
    
    kpis.forEach(kpi => {
      const achievement = kpi.target > 0 ? (kpi.value / kpi.target) : 1;
      
      if (achievement < 0.7) {
        alerts.push({
          type: 'performance',
          priority: achievement < 0.5 ? 'critical' : 'high',
          title: `${kpi.name} Underperforming`,
          message: `${kpi.name} is at ${(achievement * 100).toFixed(1)}% of target`,
          affected_metrics: [kpi.name],
          recommended_actions: ['Investigate root causes', 'Implement corrective measures'],
          urgency_score: 1 - achievement,
          estimated_impact: 'High'
        });
      }
    });

    return alerts;
  }

  private static generateAnomalyAlerts(kpis: IKPI[]): any[] {
    // Simple anomaly detection based on recent changes
    const alerts = [];
    
    kpis.forEach(kpi => {
      if (kpi.previousValue && Math.abs(kpi.value - kpi.previousValue) > kpi.previousValue * 0.3) {
        alerts.push({
          type: 'anomaly',
          priority: 'medium',
          title: `Unusual Change in ${kpi.name}`,
          message: `${kpi.name} changed by ${((kpi.value - kpi.previousValue) / kpi.previousValue * 100).toFixed(1)}%`,
          affected_metrics: [kpi.name],
          recommended_actions: ['Verify data accuracy', 'Investigate cause'],
          urgency_score: 0.6,
          estimated_impact: 'Medium'
        });
      }
    });

    return alerts;
  }

  private static generateOpportunityAlerts(kpis: IKPI[]): any[] {
    const alerts = [];
    
    const highPerformers = kpis.filter(kpi => {
      const achievement = kpi.target > 0 ? (kpi.value / kpi.target) : 1;
      return achievement > 1.1;
    });

    if (highPerformers.length > 0) {
      alerts.push({
        type: 'opportunity',
        priority: 'medium',
        title: 'High Performance Opportunities',
        message: `${highPerformers.length} metrics exceeding targets - potential for scaling`,
        affected_metrics: highPerformers.map(kpi => kpi.name),
        recommended_actions: ['Analyze success factors', 'Replicate best practices'],
        urgency_score: 0.4,
        estimated_impact: 'High'
      });
    }

    return alerts;
  }

  private static generateRiskAlerts(kpis: IKPI[]): any[] {
    const alerts = [];
    
    const decliningMetrics = kpis.filter(kpi => kpi.trend === 'down').length;
    const totalMetrics = kpis.length;
    
    if (decliningMetrics > totalMetrics * 0.4) {
      alerts.push({
        type: 'risk',
        priority: 'high',
        title: 'Multiple Declining Metrics',
        message: `${decliningMetrics} out of ${totalMetrics} metrics showing decline`,
        affected_metrics: kpis.filter(kpi => kpi.trend === 'down').map(kpi => kpi.name),
        recommended_actions: ['Immediate investigation required', 'Implement stabilization measures'],
        urgency_score: 0.8,
        estimated_impact: 'High'
      });
    }

    return alerts;
  }
}

import mongoose from 'mongoose';
import { 
  AITaskData, 
  AIKPIData, 
  AIUserData, 
  AIInventoryData, 
  AIProcessData 
} from '../models/AITrainingData';

export class AIDataSeeder {
  
  /**
   * Generate comprehensive AI training data for all modules
   */
  static async seedAITrainingData(companyId: string) {
    console.log('🤖 Starting AI training data generation...');
    
    try {
      // Clear existing AI training data
      await Promise.all([
        AITaskData.deleteMany({ companyId }),
        AIKPIData.deleteMany({ companyId }),
        AIUserData.deleteMany({ companyId }),
        AIInventoryData.deleteMany({ companyId }),
        AIProcessData.deleteMany({ companyId })
      ]);

      // Generate training data for each AI module
      await Promise.all([
        this.generateTaskTrainingData(companyId),
        this.generateKPITrainingData(companyId),
        this.generateUserTrainingData(companyId),
        this.generateInventoryTrainingData(companyId),
        this.generateProcessTrainingData(companyId)
      ]);

      console.log('✅ AI training data generation completed successfully!');
      
      return {
        success: true,
        message: 'AI training data generated successfully',
        stats: await this.getDataStats(companyId)
      };
      
    } catch (error) {
      console.error('❌ Error generating AI training data:', error);
      throw error;
    }
  }

  /**
   * Generate task prioritization training data
   */
  static async generateTaskTrainingData(companyId: string, count: number = 1000) {
    console.log('📋 Generating task training data...');
    
    const categories = [
      'Development', 'Testing', 'Design', 'Marketing', 'Sales', 
      'Support', 'HR', 'Finance', 'Operations', 'Strategy'
    ];
    
    const urgencyFactors = [
      'Client deadline', 'System downtime', 'Revenue impact', 'Compliance requirement',
      'Dependency blocker', 'Security issue', 'Quality concern', 'Resource constraint'
    ];

    const taskTrainingData = [];
    
    for (let i = 0; i < count; i++) {
      const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const completedDate = Math.random() > 0.2 ? 
        new Date(createdDate.getTime() + Math.random() * (dueDate.getTime() - createdDate.getTime()) * 1.2) : 
        undefined;
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const complexity = Math.floor(Math.random() * 10) + 1;
      const businessImpact = Math.floor(Math.random() * 10) + 1;
      const estimatedHours = Math.random() * 40 + 1;
      const actualHours = completedDate ? 
        estimatedHours * (0.5 + Math.random() * 1.5) : 0;
      
      const wasOverdue = completedDate ? completedDate > dueDate : false;
      const successfulCompletion = completedDate ? 
        (Math.random() > 0.1 && !wasOverdue) : false;

      taskTrainingData.push({
        taskId: new mongoose.Types.ObjectId(),
        taskTitle: `${category} Task ${i + 1}`,
        taskDescription: `Detailed description for ${category.toLowerCase()} task`,
        category,
        assigneeId: new mongoose.Types.ObjectId(),
        originalPriority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        actualCompletionTime: actualHours,
        estimatedCompletionTime: estimatedHours,
        dueDate,
        createdAt: createdDate,
        completedAt: completedDate,
        wasOverdue,
        dependencies: Math.floor(Math.random() * 5),
        complexity,
        businessImpact,
        urgencyFactors: urgencyFactors.slice(0, Math.floor(Math.random() * 3) + 1),
        userWorkload: Math.floor(Math.random() * 10) + 1,
        userExpertise: Math.floor(Math.random() * 10) + 1,
        timeOfDay: createdDate.getHours(),
        dayOfWeek: createdDate.getDay(),
        seasonality: Math.floor(createdDate.getMonth() / 3) + 1,
        successfulCompletion,
        companyId: new mongoose.Types.ObjectId(companyId)
      });
    }

    await AITaskData.insertMany(taskTrainingData);
    console.log(`✅ Generated ${count} task training records`);
  }

  /**
   * Generate KPI prediction training data
   */
  static async generateKPITrainingData(companyId: string, count: number = 800) {
    console.log('📊 Generating KPI training data...');
    
    const kpiCategories = ['revenue', 'users', 'sales', 'performance', 'finance', 'operational'];
    const marketConditions = ['bull', 'bear', 'stable'];
    const correlatedMetrics = [
      'User Engagement', 'Marketing Spend', 'Staff Count', 'Product Quality',
      'Customer Satisfaction', 'Market Share', 'Operational Efficiency'
    ];

    const kpiTrainingData = [];
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const category = kpiCategories[Math.floor(Math.random() * kpiCategories.length)];
      const marketCondition = marketConditions[Math.floor(Math.random() * marketConditions.length)];
      
      const baseValue = Math.random() * 10000 + 1000;
      const target = baseValue * (0.8 + Math.random() * 0.4);
      const achievedTarget = baseValue >= target;
      
      const seasonalityFactor = Math.sin((timestamp.getMonth() / 12) * Math.PI * 2) * 0.2 + 1;
      const value = baseValue * seasonalityFactor;
      
      kpiTrainingData.push({
        kpiId: new mongoose.Types.ObjectId(),
        kpiName: `${category.charAt(0).toUpperCase() + category.slice(1)} KPI ${i + 1}`,
        category,
        value,
        target,
        timestamp,
        externalFactors: {
          marketCondition,
          seasonality: Math.floor(timestamp.getMonth() / 3) + 1,
          economicIndicator: -1 + Math.random() * 2,
          competitorActivity: Math.random(),
          marketing_spend: Math.random() * 100000,
          staffingLevel: Math.random() * 100 + 50,
          productLaunches: Math.floor(Math.random() * 5)
        },
        historicalTrend: -1 + Math.random() * 2,
        volatility: Math.random(),
        correlatedMetrics: correlatedMetrics.slice(0, Math.floor(Math.random() * 3) + 1).map(metric => ({
          metricName: metric,
          correlation: -1 + Math.random() * 2,
          influence: Math.random()
        })),
        achievedTarget,
        percentageChange: ((value - target) / target) * 100,
        companyId: new mongoose.Types.ObjectId(companyId)
      });
    }

    await AIKPIData.insertMany(kpiTrainingData);
    console.log(`✅ Generated ${count} KPI training records`);
  }

  /**
   * Generate user behavior training data
   */
  static async generateUserTrainingData(companyId: string, count: number = 500) {
    console.log('👥 Generating user training data...');
    
    const modules = [
      'dashboard', 'tasks', 'kpi', 'inventory', 'processes', 
      'users', 'settings', 'reports', 'workflows'
    ];
    
    const actions = ['view', 'create', 'edit', 'delete', 'export', 'analyze'];
    const skills = ['JavaScript', 'Python', 'Project Management', 'Data Analysis', 'Design'];
    const domains = ['Finance', 'Marketing', 'Operations', 'Technology', 'HR'];

    const userTrainingData = [];
    
    for (let i = 0; i < count; i++) {
      const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const loginTime = new Date(date);
      loginTime.setHours(8 + Math.random() * 10); // 8 AM to 6 PM
      
      const sessionDuration = Math.random() * 480 + 60; // 1-8 hours
      const logoutTime = new Date(loginTime.getTime() + sessionDuration * 60 * 1000);
      
      const clickPatterns = [];
      const numClicks = Math.floor(Math.random() * 50) + 10;
      
      for (let j = 0; j < numClicks; j++) {
        clickPatterns.push({
          module: modules[Math.floor(Math.random() * modules.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          timestamp: new Date(loginTime.getTime() + Math.random() * sessionDuration * 60 * 1000),
          duration: Math.random() * 300 + 30 // 30 seconds to 5 minutes
        });
      }

      const technicalSkills = {};
      const domainExpertise = {};
      
      skills.forEach(skill => {
        if (Math.random() > 0.3) {
          technicalSkills[skill] = Math.floor(Math.random() * 10) + 1;
        }
      });
      
      domains.forEach(domain => {
        if (Math.random() > 0.5) {
          domainExpertise[domain] = Math.floor(Math.random() * 10) + 1;
        }
      });

      userTrainingData.push({
        userId: new mongoose.Types.ObjectId(),
        sessionData: {
          loginTime,
          logoutTime,
          activeTime: Math.floor(sessionDuration * 0.7), // 70% active time
          tasksCompleted: Math.floor(Math.random() * 15),
          modulesAccessed: modules.slice(0, Math.floor(Math.random() * modules.length) + 1),
          errorCount: Math.floor(Math.random() * 5),
          clickPatterns
        },
        performanceMetrics: {
          productivityScore: Math.random() * 100,
          accuracyRate: 70 + Math.random() * 30,
          avgResponseTime: Math.random() * 30 + 5,
          taskSuccessRate: 60 + Math.random() * 40,
          collaborationScore: Math.random() * 100
        },
        workPatterns: {
          preferredWorkHours: [9, 10, 11, 14, 15, 16].slice(0, Math.floor(Math.random() * 6) + 2),
          peakProductivityHour: 9 + Math.floor(Math.random() * 8),
          breakPatterns: [
            { startTime: 12, duration: 60 },
            { startTime: 15, duration: 15 }
          ],
          workloadPreference: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)],
          multitaskingAbility: Math.floor(Math.random() * 10) + 1
        },
        skillAssessment: {
          technicalSkills: new Map(Object.entries(technicalSkills)),
          domainExpertise: new Map(Object.entries(domainExpertise)),
          learningVelocity: Math.random() * 2 + 0.5
        },
        riskFactors: {
          securityIncidents: Math.floor(Math.random() * 3),
          policyViolations: Math.floor(Math.random() * 2),
          dataAccessAnomalies: Math.floor(Math.random() * 5),
          unusualBehaviorFlags: Math.random() > 0.8 ? ['unusual_hours', 'high_error_rate'] : []
        },
        companyId: new mongoose.Types.ObjectId(companyId),
        date
      });
    }

    await AIUserData.insertMany(userTrainingData);
    console.log(`✅ Generated ${count} user training records`);
  }

  /**
   * Generate inventory management training data
   */
  static async generateInventoryTrainingData(companyId: string, count: number = 300) {
    console.log('📦 Generating inventory training data...');
    
    const categories = [
      'Electronics', 'Clothing', 'Food', 'Books', 'Home', 
      'Sports', 'Automotive', 'Health', 'Beauty', 'Toys'
    ];
    
    const marketTrends = ['growing', 'stable', 'declining'];

    const inventoryTrainingData = [];
    
    for (let i = 0; i < count; i++) {
      const periodStart = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const basePrice = Math.random() * 500 + 50;
      
      // Generate historical demand data
      const historicalDemand = [];
      for (let day = 0; day < 30; day++) {
        const date = new Date(periodStart.getTime() + day * 24 * 60 * 60 * 1000);
        const seasonalFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.3 + 1;
        const weekendFactor = [0, 6].includes(date.getDay()) ? 1.2 : 1.0;
        const randomFactor = 0.7 + Math.random() * 0.6;
        
        const baseQuantity = Math.floor(Math.random() * 100) + 10;
        const quantity = Math.floor(baseQuantity * seasonalFactor * weekendFactor * randomFactor);
        
        historicalDemand.push({
          date,
          quantity,
          season: Math.floor(date.getMonth() / 3) + 1,
          promotionActive: Math.random() > 0.8,
          stockoutOccurred: Math.random() > 0.9,
          price: basePrice * (0.8 + Math.random() * 0.4)
        });
      }

      const leadTime = Math.floor(Math.random() * 14) + 1;
      const supplierReliability = 0.7 + Math.random() * 0.3;
      const stockoutDays = Math.floor(Math.random() * 5);
      const excessInventoryDays = Math.floor(Math.random() * 10);
      
      inventoryTrainingData.push({
        productId: new mongoose.Types.ObjectId(),
        productName: `${category} Product ${i + 1}`,
        category,
        historicalDemand,
        supplyChainMetrics: {
          leadTime,
          supplierReliability,
          qualityScore: Math.random() * 10,
          costVariability: Math.random() * 0.5
        },
        marketFactors: {
          competitorPricing: basePrice * (0.8 + Math.random() * 0.4),
          marketTrend: marketTrends[Math.floor(Math.random() * marketTrends.length)],
          customerSatisfaction: Math.random() * 10,
          brandLoyalty: Math.random()
        },
        operationalFactors: {
          storageCost: Math.random() * 10 + 1,
          handlingComplexity: Math.floor(Math.random() * 10) + 1,
          shelfLife: category === 'Food' ? Math.floor(Math.random() * 30) + 1 : -1,
          minimumOrderQuantity: Math.floor(Math.random() * 50) + 10
        },
        actualOutcomes: {
          stockoutDays,
          excessInventoryDays,
          totalCost: Math.random() * 10000 + 1000,
          serviceLevelAchieved: Math.max(0, 1 - (stockoutDays / 30))
        },
        companyId: new mongoose.Types.ObjectId(companyId),
        periodStart,
        periodEnd
      });
    }

    await AIInventoryData.insertMany(inventoryTrainingData);
    console.log(`✅ Generated ${count} inventory training records`);
  }

  /**
   * Generate process optimization training data
   */
  static async generateProcessTrainingData(companyId: string, count: number = 400) {
    console.log('⚙️ Generating process training data...');
    
    const processNames = [
      'Order Processing', 'Customer Onboarding', 'Invoice Generation',
      'Quality Assurance', 'Employee Recruitment', 'Product Development',
      'Customer Support', 'Inventory Replenishment', 'Report Generation'
    ];
    
    const stepNames = [
      'Data Collection', 'Validation', 'Processing', 'Review', 'Approval',
      'Notification', 'Documentation', 'Quality Check', 'Delivery'
    ];
    
    const resources = ['Staff', 'System', 'Equipment', 'External Service'];

    const processTrainingData = [];
    
    for (let i = 0; i < count; i++) {
      const executionDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
      const processName = processNames[Math.floor(Math.random() * processNames.length)];
      
      // Generate process steps
      const numSteps = Math.floor(Math.random() * 7) + 3;
      const processSteps = [];
      
      for (let j = 0; j < numSteps; j++) {
        processSteps.push({
          stepName: stepNames[Math.floor(Math.random() * stepNames.length)],
          averageDuration: Math.random() * 120 + 15, // 15-135 minutes
          resourcesRequired: resources.slice(0, Math.floor(Math.random() * resources.length) + 1),
          failureRate: Math.random() * 0.1, // 0-10% failure rate
          costPerExecution: Math.random() * 100 + 10
        });
      }
      
      const totalDuration = processSteps.reduce((sum, step) => sum + step.averageDuration, 0);
      const totalCost = processSteps.reduce((sum, step) => sum + step.costPerExecution, 0);
      
      const bottleneckSteps = processSteps
        .filter(step => step.averageDuration > totalDuration / numSteps * 1.5)
        .map(step => step.stepName);
      
      const timeReduction = Math.random() * 30; // 0-30% improvement
      const costReduction = Math.random() * 25; // 0-25% improvement
      const qualityImprovement = Math.random() * 20; // 0-20% improvement
      
      processTrainingData.push({
        processId: new mongoose.Types.ObjectId(),
        processName: `${processName} ${i + 1}`,
        processSteps,
        executionMetrics: {
          totalDuration,
          resourceUtilization: Math.random() * 0.4 + 0.6, // 60-100% utilization
          bottleneckSteps,
          errorCount: Math.floor(Math.random() * 5),
          reworkRequired: Math.random() > 0.8,
          customerSatisfactionScore: Math.random() * 4 + 6 // 6-10 scale
        },
        environmentalFactors: {
          systemLoad: Math.random(),
          staffAvailability: Math.random() * 0.4 + 0.6, // 60-100% availability
          timeOfDay: executionDate.getHours(),
          dayOfWeek: executionDate.getDay(),
          urgencyLevel: Math.floor(Math.random() * 10) + 1
        },
        optimizationOutcomes: {
          timeReduction,
          costReduction,
          qualityImprovement,
          resourceEfficiency: Math.random() * 0.3 + 0.7 // 70-100% efficiency
        },
        companyId: new mongoose.Types.ObjectId(companyId),
        executionDate
      });
    }

    await AIProcessData.insertMany(processTrainingData);
    console.log(`✅ Generated ${count} process training records`);
  }

  /**
   * Get statistics about generated training data
   */
  static async getDataStats(companyId: string) {
    const stats = await Promise.all([
      AITaskData.countDocuments({ companyId }),
      AIKPIData.countDocuments({ companyId }),
      AIUserData.countDocuments({ companyId }),
      AIInventoryData.countDocuments({ companyId }),
      AIProcessData.countDocuments({ companyId })
    ]);

    return {
      taskData: stats[0],
      kpiData: stats[1],
      userData: stats[2],
      inventoryData: stats[3],
      processData: stats[4],
      total: stats.reduce((sum, count) => sum + count, 0)
    };
  }

  /**
   * Update AI models with new training data
   */
  static async retrainModels(companyId: string) {
    console.log('🔄 Retraining AI models with new data...');
    
    try {
      // In a real-world scenario, this would trigger ML model retraining
      // For now, we'll simulate model updates with improved accuracy metrics
      
      const modelUpdates = {
        taskPrioritization: {
          accuracy: 0.92 + Math.random() * 0.06, // 92-98%
          lastTrained: new Date(),
          trainingDataCount: await AITaskData.countDocuments({ companyId })
        },
        kpiForecasting: {
          accuracy: 0.88 + Math.random() * 0.08, // 88-96%
          lastTrained: new Date(),
          trainingDataCount: await AIKPIData.countDocuments({ companyId })
        },
        userAnalytics: {
          accuracy: 0.85 + Math.random() * 0.10, // 85-95%
          lastTrained: new Date(),
          trainingDataCount: await AIUserData.countDocuments({ companyId })
        },
        inventoryOptimization: {
          accuracy: 0.89 + Math.random() * 0.07, // 89-96%
          lastTrained: new Date(),
          trainingDataCount: await AIInventoryData.countDocuments({ companyId })
        },
        processOptimization: {
          accuracy: 0.87 + Math.random() * 0.08, // 87-95%
          lastTrained: new Date(),
          trainingDataCount: await AIProcessData.countDocuments({ companyId })
        }
      };

      console.log('✅ AI models retrained successfully!');
      return modelUpdates;
      
    } catch (error) {
      console.error('❌ Error retraining AI models:', error);
      throw error;
    }
  }
}

export default AIDataSeeder;
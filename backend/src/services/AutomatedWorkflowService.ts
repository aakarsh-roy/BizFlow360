import { WorkflowTemplate, GeneratedWorkflow, WorkflowNode, WorkflowConnection } from '../types/workflow';

interface WorkflowGenerationRequest {
  description: string;
  category?: string;
  complexity?: 'Simple' | 'Medium' | 'Complex';
  timeframe?: string;
  roles?: string[];
  requirements?: string[];
}

interface WorkflowAnalysis {
  entities: string[];
  actions: string[];
  conditions: string[];
  approvals: string[];
  notifications: string[];
  automations: string[];
  roles: string[];
  timeframes: string[];
}

export class AutomatedWorkflowService {
  private templates: WorkflowTemplate[] = [];
  private commonPatterns: Map<string, any> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializePatterns();
  }

  /**
   * Generate workflow from natural language description using AI-like processing
   */
  async generateWorkflowFromDescription(request: WorkflowGenerationRequest): Promise<GeneratedWorkflow> {
    try {
      // Step 1: Analyze the description
      const analysis = this.analyzeDescription(request.description);
      
      // Step 2: Determine workflow structure
      const structure = this.determineWorkflowStructure(analysis, request);
      
      // Step 3: Generate nodes and connections
      const nodes = this.generateNodes(structure, analysis);
      const connections = this.generateConnections(nodes);
      
      // Step 4: Calculate metrics
      const metrics = this.calculateWorkflowMetrics(nodes, structure);
      
      // Step 5: Create the generated workflow
      const workflow: GeneratedWorkflow = {
        id: `generated-${Date.now()}`,
        name: this.generateWorkflowName(analysis, request),
        description: request.description,
        category: request.category || this.inferCategory(analysis),
        nodes,
        connections,
        estimatedTime: metrics.estimatedTime,
        complexity: metrics.complexity,
        confidence: metrics.confidence,
        generatedAt: new Date(),
        analysis,
        metadata: {
          roles: analysis.roles,
          approvalLevels: analysis.approvals.length,
          automationSteps: analysis.automations.length,
          notificationPoints: analysis.notifications.length
        }
      };

      return workflow;
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw new Error('Failed to generate workflow from description');
    }
  }

  /**
   * Get workflow template by ID
   */
  getTemplate(templateId: string): WorkflowTemplate | null {
    return this.templates.find(t => t.id === templateId) || null;
  }

  /**
   * Get all available templates, optionally filtered by category
   */
  getTemplates(category?: string): WorkflowTemplate[] {
    if (category) {
      return this.templates.filter(t => t.category === category);
    }
    return this.templates;
  }

  /**
   * Generate workflow from template
   */
  generateWorkflowFromTemplate(templateId: string, customizations?: any): GeneratedWorkflow {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const nodes = this.generateNodesFromTemplate(template, customizations);
    const connections = this.generateConnectionsFromTemplate(template, nodes);

    return {
      id: `template-${templateId}-${Date.now()}`,
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      category: template.category,
      nodes,
      connections,
      estimatedTime: template.estimatedTime,
      complexity: template.complexity,
      confidence: 1.0,
      generatedAt: new Date(),
      templateId: templateId,
      metadata: {
        templateName: template.name,
        customizations: customizations || {}
      }
    };
  }

  /**
   * Analyze natural language description to extract workflow components
   */
  private analyzeDescription(description: string): WorkflowAnalysis {
    const text = description.toLowerCase();
    
    // Extract entities (nouns that might be workflow objects)
    const entities = this.extractEntities(text);
    
    // Extract actions (verbs that indicate workflow steps)
    const actions = this.extractActions(text);
    
    // Extract conditions (if/when/unless statements)
    const conditions = this.extractConditions(text);
    
    // Extract approval keywords
    const approvals = this.extractApprovals(text);
    
    // Extract notification keywords
    const notifications = this.extractNotifications(text);
    
    // Extract automation keywords
    const automations = this.extractAutomations(text);
    
    // Extract roles and responsibilities
    const roles = this.extractRoles(text);
    
    // Extract timeframes
    const timeframes = this.extractTimeframes(text);

    return {
      entities,
      actions,
      conditions,
      approvals,
      notifications,
      automations,
      roles,
      timeframes
    };
  }

  private extractEntities(text: string): string[] {
    const entityPatterns = [
      /\b(employee|user|customer|client|manager|admin|supervisor|team|department)\b/g,
      /\b(document|form|request|application|report|invoice|order|ticket|case)\b/g,
      /\b(product|service|project|task|issue|complaint|inquiry)\b/g
    ];

    const entities: string[] = [];
    entityPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return [...new Set(entities)]; // Remove duplicates
  }

  private extractActions(text: string): string[] {
    const actionPatterns = [
      /\b(create|submit|review|approve|reject|send|notify|assign|update|delete|process|validate|verify|check|confirm|complete|finish|start|begin|initiate|trigger)\b/g
    ];

    const actions: string[] = [];
    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        actions.push(...matches);
      }
    });

    return [...new Set(actions)];
  }

  private extractConditions(text: string): string[] {
    const conditionPatterns = [
      /if\s+([^,.\n]+)/g,
      /when\s+([^,.\n]+)/g,
      /unless\s+([^,.\n]+)/g,
      /in case\s+([^,.\n]+)/g
    ];

    const conditions: string[] = [];
    conditionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        conditions.push(...matches);
      }
    });

    return conditions;
  }

  private extractApprovals(text: string): string[] {
    const approvalKeywords = [
      'approval', 'approve', 'authorization', 'authorize', 'sign-off', 'review and approve',
      'manager approval', 'supervisor approval', 'admin approval', 'multi-level approval'
    ];

    return approvalKeywords.filter(keyword => text.includes(keyword));
  }

  private extractNotifications(text: string): string[] {
    const notificationKeywords = [
      'notify', 'notification', 'email', 'send email', 'alert', 'message',
      'inform', 'communicate', 'update', 'status update'
    ];

    return notificationKeywords.filter(keyword => text.includes(keyword));
  }

  private extractAutomations(text: string): string[] {
    const automationKeywords = [
      'automatic', 'automated', 'auto', 'system', 'trigger', 'schedule',
      'batch process', 'background task', 'integration', 'api call'
    ];

    return automationKeywords.filter(keyword => text.includes(keyword));
  }

  private extractRoles(text: string): string[] {
    const rolePatterns = [
      /\b(manager|supervisor|admin|administrator|employee|user|customer|client|analyst|developer|designer|tester|reviewer|approver)\b/g
    ];

    const roles: string[] = [];
    rolePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        roles.push(...matches);
      }
    });

    return [...new Set(roles)];
  }

  private extractTimeframes(text: string): string[] {
    const timePatterns = [
      /\b(\d+)\s+(days?|hours?|minutes?|weeks?|months?)\b/g,
      /\b(immediately|asap|urgent|high priority|low priority|within|by|before|after)\b/g
    ];

    const timeframes: string[] = [];
    timePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        timeframes.push(...matches);
      }
    });

    return timeframes;
  }

  private determineWorkflowStructure(analysis: WorkflowAnalysis, request: WorkflowGenerationRequest): any {
    const structure = {
      hasApprovals: analysis.approvals.length > 0,
      hasNotifications: analysis.notifications.length > 0,
      hasAutomation: analysis.automations.length > 0,
      hasConditions: analysis.conditions.length > 0,
      complexity: this.inferComplexity(analysis),
      estimatedSteps: this.estimateSteps(analysis),
      parallelPaths: this.detectParallelPaths(analysis)
    };

    return structure;
  }

  private generateNodes(structure: any, analysis: WorkflowAnalysis): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    let nodeCounter = 1;

    // Start node
    nodes.push({
      id: 'start',
      type: 'start',
      label: 'Start Process',
      position: { x: 100, y: 100 }
    });

    // Generate task nodes based on actions
    analysis.actions.forEach((action, index) => {
      if (action !== 'start' && action !== 'begin' && action !== 'initiate') {
        nodes.push({
          id: `task-${nodeCounter}`,
          type: 'task',
          label: this.formatActionLabel(action),
          position: { x: 100 + (index * 200), y: 200 },
          config: {
            assignee: this.inferAssignee(action, analysis.roles),
            priority: this.inferPriority(action, analysis),
            estimatedTime: this.inferTaskTime(action)
          }
        });
        nodeCounter++;
      }
    });

    // Add approval nodes
    analysis.approvals.forEach((approval, index) => {
      nodes.push({
        id: `approval-${index + 1}`,
        type: 'approval',
        label: this.formatApprovalLabel(approval),
        position: { x: 100 + (nodes.length * 200), y: 300 },
        config: {
          approver: this.inferApprover(approval, analysis.roles),
          approvalType: 'single',
          timeoutDays: 3
        }
      });
    });

    // Add notification nodes
    if (analysis.notifications.length > 0) {
      nodes.push({
        id: 'notification',
        type: 'email',
        label: 'Send Notifications',
        position: { x: 100 + (nodes.length * 200), y: 400 },
        config: {
          recipients: analysis.roles,
          template: 'workflow-notification',
          trigger: 'completion'
        }
      });
    }

    // Add automation nodes
    analysis.automations.forEach((automation, index) => {
      nodes.push({
        id: `automation-${index + 1}`,
        type: 'automation',
        label: this.formatAutomationLabel(automation),
        position: { x: 100 + (nodes.length * 200), y: 500 },
        config: {
          service: this.inferAutomationService(automation),
          timeout: 300
        }
      });
    });

    // Add decision nodes for conditions
    analysis.conditions.forEach((condition, index) => {
      nodes.push({
        id: `decision-${index + 1}`,
        type: 'decision',
        label: `Decision: ${condition.substring(0, 30)}...`,
        position: { x: 100 + (nodes.length * 200), y: 600 },
        config: {
          condition: condition,
          trueLabel: 'Yes',
          falseLabel: 'No'
        }
      });
    });

    // End node
    nodes.push({
      id: 'end',
      type: 'end',
      label: 'End Process',
      position: { x: 100 + (nodes.length * 200), y: 700 }
    });

    return nodes;
  }

  private generateConnections(nodes: WorkflowNode[]): WorkflowConnection[] {
    const connections: WorkflowConnection[] = [];

    // Simple linear connections for now
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: `connection-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        type: 'default'
      });
    }

    return connections;
  }

  private calculateWorkflowMetrics(nodes: WorkflowNode[], structure: any): any {
    const nodeCount = nodes.length;
    const approvalCount = nodes.filter(n => n.type === 'approval').length;
    const automationCount = nodes.filter(n => n.type === 'automation').length;

    let complexity: 'Simple' | 'Medium' | 'Complex';
    let estimatedTime: string;
    let confidence: number;

    // Determine complexity
    if (nodeCount <= 5 && approvalCount <= 1) {
      complexity = 'Simple';
      estimatedTime = '1-2 days';
      confidence = 0.9;
    } else if (nodeCount <= 10 && approvalCount <= 3) {
      complexity = 'Medium';
      estimatedTime = '3-5 days';
      confidence = 0.8;
    } else {
      complexity = 'Complex';
      estimatedTime = '1-2 weeks';
      confidence = 0.7;
    }

    // Adjust confidence based on automation and structure clarity
    if (automationCount > 0) confidence += 0.05;
    if (structure.hasConditions) confidence -= 0.1;

    return {
      complexity,
      estimatedTime,
      confidence: Math.min(0.95, Math.max(0.5, confidence))
    };
  }

  private generateWorkflowName(analysis: WorkflowAnalysis, request: WorkflowGenerationRequest): string {
    const category = request.category || this.inferCategory(analysis);
    const mainAction = analysis.actions[0] || 'Process';
    const mainEntity = analysis.entities[0] || 'Item';
    
    return `${category} ${this.capitalize(mainAction)} ${this.capitalize(mainEntity)}`;
  }

  private inferCategory(analysis: WorkflowAnalysis): string {
    const text = analysis.entities.join(' ') + ' ' + analysis.actions.join(' ');
    
    if (text.includes('employee') || text.includes('hiring') || text.includes('onboard')) return 'HR';
    if (text.includes('purchase') || text.includes('invoice') || text.includes('payment')) return 'Finance';
    if (text.includes('customer') || text.includes('support') || text.includes('ticket')) return 'Support';
    if (text.includes('document') || text.includes('legal') || text.includes('contract')) return 'Legal';
    if (text.includes('project') || text.includes('task') || text.includes('development')) return 'Project Management';
    
    return 'Operations';
  }

  private inferComplexity(analysis: WorkflowAnalysis): 'Simple' | 'Medium' | 'Complex' {
    const totalComponents = analysis.actions.length + analysis.approvals.length + analysis.conditions.length;
    
    if (totalComponents <= 5) return 'Simple';
    if (totalComponents <= 10) return 'Medium';
    return 'Complex';
  }

  private estimateSteps(analysis: WorkflowAnalysis): number {
    return Math.max(3, analysis.actions.length + analysis.approvals.length + 1); // +1 for end
  }

  private detectParallelPaths(analysis: WorkflowAnalysis): boolean {
    // Simple heuristic: if there are multiple roles mentioned, there might be parallel paths
    return analysis.roles.length > 2;
  }

  private formatActionLabel(action: string): string {
    return this.capitalize(action.replace(/[_-]/g, ' '));
  }

  private formatApprovalLabel(approval: string): string {
    return this.capitalize(approval);
  }

  private formatAutomationLabel(automation: string): string {
    return `Automated ${this.capitalize(automation)}`;
  }

  private inferAssignee(action: string, roles: string[]): string {
    // Simple role assignment logic
    if (action.includes('review') || action.includes('approve')) {
      return roles.find(r => r.includes('manager') || r.includes('supervisor')) || 'Manager';
    }
    return roles[0] || 'Assignee';
  }

  private inferApprover(approval: string, roles: string[]): string {
    return roles.find(r => r.includes('manager') || r.includes('admin')) || 'Manager';
  }

  private inferPriority(action: string, analysis: WorkflowAnalysis): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['urgent', 'asap', 'immediate', 'critical'];
    const text = analysis.timeframes.join(' ');
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (analysis.approvals.length > 1) return 'medium';
    return 'low';
  }

  private inferTaskTime(action: string): string {
    const quickActions = ['send', 'notify', 'update', 'check'];
    const slowActions = ['review', 'analyze', 'develop', 'test'];
    
    if (quickActions.includes(action)) return '1 hour';
    if (slowActions.includes(action)) return '1 day';
    return '4 hours';
  }

  private inferAutomationService(automation: string): string {
    if (automation.includes('email')) return 'email-service';
    if (automation.includes('notification')) return 'notification-service';
    if (automation.includes('integration')) return 'api-service';
    return 'automation-service';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateNodesFromTemplate(template: WorkflowTemplate, customizations?: any): WorkflowNode[] {
    // This would generate nodes based on the template structure
    // For now, return a basic structure
    return template.nodes || [];
  }

  private generateConnectionsFromTemplate(template: WorkflowTemplate, nodes: WorkflowNode[]): WorkflowConnection[] {
    // This would generate connections based on the template structure
    return template.connections || [];
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'employee-onboarding',
        name: 'Employee Onboarding',
        description: 'Complete onboarding process for new employees',
        category: 'HR',
        complexity: 'Medium',
        estimatedTime: '5-7 days',
        useCase: 'HR departments for streamlined employee integration',
        tags: ['hr', 'onboarding', 'employee'],
        nodes: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'purchase-approval',
        name: 'Purchase Approval',
        description: 'Multi-level approval process for purchase requests',
        category: 'Finance',
        complexity: 'Simple',
        estimatedTime: '2-3 days',
        useCase: 'Finance teams for expense management',
        tags: ['finance', 'approval', 'purchase'],
        nodes: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // Add more templates as needed
    ];
  }

  private initializePatterns(): void {
    // Initialize common workflow patterns
    this.commonPatterns.set('approval-chain', {
      description: 'Multi-level approval pattern',
      nodes: ['start', 'submit', 'first-approval', 'second-approval', 'complete', 'end']
    });

    this.commonPatterns.set('notification-workflow', {
      description: 'Workflow with notification steps',
      nodes: ['start', 'task', 'notify-start', 'process', 'notify-complete', 'end']
    });
  }
}
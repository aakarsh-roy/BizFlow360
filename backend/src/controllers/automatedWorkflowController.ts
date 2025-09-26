import { Request, Response } from 'express';
import { AutomatedWorkflowService } from '../services/AutomatedWorkflowService';
import { WorkflowGenerationRequest } from '../types/workflow';

export class AutomatedWorkflowController {
  private automatedWorkflowService: AutomatedWorkflowService;

  constructor() {
    this.automatedWorkflowService = new AutomatedWorkflowService();
  }

  /**
   * Generate workflow from natural language description
   * POST /api/workflows/generate
   */
  generateWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { description, category, complexity, timeframe, roles, requirements } = req.body;
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId;

      if (!description || description.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Description is required for workflow generation'
        });
        return;
      }

      const request: WorkflowGenerationRequest = {
        description: description.trim(),
        category,
        complexity,
        timeframe,
        roles,
        requirements,
        userId,
        companyId
      };

      console.log('Generating workflow for request:', {
        description: request.description.substring(0, 100) + '...',
        category: request.category,
        userId: request.userId,
        companyId: request.companyId
      });

      const generatedWorkflow = await this.automatedWorkflowService.generateWorkflowFromDescription(request);

      res.json({
        success: true,
        data: generatedWorkflow,
        message: 'Workflow generated successfully'
      });

    } catch (error: any) {
      console.error('Error generating workflow:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate workflow'
      });
    }
  };

  /**
   * Get all available workflow templates
   * GET /api/workflows/templates
   */
  getTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.query;
      
      const templates = this.automatedWorkflowService.getTemplates(category as string);

      res.json({
        success: true,
        data: templates,
        count: templates.length,
        message: 'Templates retrieved successfully'
      });

    } catch (error: any) {
      console.error('Error retrieving templates:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve templates'
      });
    }
  };

  /**
   * Get specific workflow template by ID
   * GET /api/workflows/templates/:id
   */
  getTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const template = this.automatedWorkflowService.getTemplate(id);

      if (!template) {
        res.status(404).json({
          success: false,
          message: 'Template not found'
        });
        return;
      }

      res.json({
        success: true,
        data: template,
        message: 'Template retrieved successfully'
      });

    } catch (error: any) {
      console.error('Error retrieving template:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve template'
      });
    }
  };

  /**
   * Generate workflow from template
   * POST /api/workflows/templates/:id/generate
   */
  generateFromTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const customizations = req.body;
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId;

      // Add user context to customizations
      const enhancedCustomizations = {
        ...customizations,
        userId,
        companyId,
        generatedAt: new Date()
      };

      console.log('Generating workflow from template:', {
        templateId: id,
        userId,
        companyId,
        customizations: Object.keys(customizations)
      });

      const generatedWorkflow = this.automatedWorkflowService.generateWorkflowFromTemplate(id, enhancedCustomizations);

      res.json({
        success: true,
        data: generatedWorkflow,
        message: 'Workflow generated from template successfully'
      });

    } catch (error: any) {
      console.error('Error generating workflow from template:', error);
      
      if (error.message === 'Template not found') {
        res.status(404).json({
          success: false,
          message: 'Template not found'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate workflow from template'
      });
    }
  };

  /**
   * Get workflow generation capabilities and supported features
   * GET /api/workflows/capabilities
   */
  getCapabilities = async (req: Request, res: Response): Promise<void> => {
    try {
      const capabilities = {
        aiGeneration: {
          supported: true,
          features: [
            'Natural language processing',
            'Entity extraction',
            'Action identification',
            'Role inference',
            'Automatic node generation',
            'Connection mapping'
          ],
          limitations: [
            'Complex conditional logic requires manual refinement',
            'Integration endpoints need manual configuration',
            'Custom forms require additional setup'
          ]
        },
        templateGeneration: {
          supported: true,
          categories: ['HR', 'Finance', 'Support', 'Legal', 'Project Management', 'Operations'],
          totalTemplates: this.automatedWorkflowService.getTemplates().length
        },
        nodeTypes: [
          { type: 'start', description: 'Process start event' },
          { type: 'end', description: 'Process end event' },
          { type: 'task', description: 'Manual user task' },
          { type: 'approval', description: 'Approval gateway' },
          { type: 'decision', description: 'Conditional gateway' },
          { type: 'automation', description: 'Automated service task' },
          { type: 'email', description: 'Email notification' },
          { type: 'timer', description: 'Timer or scheduled event' }
        ],
        analysisFeatures: [
          'Complexity assessment',
          'Time estimation',
          'Role identification',
          'Approval detection',
          'Automation opportunities',
          'Notification points'
        ]
      };

      res.json({
        success: true,
        data: capabilities,
        message: 'Capabilities retrieved successfully'
      });

    } catch (error: any) {
      console.error('Error retrieving capabilities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve capabilities'
      });
    }
  };

  /**
   * Analyze workflow description without generating
   * POST /api/workflows/analyze
   */
  analyzeDescription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { description } = req.body;

      if (!description || description.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Description is required for analysis'
        });
        return;
      }

      // Use the service's private analysis method (we'll need to expose it)
      const analysis = await this.analyzeWorkflowDescription(description);

      res.json({
        success: true,
        data: analysis,
        message: 'Description analyzed successfully'
      });

    } catch (error: any) {
      console.error('Error analyzing description:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to analyze description'
      });
    }
  };

  /**
   * Get template categories and statistics
   * GET /api/workflows/template-stats
   */
  getTemplateStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = this.automatedWorkflowService.getTemplates();
      
      const stats = {
        totalTemplates: templates.length,
        byCategory: templates.reduce((acc, template) => {
          acc[template.category] = (acc[template.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byComplexity: templates.reduce((acc, template) => {
          acc[template.complexity] = (acc[template.complexity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageNodes: templates.reduce((sum, template) => sum + (template.nodes?.length || 0), 0) / templates.length || 0,
        categories: [...new Set(templates.map(t => t.category))].sort(),
        popularTags: this.getPopularTags(templates)
      };

      res.json({
        success: true,
        data: stats,
        message: 'Template statistics retrieved successfully'
      });

    } catch (error: any) {
      console.error('Error retrieving template stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve template statistics'
      });
    }
  };

  /**
   * Validate generated workflow
   * POST /api/workflows/validate
   */
  validateWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflow } = req.body;

      if (!workflow) {
        res.status(400).json({
          success: false,
          message: 'Workflow data is required for validation'
        });
        return;
      }

      const validation = this.validateWorkflowStructure(workflow);

      res.json({
        success: true,
        data: validation,
        message: 'Workflow validated successfully'
      });

    } catch (error: any) {
      console.error('Error validating workflow:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to validate workflow'
      });
    }
  };

  // Helper methods

  private async analyzeWorkflowDescription(description: string): Promise<any> {
    // This is a simplified version of the analysis logic
    const text = description.toLowerCase();
    
    const entities = this.extractMatches(text, [
      /\b(employee|user|customer|client|manager|admin|supervisor|team|department)\b/g,
      /\b(document|form|request|application|report|invoice|order|ticket|case)\b/g
    ]);

    const actions = this.extractMatches(text, [
      /\b(create|submit|review|approve|reject|send|notify|assign|update|process|validate)\b/g
    ]);

    const approvals = text.match(/\b(approval|approve|authorization|sign-off)\b/g) || [];
    const notifications = text.match(/\b(notify|notification|email|alert|message)\b/g) || [];
    const roles = this.extractMatches(text, [
      /\b(manager|supervisor|admin|administrator|employee|user|analyst|reviewer)\b/g
    ]);

    return {
      entities: [...new Set(entities)],
      actions: [...new Set(actions)],
      approvals: [...new Set(approvals)],
      notifications: [...new Set(notifications)],
      roles: [...new Set(roles)],
      estimatedComplexity: this.estimateComplexity(entities, actions, approvals),
      suggestedCategory: this.suggestCategory(entities, actions),
      confidence: this.calculateAnalysisConfidence(entities, actions, approvals)
    };
  }

  private extractMatches(text: string, patterns: RegExp[]): string[] {
    const matches: string[] = [];
    patterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });
    return matches;
  }

  private estimateComplexity(entities: string[], actions: string[], approvals: string[]): string {
    const totalComponents = entities.length + actions.length + approvals.length;
    if (totalComponents <= 5) return 'Simple';
    if (totalComponents <= 10) return 'Medium';
    return 'Complex';
  }

  private suggestCategory(entities: string[], actions: string[]): string {
    const text = entities.join(' ') + ' ' + actions.join(' ');
    
    if (text.includes('employee') || text.includes('hiring')) return 'HR';
    if (text.includes('purchase') || text.includes('invoice')) return 'Finance';
    if (text.includes('customer') || text.includes('support')) return 'Support';
    if (text.includes('document') || text.includes('legal')) return 'Legal';
    if (text.includes('project') || text.includes('task')) return 'Project Management';
    
    return 'Operations';
  }

  private calculateAnalysisConfidence(entities: string[], actions: string[], approvals: string[]): number {
    let confidence = 0.5; // Base confidence
    
    if (entities.length > 0) confidence += 0.2;
    if (actions.length > 0) confidence += 0.2;
    if (approvals.length > 0) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  private getPopularTags(templates: any[]): string[] {
    const tagCounts: Record<string, number> = {};
    
    templates.forEach(template => {
      template.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private validateWorkflowStructure(workflow: any): any {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
    }

    if (!workflow.connections || workflow.connections.length === 0) {
      warnings.push('Workflow has no connections between nodes');
    }

    // Check for start and end nodes
    const hasStart = workflow.nodes?.some((node: any) => node.type === 'start');
    const hasEnd = workflow.nodes?.some((node: any) => node.type === 'end');

    if (!hasStart) {
      errors.push('Workflow must have a start node');
    }

    if (!hasEnd) {
      warnings.push('Workflow should have an end node');
    }

    // Check for orphaned nodes
    const connectedNodes = new Set();
    workflow.connections?.forEach((conn: any) => {
      connectedNodes.add(conn.source);
      connectedNodes.add(conn.target);
    });

    const orphanedNodes = workflow.nodes?.filter((node: any) => 
      !connectedNodes.has(node.id) && node.type !== 'start'
    ) || [];

    if (orphanedNodes.length > 0) {
      warnings.push(`Found ${orphanedNodes.length} orphaned nodes`);
    }

    // Suggestions
    const approvalNodes = workflow.nodes?.filter((node: any) => node.type === 'approval') || [];
    if (approvalNodes.length === 0) {
      suggestions.push('Consider adding approval nodes for process governance');
    }

    const notificationNodes = workflow.nodes?.filter((node: any) => node.type === 'email') || [];
    if (notificationNodes.length === 0) {
      suggestions.push('Consider adding notification nodes to keep stakeholders informed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      nodeCount: workflow.nodes?.length || 0,
      connectionCount: workflow.connections?.length || 0
    };
  }
}

// Export singleton instance
export const automatedWorkflowController = new AutomatedWorkflowController();
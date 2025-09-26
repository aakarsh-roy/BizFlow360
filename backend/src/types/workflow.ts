export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'approval' | 'decision' | 'automation' | 'email' | 'timer';
  label: string;
  position: {
    x: number;
    y: number;
  };
  config?: {
    [key: string]: any;
  };
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'conditional';
  label?: string;
  condition?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  estimatedTime: string;
  useCase: string;
  tags: string[];
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  version?: string;
}

export interface GeneratedWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  estimatedTime: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  confidence: number;
  generatedAt: Date;
  templateId?: string;
  analysis?: WorkflowAnalysis;
  metadata?: {
    [key: string]: any;
  };
}

export interface WorkflowAnalysis {
  entities: string[];
  actions: string[];
  conditions: string[];
  approvals: string[];
  notifications: string[];
  automations: string[];
  roles: string[];
  timeframes: string[];
}

export interface WorkflowGenerationRequest {
  description: string;
  category?: string;
  complexity?: 'Simple' | 'Medium' | 'Complex';
  timeframe?: string;
  roles?: string[];
  requirements?: string[];
  companyId?: string;
  userId?: string;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface WorkflowDeploymentConfig {
  name: string;
  version: string;
  isActive: boolean;
  permissions: string[];
  notifications: {
    enabled: boolean;
    recipients: string[];
    events: string[];
  };
  sla: {
    maxDuration: number;
    escalationRules: any[];
  };
}

export interface ProcessInstance {
  id: string;
  workflowId: string;
  workflowVersion: string;
  status: 'running' | 'completed' | 'failed' | 'suspended' | 'cancelled';
  currentStep: string;
  variables: {
    [key: string]: any;
  };
  startTime: Date;
  endTime?: Date;
  initiatedBy: string;
  assignedTo: string[];
  auditLog: ProcessAuditEntry[];
  companyId: string;
}

export interface ProcessAuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  previousState?: any;
  newState?: any;
  notes?: string;
}

export interface TaskDefinition {
  id: string;
  processInstanceId: string;
  workflowNodeId: string;
  taskName: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  formData?: {
    [key: string]: any;
  };
  attachments: string[];
  comments: TaskComment[];
  worklog: WorklogEntry[];
  companyId: string;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  edited?: Date;
  mentions?: string[];
}

export interface WorklogEntry {
  id: string;
  description: string;
  timeSpent: number; // in minutes
  date: Date;
  author: string;
  billable: boolean;
}

export interface WorkflowMetrics {
  totalInstances: number;
  completedInstances: number;
  failedInstances: number;
  averageCompletionTime: number;
  bottlenecks: string[];
  efficiency: number;
  slaCompliance: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'time' | 'event' | 'condition';
    config: any;
  };
  action: {
    type: 'email' | 'api_call' | 'assignment' | 'escalation';
    config: any;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowPermissions {
  userId: string;
  workflowId: string;
  permissions: ('view' | 'execute' | 'modify' | 'delete' | 'admin')[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface WorkflowIntegration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'file_system' | 'email';
  config: {
    endpoint?: string;
    credentials?: any;
    headers?: {
      [key: string]: string;
    };
    timeout?: number;
    retryPolicy?: {
      maxRetries: number;
      backoffStrategy: 'fixed' | 'exponential';
      initialDelay: number;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
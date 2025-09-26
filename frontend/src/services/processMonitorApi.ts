import api from '../utils/api';

// Process Definition Interface
export interface ProcessDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  activeInstances: number;
  avgDuration: number;
  successRate: number;
  lastDeployed: Date;
  isActive?: boolean;
  definition?: any;
  permissions?: string[];
  tags?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Process Instance Interface
export interface ProcessInstance {
  id: string;
  processDefinitionId: string;
  processName: string;
  businessKey: string;
  status: 'running' | 'completed' | 'failed' | 'suspended' | 'cancelled';
  currentStep: string;
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  initiatedBy: string;
  assignedTo?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  variables?: Record<string, any>;
  auditLog?: Array<{
    timestamp: Date;
    action: string;
    userId: string;
    details: any;
    previousState?: any;
    newState?: any;
  }>;
}

// Process Step Interface
export interface ProcessStep {
  id: string;
  name: string;
  type: 'start' | 'task' | 'approval' | 'service' | 'gateway' | 'timer' | 'email' | 'end';
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  assignee?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  variables?: Record<string, any>;
}

// API Response Interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

// Process Definitions API
export const getProcessDefinitions = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}): Promise<ApiResponse<{ processDefinitions: ProcessDefinition[]; pagination: any }>> => {
  const response = await api.get('/workflows', { params });
  return response.data;
};

export const getProcessDefinition = async (id: string): Promise<ApiResponse<ProcessDefinition>> => {
  const response = await api.get(`/workflows/${id}`);
  return response.data;
};

export const createProcessDefinition = async (processDefinition: Partial<ProcessDefinition>): Promise<ApiResponse<ProcessDefinition>> => {
  const response = await api.post('/workflows', processDefinition);
  return response.data;
};

export const updateProcessDefinition = async (id: string, processDefinition: Partial<ProcessDefinition>): Promise<ApiResponse<ProcessDefinition>> => {
  const response = await api.put(`/workflows/${id}`, processDefinition);
  return response.data;
};

export const deleteProcessDefinition = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/workflows/${id}`);
  return response.data;
};

// Process Instances API
export const getProcessInstances = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  processDefinitionId?: string;
  search?: string;
  priority?: string;
}): Promise<ApiResponse<{ processInstances: ProcessInstance[]; pagination: any }>> => {
  const response = await api.get('/workflows/instances', { params });
  return response.data;
};

export const getProcessInstance = async (id: string): Promise<ApiResponse<ProcessInstance>> => {
  const response = await api.get(`/workflows/instances/${id}`);
  return response.data;
};

export const startProcessInstance = async (processDefinitionId: string, variables?: Record<string, any>, businessKey?: string): Promise<ApiResponse<ProcessInstance>> => {
  const response = await api.post(`/workflows/${processDefinitionId}/start`, {
    variables,
    businessKey
  });
  return response.data;
};

export const suspendProcessInstance = async (id: string): Promise<ApiResponse<ProcessInstance>> => {
  const response = await api.patch(`/workflows/instances/${id}/suspend`);
  return response.data;
};

export const resumeProcessInstance = async (id: string): Promise<ApiResponse<ProcessInstance>> => {
  const response = await api.patch(`/workflows/instances/${id}/resume`);
  return response.data;
};

export const cancelProcessInstance = async (id: string): Promise<ApiResponse<ProcessInstance>> => {
  const response = await api.patch(`/workflows/instances/${id}/cancel`);
  return response.data;
};

export const retryProcessInstance = async (id: string): Promise<ApiResponse<ProcessInstance>> => {
  const response = await api.patch(`/workflows/instances/${id}/retry`);
  return response.data;
};

// Process Steps API
export const getProcessInstanceSteps = async (instanceId: string): Promise<ApiResponse<ProcessStep[]>> => {
  const response = await api.get(`/workflows/instances/${instanceId}/steps`);
  return response.data;
};

export const completeProcessStep = async (instanceId: string, stepId: string, variables?: Record<string, any>): Promise<ApiResponse<ProcessInstance>> => {
  const response = await api.post(`/workflows/instances/${instanceId}/steps/${stepId}/complete`, { variables });
  return response.data;
};

// Process Analytics API
export const getProcessAnalytics = async (params?: {
  processDefinitionId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ApiResponse<{
  totalInstances: number;
  completedInstances: number;
  failedInstances: number;
  runningInstances: number;
  avgDuration: number;
  successRate: number;
  performanceMetrics: any[];
}>> => {
  const response = await api.get('/workflows/analytics', { params });
  return response.data;
};

// Real-time Process Monitoring
export const getActiveProcesses = async (): Promise<ApiResponse<{
  running: ProcessInstance[];
  completed: ProcessInstance[];
  failed: ProcessInstance[];
  suspended: ProcessInstance[];
}>> => {
  const response = await api.get('/workflows/active');
  return response.data;
};

export const getProcessHealth = async (): Promise<ApiResponse<{
  systemLoad: number;
  activeProcesses: number;
  queuedTasks: number;
  systemStatus: 'healthy' | 'warning' | 'critical';
  alerts: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
}>> => {
  const response = await api.get('/workflows/health');
  return response.data;
};

// Process Variables API
export const getProcessVariables = async (instanceId: string): Promise<ApiResponse<Record<string, any>>> => {
  const response = await api.get(`/workflows/instances/${instanceId}/variables`);
  return response.data;
};

export const updateProcessVariables = async (instanceId: string, variables: Record<string, any>): Promise<ApiResponse<Record<string, any>>> => {
  const response = await api.put(`/workflows/instances/${instanceId}/variables`, variables);
  return response.data;
};

// Process History API
export const getProcessHistory = async (instanceId: string): Promise<ApiResponse<Array<{
  timestamp: Date;
  action: string;
  userId: string;
  details: any;
  previousState?: any;
  newState?: any;
}>>> => {
  const response = await api.get(`/workflows/instances/${instanceId}/history`);
  return response.data;
};
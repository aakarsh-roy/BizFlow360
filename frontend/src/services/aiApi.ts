import api from '../utils/api';

// Wrapper for AI endpoints

export const fetchAICapabilities = async () => {
  const res = await api.get('/ai/capabilities');
  return res.data;
};

export const fetchAIHealth = async () => {
  const res = await api.get('/ai/health-check');
  return res.data;
};

export const fetchForecast = async (params?: any) => {
  // params can include metric, range, scenario, companyId, etc.
  const res = await api.get('/ai/forecast', { params });
  return res.data;
};

export const fetchPredictMetrics = async (params?: any) => {
  const res = await api.get('/ai/predict-metrics', { params });
  return res.data;
};

export const postRevenueForecast = async (payload: any) => {
  const res = await api.post('/ai/revenue-forecast', payload);
  return res.data;
};

export const analyzeText = async (text: string) => {
  const res = await api.post('/ai/analyze-text', { text });
  return res.data;
};

export const fetchAnomalies = async (params?: any) => {
  const res = await api.get('/ai/detect-anomalies', { params });
  return res.data;
};

export const fetchAIDashboard = async (params?: any) => {
  const res = await api.get('/ai/dashboard', { params });
  return res.data;
};

// Enhanced AI Services with Real Machine Learning

export const initializeAITrainingData = async (companyId?: string) => {
  const res = await api.post('/ai/initialize-training-data', { companyId });
  return res.data;
};

export const enhancedTaskPriority = async (tasks: any[], companyId?: string) => {
  const res = await api.post('/ai/enhanced-task-priority', { tasks, companyId });
  return res.data;
};

export const enhancedKPIForecast = async (kpis: any[], companyId?: string) => {
  const res = await api.post('/ai/enhanced-kpi-forecast', { kpis, companyId });
  return res.data;
};

export const enhancedUserInsights = async (users: any[], companyId?: string) => {
  const res = await api.post('/ai/enhanced-user-insights', { users, companyId });
  return res.data;
};

export const enhancedInventoryOptimization = async (products: any[], companyId?: string) => {
  const res = await api.post('/ai/enhanced-inventory-optimization', { products, companyId });
  return res.data;
};

export const enhancedProcessOptimization = async (processes: any[], companyId?: string) => {
  const res = await api.post('/ai/enhanced-process-optimization', { processes, companyId });
  return res.data;
};

export const retrainAIModels = async (companyId?: string) => {
  const res = await api.post('/ai/retrain-models', { companyId });
  return res.data;
};

export const getAITrainingStats = async (companyId: string) => {
  const res = await api.get(`/ai/training-stats/${companyId}`);
  return res.data;
};

export const getAIHealthCheck = async () => {
  const res = await api.get('/ai/health-check');
  return res.data;
};

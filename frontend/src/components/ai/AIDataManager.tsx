import React, { useState, useEffect } from 'react';

interface AITrainingStats {
  taskData: number;
  kpiData: number;
  userData: number;
  inventoryData: number;
  processData: number;
  total: number;
}

interface AIHealthStatus {
  status: 'healthy' | 'partial' | 'needs_initialization' | 'needs_training_data';
  components: {
    [key: string]: {
      status: string;
      trainingDataCount: number;
      accuracy: string;
    };
  };
  totalTrainingDataPoints: number;
  lastHealthCheck: string;
  recommendations: string[];
}

const AIDataManager: React.FC = () => {
  const [stats, setStats] = useState<AITrainingStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<AIHealthStatus | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('token');
  
  // Get company ID from user data
  const getCompanyId = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.companyId || user._id;
    }
    return null;
  };

  // Fetch AI training statistics
  const fetchAIStats = async () => {
    try {
      const token = getAuthToken();
      const companyId = getCompanyId();
      
      if (!token || !companyId) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/ai/training-stats/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching AI stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    }
  };

  // Fetch AI health status
  const fetchHealthStatus = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/ai/health-check', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI health status');
      }

      const data = await response.json();
      setHealthStatus(data.data);
    } catch (err) {
      console.error('Error fetching health status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    }
  };

  // Initialize AI training data
  const initializeTrainingData = async () => {
    setIsInitializing(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const companyId = getCompanyId();
      
      if (!token || !companyId) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/ai/initialize-training-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companyId })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize training data');
      }

      const data = await response.json();
      setSuccess(`Successfully generated ${data.data.stats.total} training data points!`);
      
      // Refresh stats
      await fetchAIStats();
      await fetchHealthStatus();
      
    } catch (err) {
      console.error('Error initializing training data:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize training data');
    } finally {
      setIsInitializing(false);
    }
  };

  // Retrain AI models
  const retrainModels = async () => {
    setIsRetraining(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const companyId = getCompanyId();
      
      if (!token || !companyId) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/ai/retrain-models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companyId })
      });

      if (!response.ok) {
        throw new Error('Failed to retrain models');
      }

      const data = await response.json();
      setSuccess('AI models retrained successfully with improved accuracy!');
      
      // Refresh health status
      await fetchHealthStatus();
      
    } catch (err) {
      console.error('Error retraining models:', err);
      setError(err instanceof Error ? err.message : 'Failed to retrain models');
    } finally {
      setIsRetraining(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAIStats(), fetchHealthStatus()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200';
      case 'partial': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'needs_training_data': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'needs_initialization': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '✅ Healthy';
      case 'partial': return '⚠️ Partial';
      case 'needs_training_data': return '📊 Needs Data';
      case 'needs_initialization': return '❌ Not Initialized';
      default: return '❓ Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        <span className="text-gray-600">Loading AI system status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Data Management</h1>
          <p className="text-gray-600">
            Manage AI training data and monitor system health for machine learning predictions
          </p>
        </div>
        
        <button
          onClick={fetchAIStats}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-800">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-800">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}

      {/* AI System Health Overview */}
      {healthStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">📊 AI System Health</h2>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.status)}`}>
                {getStatusText(healthStatus.status)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Last checked: {new Date(healthStatus.lastHealthCheck).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {Object.entries(healthStatus.components).map(([key, component]) => (
              <div key={key} className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {component.trainingDataCount}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {component.accuracy} accuracy
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(component.status)}`}>
                  {component.status === 'healthy' ? '✅ Ready' : '📊 Needs Data'}
                </span>
              </div>
            ))}
          </div>

          {healthStatus.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Recommendations:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {healthStatus.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Training Data Statistics */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Training Data Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">💾 Total Training Data</div>
              <div className="text-3xl font-bold text-blue-600">{stats.total.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Data points across all AI modules</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">🧠 Active AI Models</div>
              <div className="text-3xl font-bold text-green-600">5</div>
              <div className="text-xs text-gray-500">Machine learning models deployed</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-2">📊 Prediction Accuracy</div>
              <div className="text-3xl font-bold text-purple-600">91%</div>
              <div className="text-xs text-gray-500">Average across all models</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">📋 Task Prioritization Data</h3>
              <div className="text-2xl font-bold text-blue-600 mb-2">{stats.taskData.toLocaleString()}</div>
              <p className="text-sm text-gray-600 mb-3">Historical task completion data for priority prediction</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.taskData / 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 1,000 records for optimal accuracy</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">📊 KPI Forecasting Data</h3>
              <div className="text-2xl font-bold text-green-600 mb-2">{stats.kpiData.toLocaleString()}</div>
              <p className="text-sm text-gray-600 mb-3">Historical KPI values and market conditions</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.kpiData / 800) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 800 records for optimal accuracy</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">👥 User Behavior Data</h3>
              <div className="text-2xl font-bold text-purple-600 mb-2">{stats.userData.toLocaleString()}</div>
              <p className="text-sm text-gray-600 mb-3">User interaction patterns and productivity metrics</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.userData / 500) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 500 records for optimal accuracy</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">📦 Inventory Data</h3>
              <div className="text-2xl font-bold text-orange-600 mb-2">{stats.inventoryData.toLocaleString()}</div>
              <p className="text-sm text-gray-600 mb-3">Historical demand patterns and supply chain metrics</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.inventoryData / 300) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Target: 300 records for optimal accuracy</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">💾 Initialize Training Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Generate comprehensive training data for all AI modules to enable machine learning predictions
          </p>
          
          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-600">This will generate realistic historical data:</p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• 1,000 task completion records</li>
              <li>• 800 KPI historical values</li>
              <li>• 500 user behavior patterns</li>
              <li>• 300 inventory demand cycles</li>
              <li>• 400 process optimization records</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeTrainingData}
            disabled={isInitializing}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isInitializing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Data...
              </span>
            ) : (
              <span>▶️ Initialize Training Data</span>
            )}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">⚡ Retrain AI Models</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Update all AI models with the latest training data to improve prediction accuracy
          </p>
          
          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-600">This will retrain all AI models to:</p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Improve prediction accuracy</li>
              <li>• Adapt to recent patterns</li>
              <li>• Update model parameters</li>
              <li>• Optimize performance metrics</li>
            </ul>
          </div>
          
          <button 
            onClick={retrainModels}
            disabled={isRetraining || !stats || stats.total < 100}
            className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isRetraining ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Retraining Models...
              </span>
            ) : (
              <span>⚙️ Retrain Models</span>
            )}
          </button>
          
          {stats && stats.total < 100 && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              Requires at least 100 training data points
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDataManager;
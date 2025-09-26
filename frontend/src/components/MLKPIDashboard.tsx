import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Psychology,
  ModelTraining,
  Refresh,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { MLService } from '../services/MLService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface MLKPIDashboardProps {
  companyId?: string;
}

const MLKPIDashboard: React.FC<MLKPIDashboardProps> = ({ companyId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [kpiForecasts, setKpiForecasts] = useState<Record<string, any>>({});
  const [processPredictions, setProcessPredictions] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [mlDashboard, setMlDashboard] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadMLDashboard();
    const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMLDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load ML dashboard data
      const dashboard = await MLService.getDashboard();
      setMlDashboard(dashboard);

      // Load models
      const modelList = await MLService.getModels();
      setModels(modelList);

      // Load real-time predictions and anomalies
      await loadRealTimeData();

      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('❌ Error loading ML dashboard:', err);
      setError(err.message || 'Failed to load ML dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      // Load KPI forecasts for key metrics
      const kpiMetrics = ['Revenue', 'Completed Workflows', 'Process Efficiency', 'User Satisfaction'];
      const forecasts: Record<string, any> = {};

      for (const metric of kpiMetrics) {
        try {
          const forecast = await MLService.generateKPIForecast(metric);
          forecasts[metric] = forecast;
        } catch (err) {
          console.warn(`Failed to load forecast for ${metric}:`, err);
        }
      }
      setKpiForecasts(forecasts);

      // Load process predictions
      const processes = await MLService.generateProcessPredictions();
      setProcessPredictions(processes);

      // Load anomaly detection
      const anomalyData = await MLService.getRealTimeAnomalies();
      setAnomalies(anomalyData);

    } catch (err: any) {
      console.warn('Some real-time data failed to load:', err);
    }
  };

  const trainModel = async (type: 'kpi' | 'process' | 'anomaly', metricName?: string) => {
    try {
      setTrainingInProgress(true);
      
      let result;
      switch (type) {
        case 'kpi':
          if (!metricName) {
            throw new globalThis.Error('Metric name required for KPI model');
          }
          result = await MLService.trainKPIModel(metricName);
          break;
        case 'process':
          result = await MLService.trainProcessModel();
          break;
        case 'anomaly':
          result = await MLService.trainAnomalyModel();
          break;
      }

      // Reload dashboard data
      await loadMLDashboard();
      
      alert(`✅ ${result.name} trained successfully! Accuracy: ${result.metrics.accuracy.toFixed(1)}%`);
    } catch (err: any) {
      alert(`❌ Training failed: ${err.message}`);
    } finally {
      setTrainingInProgress(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      default: return <TrendingFlat color="action" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading ML Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          🧠 Machine Learning Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadMLDashboard} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ ml: 1 }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ML Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Active Models
              </Typography>
              <Typography variant="h3">
                {mlDashboard?.activeModels || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {mlDashboard?.totalModels || 0} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Average Accuracy
              </Typography>
              <Typography variant="h3">
                {mlDashboard?.averageAccuracy || 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={mlDashboard?.averageAccuracy || 0} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                System Health
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {anomalies?.systemHealth === 'healthy' && <CheckCircle color="success" />}
                {anomalies?.systemHealth === 'warning' && <Warning color="warning" />}
                {anomalies?.systemHealth === 'critical' && <Error color="error" />}
                <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                  {anomalies?.systemHealth || 'Unknown'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Score: {anomalies?.overallScore || 0}/100
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Active Alerts
              </Typography>
              <Typography variant="h3">
                {anomalies?.alerts?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                real-time anomalies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Model Training Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Model Training & Management
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<ModelTraining />}
                onClick={() => trainModel('kpi', 'Revenue')}
                disabled={trainingInProgress}
              >
                Train KPI Model
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Psychology />}
                onClick={() => trainModel('process')}
                disabled={trainingInProgress}
              >
                Train Process Model
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Warning />}
                onClick={() => trainModel('anomaly')}
                disabled={trainingInProgress}
              >
                Train Anomaly Model
              </Button>
            </Grid>
          </Grid>
          {trainingInProgress && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Training model... This may take a few minutes.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* KPI Forecasts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(kpiForecasts).map(([metricName, forecast]: [string, any]) => (
          <Grid item xs={12} md={6} key={metricName}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    📈 {metricName} Forecast
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {getTrendIcon(forecast.trend)}
                    <Chip 
                      label={`${forecast.accuracy.toFixed(1)}% Accuracy`}
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>
                <Box height={200}>
                  <Line
                    data={{
                      labels: [
                        ...forecast.historical.slice(-7).map((h: any) => new Date(h.date).toLocaleDateString()),
                        ...forecast.forecast.map((f: any) => new Date(f.date).toLocaleDateString())
                      ],
                      datasets: [
                        {
                          label: 'Historical',
                          data: [
                            ...forecast.historical.slice(-7).map((h: any) => h.value),
                            ...new Array(forecast.forecast.length).fill(null)
                          ],
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          tension: 0.1
                        },
                        {
                          label: 'Forecast',
                          data: [
                            ...new Array(forecast.historical.slice(-7).length).fill(null),
                            ...forecast.forecast.map((f: any) => f.value)
                          ],
                          borderColor: 'rgb(255, 99, 132)',
                          backgroundColor: 'rgba(255, 99, 132, 0.2)',
                          borderDash: [5, 5],
                          tension: 0.1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Process Predictions */}
      {processPredictions && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚙️ Process Efficiency Predictions
            </Typography>
            <Grid container spacing={2}>
              {processPredictions.processes.map((process: any) => (
                <Grid item xs={12} sm={6} md={3} key={process.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {process.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="h6">
                          {process.currentEfficiency.toFixed(1)}%
                        </Typography>
                        <Box sx={{ mx: 1 }}>→</Box>
                        <Typography variant="h6" color="primary">
                          {process.predictedEfficiency.toFixed(1)}%
                        </Typography>
                        {getTrendIcon(process.trend)}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={process.predictedEfficiency} 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Confidence: {process.confidence.toFixed(0)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Alert 
              severity={processPredictions.overallTrend === 'improving' ? 'success' : 
                       processPredictions.overallTrend === 'declining' ? 'warning' : 'info'}
              sx={{ mt: 2 }}
            >
              Overall process efficiency trend: <strong>{processPredictions.overallTrend}</strong>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Alerts */}
      {anomalies && anomalies.alerts.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🚨 Real-time Anomaly Alerts
            </Typography>
            {anomalies.alerts.map((alert: any) => (
              <Alert 
                key={alert.id}
                severity={alert.severity}
                sx={{ mb: 1 }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">
                    {alert.message}
                  </Typography>
                  <Box>
                    <Chip 
                      label={`${alert.confidence.toFixed(0)}% confidence`}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Model Performance */}
      {models.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Model Performance
            </Typography>
            <Grid container spacing={2}>
              {models.map((model) => (
                <Grid item xs={12} sm={6} md={4} key={model.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {model.name}
                      </Typography>
                      <Chip 
                        label={model.type.toUpperCase()}
                        size="small"
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2">
                        Accuracy: {model.metrics.accuracy.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        Confidence: {(model.metrics.confidence * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MLKPIDashboard;
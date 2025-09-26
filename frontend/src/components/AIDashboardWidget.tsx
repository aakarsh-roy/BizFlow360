import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Box, Button, MenuItem, TextField, Grid, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { fetchAIDashboard, fetchForecast, fetchAnomalies } from '../services/aiApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const AIDashboardWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Controls
  const [metric, setMetric] = useState<string>('revenue');
  const [companyId, setCompanyId] = useState<string>('default');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().slice(0,10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0,10));

  const [forecastSeries, setForecastSeries] = useState<any>(null);
  const [anomaliesList, setAnomaliesList] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        // Primary dashboard call that uses DB-backed data on server
        const dashboard = await fetchAIDashboard();
        if (!mounted) return;
        setData(dashboard);
        setForecastSeries(dashboard?.forecast?.series || null);
        setAnomaliesList(dashboard?.anomalies || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load AI dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" minHeight={120}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    datasets: [
      {
        label: `${metric} (historical)`,
        data: (forecastSeries?.historical || []).map((p: any) => ({ x: p.date, y: p.value })),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)'
      },
      {
        label: `${metric} (forecast)`,
        data: (forecastSeries?.forecast || []).map((p: any) => ({ x: p.date, y: p.value })),
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderDash: [6,4]
      }
    ]
  };

  // Chart options (typed as any to avoid deep Chart.js typings complexity)
  const chartOptions: any = {
    responsive: true,
    scales: {
      x: { type: 'time', time: { unit: 'day' as any } },
      y: { beginAtZero: false }
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">AI Insights</Typography>

        {/* Controls */}
        <Box mt={1} mb={2}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth label="Metric" value={metric} onChange={(e)=>setMetric(e.target.value)}>
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="users">Users</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Company ID" value={companyId} onChange={(e)=>setCompanyId(e.target.value)} />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="date" label="Start" value={startDate} onChange={(e)=>setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="date" label="End" value={endDate} onChange={(e)=>setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Box mt={1} display="flex" gap={1}>
            <Button variant="contained" size="small" onClick={async ()=>{
              setLoading(true);
              try{
                const f = await fetchForecast({ metric, startDate, endDate, companyId });
                setForecastSeries(f.series || f);
                setData((prev:any)=> ({...prev, forecast: f}));
              }catch(e:any){ setError(e.message || 'Failed to fetch forecast') }
              setLoading(false);
            }}>Run Forecast</Button>

            <Button variant="outlined" size="small" onClick={async ()=>{
              setLoading(true);
              try{
                const an = await fetchAnomalies({ metric, startDate, endDate, companyId });
                setAnomaliesList(an || []);
                setData((prev:any)=> ({...prev, anomalies: an}));
              }catch(e:any){ setError(e.message || 'Failed to fetch anomalies') }
              setLoading(false);
            }}>Check Anomalies</Button>
          </Box>
        </Box>

        {/* Chart */}
        <Box>
          {forecastSeries ? <Line data={chartData} options={chartOptions} /> : <Typography variant="body2">No time series available</Typography>}
        </Box>

        {/* Anomalies table */}
        <Box mt={2}>
          <Typography variant="subtitle1">Anomalies</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Severity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomaliesList.slice(0,10).map((a:any) => (
                <TableRow key={a.anomaly_id || `${a.metric_name}-${a.timestamp}`}>
                  <TableCell>{a.metric_name}</TableCell>
                  <TableCell>{a.metric_value}</TableCell>
                  <TableCell>{new Date(a.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{a.severity || a.anomaly_score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIDashboardWidget;

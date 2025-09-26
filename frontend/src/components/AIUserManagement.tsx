import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Tooltip,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person,
  Security,
  Psychology,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  Speed,
  Timeline,
  Group,
  AdminPanelSettings,
  VerifiedUser,
  Report,
  Insights,
  SmartToy,
  Lightbulb,
  Shield,
  Assignment,
  Schedule,
  Analytics,
  ExpandMore,
  Refresh,
  Download,
  Settings,
  PersonAdd,
  Edit,
  Delete,
  Block,
  VpnKey,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { enhancedUserInsights } from '../services/aiApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: Date;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  joinDate: Date;
  tasksCompleted: number;
  avgResponseTime: number;
  securityScore: number;
  aiInsights: {
    productivityScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    roleOptimization: string[];
    behaviorPattern: string;
    recommendations: string[];
  };
}

interface SecurityInsight {
  id: string;
  type: 'vulnerability' | 'anomaly' | 'improvement' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers: string[];
  recommendation: string;
  confidence: number;
  detected: Date;
}

interface RoleRecommendation {
  userId: string;
  currentRole: string;
  suggestedRole: string;
  reason: string;
  confidence: number;
  benefits: string[];
}

const AIUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [securityInsights, setSecurityInsights] = useState<SecurityInsight[]>([]);
  const [roleRecommendations, setRoleRecommendations] = useState<RoleRecommendation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);

  // Load AI-powered user insights
  useEffect(() => {
    const loadUserInsights = async () => {
      try {
        setLoading(true);
        const insights = await enhancedUserInsights([]);
        
        if (insights.success) {
          const transformedData = transformUserInsightsToData(insights.data);
          setUsers(transformedData.users);
          setSecurityInsights(transformedData.securityInsights);
          setRoleRecommendations(transformedData.roleRecommendations);
        } else {
          console.error('Failed to load user insights:', insights.message);
        }
      } catch (error) {
        console.error('Error loading user insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInsights();
  }, []);

  const transformUserInsightsToData = (insights: any) => {
    const users: User[] = insights.userAnalytics?.map((user: any, index: number) => ({
      id: user.userId || `user_${index + 1}`,
      name: user.userName || `User ${index + 1}`,
      email: `${user.userName?.toLowerCase().replace(' ', '.')}@company.com` || `user${index + 1}@company.com`,
      role: user.role || 'Employee',
      department: user.department || 'General',
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      status: user.riskLevel === 'high' ? 'inactive' : 'active' as const,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      tasksCompleted: user.tasksCompleted || Math.round(50 + Math.random() * 200),
      avgResponseTime: user.avgResponseTime || Math.round(20 + Math.random() * 60),
      securityScore: user.securityScore || Math.round(70 + Math.random() * 30),
      aiInsights: {
        productivityScore: user.productivityScore || Math.round(70 + Math.random() * 30),
        riskLevel: user.riskLevel || 'low' as const,
        roleOptimization: user.roleOptimization || ['Performance optimization', 'Skill development'],
        behaviorPattern: user.behaviorPattern || 'Standard performance pattern',
        recommendations: user.recommendations || ['Continue current trajectory', 'Focus on skill development']
      }
    })) || [];

    const securityInsights: SecurityInsight[] = insights.securityAlerts?.map((alert: any, index: number) => ({
      id: alert.alertId || `alert_${index + 1}`,
      type: alert.type || 'improvement' as const,
      severity: alert.severity || 'medium' as const,
      title: alert.title || 'Security Alert',
      description: alert.description || 'AI-detected security concern',
      affectedUsers: alert.affectedUsers || [`user${index + 1}@company.com`],
      recommendation: alert.recommendation || 'Review and take appropriate action',
      confidence: alert.confidence || 0.85,
      detected: new Date(alert.timestamp || Date.now())
    })) || [];

    const roleRecommendations: RoleRecommendation[] = insights.roleOptimizations?.map((opt: any, index: number) => ({
      userId: opt.userId || `user_${index + 1}`,
      currentRole: opt.currentRole || 'Employee',
      suggestedRole: opt.suggestedRole || 'Senior Employee',
      reason: opt.reason || 'AI-based role optimization recommendation',
      confidence: opt.confidence || 0.8,
      benefits: opt.benefits || ['Improved efficiency', 'Better role alignment', 'Enhanced productivity']
    })) || [];

    return {
      users,
      securityInsights,
      roleRecommendations
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#757575';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const runAIAnalysis = async () => {
    setLoading(true);
    // Simulate AI analysis
    setTimeout(() => {
      setLoading(false);
      // In real implementation, fetch updated insights from AI service
    }, 2000);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            🧠 AI-Powered User Management
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Intelligent user analytics, role optimization, and security insights
          </Typography>
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={aiAnalysisEnabled}
                onChange={(e) => setAiAnalysisEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="AI Analysis"
          />
          <Button
            variant="contained"
            startIcon={loading ? <SmartToy /> : <Refresh />}
            onClick={runAIAnalysis}
            disabled={loading || !aiAnalysisEnabled}
            sx={{ ml: 2 }}
          >
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </Box>
      </Box>

      {/* AI Insights Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                {users.length}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ mb: 1 }}>
                {users.filter(u => u.aiInsights.riskLevel === 'low').length}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Low Risk Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" sx={{ mb: 1 }}>
                {securityInsights.filter(s => s.severity === 'high' || s.severity === 'critical').length}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Security Alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ mb: 1 }}>
                {roleRecommendations.length}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Role Suggestions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Security Insights */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
              AI Security Insights
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSecurityDialogOpen(true)}
            >
              View All
            </Button>
          </Box>
          
          {securityInsights.slice(0, 3).map((insight) => (
            <Alert
              key={insight.id}
              severity={getSeverityColor(insight.severity) as any}
              sx={{ mb: 2 }}
              action={
                <Badge badgeContent={`${insight.confidence}%`} color="primary">
                  <Button size="small" variant="outlined">
                    Details
                  </Button>
                </Badge>
              }
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {insight.title}
              </Typography>
              <Typography variant="body2">
                {insight.description}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Affects {insight.affectedUsers.length} user(s) • Detected {insight.detected.toLocaleDateString()}
              </Typography>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Role Recommendations */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI Role Recommendations
          </Typography>
          
          {roleRecommendations.map((recommendation) => {
            const user = users.find(u => u.id === recommendation.userId);
            return (
              <Accordion key={recommendation.userId}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {user?.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">
                        {user?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {recommendation.currentRole} → {recommendation.suggestedRole}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${recommendation.confidence}% confidence`}
                      color={recommendation.confidence >= 85 ? 'success' : 'warning'}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Reason:</strong> {recommendation.reason}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Potential Benefits:</strong>
                  </Typography>
                  <List dense>
                    {recommendation.benefits.map((benefit, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`• ${benefit}`} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="contained" size="small" sx={{ mr: 1 }}>
                      Apply Recommendation
                    </Button>
                    <Button variant="outlined" size="small">
                      Dismiss
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </CardContent>
      </Card>

      {/* Users List with AI Insights */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
            Users with AI Insights
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role & Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>AI Productivity Score</TableCell>
                  <TableCell>Security Score</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.role}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.status}
                        color={getStatusColor(user.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={user.aiInsights.productivityScore}
                          sx={{ width: 60, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {user.aiInsights.productivityScore}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={user.securityScore}
                          sx={{ width: 60, mr: 1 }}
                          color={user.securityScore >= 90 ? 'success' : user.securityScore >= 70 ? 'warning' : 'error'}
                        />
                        <Typography variant="body2">
                          {user.securityScore}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.aiInsights.riskLevel}
                        sx={{
                          bgcolor: getRiskColor(user.aiInsights.riskLevel),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View AI Insights">
                        <IconButton
                          size="small"
                          onClick={() => handleUserClick(user)}
                        >
                          <Insights />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2 }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    AI User Insights & Analytics
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Performance Metrics
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Productivity Score
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={selectedUser.aiInsights.productivityScore}
                        sx={{ mt: 1, mb: 1 }}
                      />
                      <Typography variant="body2">
                        {selectedUser.aiInsights.productivityScore}%
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Tasks Completed: {selectedUser.tasksCompleted}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Response Time: {selectedUser.avgResponseTime} min
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Security Assessment
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Security Score
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={selectedUser.securityScore}
                        sx={{ mt: 1, mb: 1 }}
                        color={selectedUser.securityScore >= 90 ? 'success' : 'warning'}
                      />
                      <Typography variant="body2">
                        {selectedUser.securityScore}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Risk Level:
                      </Typography>
                      <Chip
                        size="small"
                        label={selectedUser.aiInsights.riskLevel}
                        sx={{
                          bgcolor: getRiskColor(selectedUser.aiInsights.riskLevel),
                          color: 'white',
                          mt: 1
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                      AI Behavioral Analysis
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Behavior Pattern:</strong> {selectedUser.aiInsights.behaviorPattern}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Role Optimization Opportunities:</strong>
                    </Typography>
                    <List dense>
                      {selectedUser.aiInsights.roleOptimization.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${item}`} />
                        </ListItem>
                      ))}
                    </List>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>AI Recommendations:</strong>
                    </Typography>
                    <List dense>
                      {selectedUser.aiInsights.recommendations.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`• ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button variant="contained">
                Apply Recommendations
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Security Insights Dialog */}
      <Dialog
        open={securityDialogOpen}
        onClose={() => setSecurityDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Security Insights & Recommendations
        </DialogTitle>
        <DialogContent>
          {securityInsights.map((insight) => (
            <Card key={insight.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">
                    {insight.title}
                  </Typography>
                  <Box>
                    <Chip
                      size="small"
                      label={insight.severity}
                      color={getSeverityColor(insight.severity) as any}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      size="small"
                      label={`${insight.confidence}% confidence`}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {insight.description}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  <strong>Affected Users:</strong> {insight.affectedUsers.join(', ')}
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </Typography>
                </Alert>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small">
                    Take Action
                  </Button>
                  <Button variant="outlined" size="small">
                    Dismiss
                  </Button>
                  <Button variant="text" size="small">
                    More Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecurityDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIUserManagement;
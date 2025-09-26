import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  AutoAwesome,
  Description,
  PlayArrow,
  Settings,
  AccountTree,
  Schedule,
  Email,
  CheckCircle,
  Error,
  Refresh,
  Save,
  Preview,
  Article as TemplateIcon,
  SmartToy as AIIcon,
  Build,
  Category
} from '@mui/icons-material';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  estimatedTime: string;
  nodes: number;
  useCase: string;
  template: any;
}

interface GeneratedWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  connections: any[];
  estimatedTime: string;
  complexity: string;
  confidence: number;
}

const AutomatedWorkflowBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [category, setCategory] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);

  // Mock workflow templates
  useEffect(() => {
    setTemplates([
      {
        id: '1',
        name: 'Employee Onboarding',
        description: 'Complete onboarding process for new employees',
        category: 'HR',
        complexity: 'Medium',
        estimatedTime: '5-7 days',
        nodes: 8,
        useCase: 'HR departments for streamlined employee integration',
        template: {}
      },
      {
        id: '2',
        name: 'Purchase Approval',
        description: 'Multi-level approval process for purchase requests',
        category: 'Finance',
        complexity: 'Simple',
        estimatedTime: '2-3 days',
        nodes: 5,
        useCase: 'Finance teams for expense management',
        template: {}
      },
      {
        id: '3',
        name: 'Customer Support Ticket',
        description: 'Automated customer support ticket resolution workflow',
        category: 'Support',
        complexity: 'Complex',
        estimatedTime: '1-5 days',
        nodes: 12,
        useCase: 'Support teams for ticket management',
        template: {}
      },
      {
        id: '4',
        name: 'Document Review',
        description: 'Multi-stage document review and approval process',
        category: 'Legal',
        complexity: 'Medium',
        estimatedTime: '3-5 days',
        nodes: 7,
        useCase: 'Legal teams for document approval',
        template: {}
      },
      {
        id: '5',
        name: 'Project Initiation',
        description: 'Complete project setup and team assignment workflow',
        category: 'Project Management',
        complexity: 'Complex',
        estimatedTime: '1-2 weeks',
        nodes: 15,
        useCase: 'Project managers for project kickoff',
        template: {}
      },
      {
        id: '6',
        name: 'Invoice Processing',
        description: 'Automated invoice validation and payment workflow',
        category: 'Finance',
        complexity: 'Medium',
        estimatedTime: '3-7 days',
        nodes: 9,
        useCase: 'Accounting teams for invoice management',
        template: {}
      }
    ]);
  }, []);

  const generateWorkflowFromDescription = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      // Simulate AI workflow generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const workflow: GeneratedWorkflow = {
        id: `generated-${Date.now()}`,
        name: `Custom Workflow - ${new Date().toLocaleDateString()}`,
        description: description,
        nodes: [
          { id: 'start', type: 'start', label: 'Start Process' },
          { id: 'task1', type: 'task', label: 'Initial Task' },
          { id: 'approval', type: 'approval', label: 'Manager Approval' },
          { id: 'notify', type: 'email', label: 'Send Notification' },
          { id: 'end', type: 'end', label: 'End Process' }
        ],
        connections: [
          { from: 'start', to: 'task1' },
          { from: 'task1', to: 'approval' },
          { from: 'approval', to: 'notify' },
          { from: 'notify', to: 'end' }
        ],
        estimatedTime: '2-4 days',
        complexity: 'Medium',
        confidence: 0.85
      };

      setGeneratedWorkflow(workflow);
    } catch (error) {
      console.error('Error generating workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    const workflow: GeneratedWorkflow = {
      id: `template-${template.id}`,
      name: template.name,
      description: template.description,
      nodes: generateNodesFromTemplate(template),
      connections: [],
      estimatedTime: template.estimatedTime,
      complexity: template.complexity,
      confidence: 1.0
    };
    setGeneratedWorkflow(workflow);
  };

  const generateNodesFromTemplate = (template: WorkflowTemplate) => {
    // Generate nodes based on template type
    const baseNodes = [
      { id: 'start', type: 'start', label: 'Start Process' }
    ];

    switch (template.category) {
      case 'HR':
        baseNodes.push(
          { id: 'collect-info', type: 'task', label: 'Collect Employee Information' },
          { id: 'background-check', type: 'task', label: 'Background Check' },
          { id: 'hr-approval', type: 'approval', label: 'HR Manager Approval' },
          { id: 'setup-accounts', type: 'automation', label: 'Setup IT Accounts' },
          { id: 'welcome-email', type: 'email', label: 'Send Welcome Email' },
          { id: 'schedule-orientation', type: 'task', label: 'Schedule Orientation' }
        );
        break;
      case 'Finance':
        baseNodes.push(
          { id: 'submit-request', type: 'task', label: 'Submit Purchase Request' },
          { id: 'budget-check', type: 'automation', label: 'Budget Validation' },
          { id: 'manager-approval', type: 'approval', label: 'Manager Approval' },
          { id: 'finance-approval', type: 'approval', label: 'Finance Approval' },
          { id: 'purchase-order', type: 'automation', label: 'Generate Purchase Order' }
        );
        break;
      default:
        baseNodes.push(
          { id: 'task1', type: 'task', label: 'Initial Task' },
          { id: 'review', type: 'approval', label: 'Review & Approval' },
          { id: 'complete', type: 'task', label: 'Complete Process' }
        );
    }

    baseNodes.push({ id: 'end', type: 'end', label: 'End Process' });
    return baseNodes;
  };

  const exportToWorkflowBuilder = () => {
    if (generatedWorkflow) {
      // This would integrate with the main workflow builder
      console.log('Exporting workflow to builder:', generatedWorkflow);
      // Navigate to workflow builder with the generated workflow
    }
  };

  const categories = ['HR', 'Finance', 'Support', 'Legal', 'Project Management', 'Operations'];

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <AutoAwesome color="primary" sx={{ mr: 2, fontSize: 32 }} />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Automated Workflow Builder
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Generate workflows using AI or pre-built templates
              </Typography>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
            <Tab 
              label="AI Generation" 
              icon={<AIIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Template Library" 
              icon={<TemplateIcon />} 
              iconPosition="start"
            />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Describe Your Workflow
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      Describe your business process in natural language, and our AI will generate a complete workflow for you.
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      variant="outlined"
                      placeholder="Example: Create an employee onboarding process that includes background check, manager approval, IT account setup, and welcome email..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <FormControl sx={{ mb: 2, minWidth: 200 }}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={category}
                        label="Category"
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={generateWorkflowFromDescription}
                        disabled={loading || !description.trim()}
                        startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                        sx={{ mr: 2 }}
                      >
                        {loading ? 'Generating...' : 'Generate Workflow'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setDescription('')}
                        disabled={loading}
                      >
                        Clear
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AI Tips
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Be specific about steps"
                          secondary="Include approval points, notifications, and automation"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Mention roles and responsibilities"
                          secondary="Specify who does what in the process"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Include timing requirements"
                          secondary="Mention deadlines and timeouts"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Choose from {templates.length} Pre-built Templates
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={category}
                    label="Filter by Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Grid container spacing={2}>
                {templates
                  .filter(template => !category || template.category === category)
                  .map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': { 
                          boxShadow: 2,
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => selectTemplate(template)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Category color="primary" sx={{ mr: 1 }} />
                          <Chip 
                            label={template.category} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="h6" gutterBottom>
                          {template.name}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary" mb={2}>
                          {template.description}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Chip 
                            label={template.complexity} 
                            size="small"
                            color={
                              template.complexity === 'Simple' ? 'success' :
                              template.complexity === 'Medium' ? 'warning' : 'error'
                            }
                          />
                          <Typography variant="caption" color="textSecondary">
                            {template.nodes} nodes
                          </Typography>
                        </Box>

                        <Typography variant="caption" display="block" mb={1}>
                          <Schedule fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          Est. Time: {template.estimatedTime}
                        </Typography>

                        <Typography variant="caption" color="textSecondary">
                          {template.useCase}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {generatedWorkflow && (
            <Card sx={{ mt: 3 }} variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Generated Workflow: {generatedWorkflow.name}
                  </Typography>
                  <Box>
                    <IconButton onClick={() => setPreviewDialog(true)}>
                      <Preview />
                    </IconButton>
                    <Button
                      variant="contained"
                      startIcon={<AccountTree />}
                      onClick={exportToWorkflowBuilder}
                      sx={{ ml: 1 }}
                    >
                      Open in Workflow Builder
                    </Button>
                  </Box>
                </Box>

                <Alert severity="success" sx={{ mb: 2 }}>
                  Workflow generated successfully with {(generatedWorkflow.confidence * 100).toFixed(0)}% confidence
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Complexity
                    </Typography>
                    <Typography variant="body1">
                      {generatedWorkflow.complexity}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Estimated Time
                    </Typography>
                    <Typography variant="body1">
                      {generatedWorkflow.estimatedTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Nodes
                    </Typography>
                    <Typography variant="body1">
                      {generatedWorkflow.nodes.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Confidence Score
                    </Typography>
                    <Typography variant="body1">
                      {(generatedWorkflow.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Workflow Steps Preview:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {generatedWorkflow.nodes.map((node, index) => (
                    <Chip
                      key={node.id}
                      label={`${index + 1}. ${node.label}`}
                      variant="outlined"
                      size="small"
                      icon={
                        node.type === 'start' ? <PlayArrow /> :
                        node.type === 'task' ? <Settings /> :
                        node.type === 'approval' ? <CheckCircle /> :
                        node.type === 'email' ? <Email /> :
                        node.type === 'automation' ? <Build /> :
                        <CheckCircle />
                      }
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Workflow Preview</DialogTitle>
        <DialogContent>
          {generatedWorkflow && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {generatedWorkflow.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                {generatedWorkflow.description}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Process Flow:
              </Typography>
              <List>
                {generatedWorkflow.nodes.map((node, index) => (
                  <ListItem key={node.id}>
                    <ListItemIcon>
                      {node.type === 'start' ? <PlayArrow color="success" /> :
                       node.type === 'task' ? <Settings color="primary" /> :
                       node.type === 'approval' ? <CheckCircle color="warning" /> :
                       node.type === 'email' ? <Email color="info" /> :
                       node.type === 'automation' ? <Build color="secondary" /> :
                       <CheckCircle color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Step ${index + 1}: ${node.label}`}
                      secondary={`Type: ${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setPreviewDialog(false);
              exportToWorkflowBuilder();
            }}
          >
            Use This Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomatedWorkflowBuilder;
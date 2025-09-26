import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  TextField,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Psychology as AIIcon,
  AutoAwesome as MagicIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Lightbulb as SuggestionIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandIcon,
  SmartToy as BotIcon,
  Timeline as FlowIcon,
  Settings as ConfigIcon
} from '@mui/icons-material';
import { enhancedProcessOptimization } from '../services/aiApi';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'notification';
  name: string;
  description: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  triggers: number;
  actions: number;
  estimatedSavings: string;
  difficulty: 'easy' | 'medium' | 'hard';
  popularity: number;
}

interface AISuggestion {
  id: string;
  type: 'optimization' | 'automation' | 'enhancement' | 'fix';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  implementation: string[];
  estimatedTime: string;
}

interface AIWorkflowBuilderProps {
  height?: number;
}

const AIWorkflowBuilder: React.FC<AIWorkflowBuilderProps> = ({ height = 700 }) => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'templates' | 'builder' | 'suggestions'>('templates');

  useEffect(() => {
    loadAIWorkflowData();
  }, []);

  const loadAIWorkflowData = async () => {
    try {
      setIsGenerating(true);
      const processData = await enhancedProcessOptimization([]);
      
      if (processData.success) {
        const transformedData = transformProcessDataToWorkflows(processData.data);
        setWorkflows(transformedData.workflows);
        setSuggestions(transformedData.suggestions);
      } else {
        console.error('Failed to load workflow data:', processData.message);
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const transformProcessDataToWorkflows = (data: any) => {
    const workflows: WorkflowTemplate[] = data.optimizations?.map((opt: any, index: number) => ({
      id: opt.processId || `workflow_${index + 1}`,
      name: opt.processName || `Process ${index + 1}`,
      description: opt.description || 'AI-optimized workflow process',
      category: opt.category || 'Automation',
      nodes: [
        {
          id: 'trigger1',
          type: 'trigger' as const,
          name: 'Process Trigger',
          description: opt.currentBottleneck || 'Process initiation',
          config: { event: 'process.started' },
          position: { x: 100, y: 100 },
          connections: ['action1']
        },
        {
          id: 'action1',
          type: 'action' as const,
          name: 'AI Optimization',
          description: opt.optimizationRecommendation || 'Apply AI optimization',
          config: { 
            action: 'optimize',
            method: opt.method || 'automated'
          },
          position: { x: 300, y: 100 },
          connections: ['condition1']
        },
        {
          id: 'condition1',
          type: 'condition' as const,
          name: 'Quality Check',
          description: 'Validate optimization results',
          config: { 
            condition: 'quality_threshold',
            threshold: opt.successProbability || 0.85
          },
          position: { x: 500, y: 100 },
          connections: ['notification1']
        },
        {
          id: 'notification1',
          type: 'notification' as const,
          name: 'Completion Notice',
          description: 'Notify stakeholders of completion',
          config: {
            recipients: ['process.owner'],
            template: 'process_complete'
          },
          position: { x: 700, y: 100 },
          connections: []
        }
      ],
      aiGenerated: true,
      createdAt: new Date(),
      performance: {
        accuracy: opt.successProbability || 0.85,
        efficiency: (opt.timeReduction || 20) / 100,
        cost_savings: opt.costSavings || 1000
      }
    })) || [];

    const suggestions: AISuggestion[] = data.suggestions?.map((sugg: any, index: number) => ({
      id: sugg.suggestionId || `suggestion_${index + 1}`,
      type: sugg.type || 'optimization' as const,
      title: sugg.title || 'Process Optimization',
      description: sugg.description || 'AI-recommended process improvement',
      impact: sugg.impact || 'medium' as const,
      confidence: sugg.confidence || 0.8,
      implementation: sugg.steps || [
        'Analyze current process',
        'Implement optimization',
        'Monitor results',
        'Adjust as needed'
      ],
      estimatedTime: sugg.estimatedTime || '1-2 weeks'
    })) || [];

    return { workflows, suggestions };
  };

  const loadWorkflowTemplates = () => {
    const mockTemplates: WorkflowTemplate[] = [
      {
        id: 'order_processing',
        name: 'Automated Order Processing',
        description: 'Automatically process orders, check inventory, and send confirmations',
        category: 'E-commerce',
        nodes: [
          {
            id: 'trigger1',
            type: 'trigger',
            name: 'New Order Received',
            description: 'Triggers when a new order is placed',
            config: { event: 'order.created' },
            position: { x: 100, y: 100 },
            connections: ['action1']
          },
          {
            id: 'action1',
            type: 'action',
            name: 'Check Inventory',
            description: 'Verify product availability',
            config: { service: 'inventory', method: 'checkAvailability' },
            position: { x: 300, y: 100 },
            connections: ['condition1']
          },
          {
            id: 'condition1',
            type: 'condition',
            name: 'Items Available?',
            description: 'Check if all items are in stock',
            config: { condition: 'inventory.available === true' },
            position: { x: 500, y: 100 },
            connections: ['action2', 'action3']
          },
          {
            id: 'action2',
            type: 'action',
            name: 'Process Payment',
            description: 'Charge customer payment',
            config: { service: 'payment', method: 'charge' },
            position: { x: 700, y: 50 },
            connections: ['notification1']
          },
          {
            id: 'action3',
            type: 'action',
            name: 'Send Out of Stock Notice',
            description: 'Notify customer about unavailable items',
            config: { service: 'email', template: 'out_of_stock' },
            position: { x: 700, y: 150 },
            connections: []
          },
          {
            id: 'notification1',
            type: 'notification',
            name: 'Order Confirmation',
            description: 'Send order confirmation email',
            config: { service: 'email', template: 'order_confirmation' },
            position: { x: 900, y: 50 },
            connections: []
          }
        ],
        triggers: 1,
        actions: 4,
        estimatedSavings: '15 hours/week',
        difficulty: 'medium',
        popularity: 85
      },
      {
        id: 'customer_onboarding',
        name: 'Smart Customer Onboarding',
        description: 'AI-powered customer onboarding with personalized welcome sequences',
        category: 'Customer Success',
        nodes: [
          {
            id: 'trigger1',
            type: 'trigger',
            name: 'New Customer Signup',
            description: 'Triggers when customer creates account',
            config: { event: 'customer.signup' },
            position: { x: 100, y: 100 },
            connections: ['action1']
          },
          {
            id: 'action1',
            type: 'action',
            name: 'AI Profile Analysis',
            description: 'Analyze customer profile for personalization',
            config: { service: 'ai', method: 'analyzeProfile' },
            position: { x: 300, y: 100 },
            connections: ['condition1']
          },
          {
            id: 'condition1',
            type: 'condition',
            name: 'Customer Type?',
            description: 'Determine customer segment',
            config: { condition: 'ai.customerType' },
            position: { x: 500, y: 100 },
            connections: ['action2', 'action3', 'action4']
          },
          {
            id: 'action2',
            type: 'action',
            name: 'Enterprise Welcome Series',
            description: 'Send enterprise-focused onboarding',
            config: { service: 'email', template: 'enterprise_welcome' },
            position: { x: 700, y: 50 },
            connections: ['delay1']
          },
          {
            id: 'action3',
            type: 'action',
            name: 'SMB Welcome Series',
            description: 'Send SMB-focused onboarding',
            config: { service: 'email', template: 'smb_welcome' },
            position: { x: 700, y: 100 },
            connections: ['delay1']
          },
          {
            id: 'action4',
            type: 'action',
            name: 'Individual Welcome Series',
            description: 'Send individual-focused onboarding',
            config: { service: 'email', template: 'individual_welcome' },
            position: { x: 700, y: 150 },
            connections: ['delay1']
          },
          {
            id: 'delay1',
            type: 'delay',
            name: 'Wait 3 Days',
            description: 'Delay before follow-up',
            config: { duration: '3d' },
            position: { x: 900, y: 100 },
            connections: ['action5']
          },
          {
            id: 'action5',
            type: 'action',
            name: 'AI Engagement Check',
            description: 'Check customer engagement and suggest next steps',
            config: { service: 'ai', method: 'checkEngagement' },
            position: { x: 1100, y: 100 },
            connections: []
          }
        ],
        triggers: 1,
        actions: 6,
        estimatedSavings: '25 hours/week',
        difficulty: 'hard',
        popularity: 72
      },
      {
        id: 'inventory_alert',
        name: 'Intelligent Inventory Alerts',
        description: 'AI-powered inventory monitoring with predictive restocking',
        category: 'Inventory',
        nodes: [
          {
            id: 'trigger1',
            type: 'trigger',
            name: 'Daily Inventory Check',
            description: 'Runs daily inventory analysis',
            config: { schedule: '0 9 * * *' },
            position: { x: 100, y: 100 },
            connections: ['action1']
          },
          {
            id: 'action1',
            type: 'action',
            name: 'AI Stock Analysis',
            description: 'Analyze current stock levels and predict needs',
            config: { service: 'ai', method: 'analyzeInventory' },
            position: { x: 300, y: 100 },
            connections: ['condition1']
          },
          {
            id: 'condition1',
            type: 'condition',
            name: 'Reorder Needed?',
            description: 'Check if any items need reordering',
            config: { condition: 'ai.reorderRecommendations.length > 0' },
            position: { x: 500, y: 100 },
            connections: ['action2']
          },
          {
            id: 'action2',
            type: 'action',
            name: 'Generate Purchase Orders',
            description: 'Create automated purchase orders',
            config: { service: 'purchasing', method: 'createOrders' },
            position: { x: 700, y: 100 },
            connections: ['notification1']
          },
          {
            id: 'notification1',
            type: 'notification',
            name: 'Alert Purchasing Team',
            description: 'Notify team about generated orders',
            config: { service: 'slack', channel: '#purchasing' },
            position: { x: 900, y: 100 },
            connections: []
          }
        ],
        triggers: 1,
        actions: 3,
        estimatedSavings: '10 hours/week',
        difficulty: 'easy',
        popularity: 91
      }
    ];
    setWorkflows(mockTemplates);
  };

  // AI suggestions are now loaded through transformProcessDataToWorkflows in loadAIWorkflowData

  const generateWorkflowFromPrompt = async (prompt: string) => {
    setIsGenerating(true);
    
    // Simulate AI workflow generation
    setTimeout(() => {
      const generatedWorkflow: WorkflowTemplate = {
        id: `generated_${Date.now()}`,
        name: `AI Generated: ${prompt.substring(0, 30)}...`,
        description: `Automatically generated workflow based on: "${prompt}"`,
        category: 'AI Generated',
        nodes: [
          {
            id: 'trigger1',
            type: 'trigger',
            name: 'Generated Trigger',
            description: 'AI-generated trigger based on your requirements',
            config: { event: 'custom.generated' },
            position: { x: 100, y: 100 },
            connections: ['action1']
          },
          {
            id: 'action1',
            type: 'action',
            name: 'AI Action',
            description: 'AI-suggested action for your workflow',
            config: { service: 'ai', method: 'processRequest' },
            position: { x: 300, y: 100 },
            connections: ['notification1']
          },
          {
            id: 'notification1',
            type: 'notification',
            name: 'Completion Notice',
            description: 'Notify when workflow completes',
            config: { service: 'email', template: 'workflow_complete' },
            position: { x: 500, y: 100 },
            connections: []
          }
        ],
        triggers: 1,
        actions: 2,
        estimatedSavings: 'AI Estimated',
        difficulty: 'medium',
        popularity: 0
      };
      
      setWorkflows(prev => [generatedWorkflow, ...prev]);
      setSelectedWorkflow(generatedWorkflow);
      setIsGenerating(false);
      setGenerationPrompt('');
    }, 3000);
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <PlayIcon />;
      case 'action': return <ConfigIcon />;
      case 'condition': return <WarningIcon />;
      case 'delay': return <ExpandIcon />;
      case 'notification': return <BotIcon />;
      default: return <FlowIcon />;
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'success';
      case 'action': return 'primary';
      case 'condition': return 'warning';
      case 'delay': return 'info';
      case 'notification': return 'secondary';
      default: return 'default';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'automation': return <MagicIcon />;
      case 'optimization': return <PlayIcon />;
      case 'enhancement': return <SuggestionIcon />;
      case 'fix': return <ErrorIcon />;
      default: return <AIIcon />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ flexGrow: 1 }}>AI Workflow Builder</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'templates' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('templates')}
            >
              Templates
            </Button>
            <Button
              variant={viewMode === 'suggestions' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('suggestions')}
              startIcon={<SuggestionIcon />}
            >
              AI Suggestions
            </Button>
          </Box>
        </Box>

        {viewMode === 'templates' && (
          <Grid container spacing={3}>
            {/* AI Generation */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  <MagicIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Generate Workflow with AI
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Describe what you want to automate, and AI will generate a complete workflow for you.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="e.g., 'Automate customer follow-up emails after purchase'"
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    size="small"
                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => generateWorkflowFromPrompt(generationPrompt)}
                    disabled={!generationPrompt.trim() || isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={16} /> : <MagicIcon />}
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Workflow Templates */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {workflows.map((workflow) => (
                  <Grid item xs={12} md={6} lg={4} key={workflow.id}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 },
                        border: selectedWorkflow?.id === workflow.id ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {workflow.name}
                        </Typography>
                        <Chip 
                          label={workflow.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {workflow.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip 
                          label={`${workflow.triggers} triggers`} 
                          size="small" 
                          color="success"
                        />
                        <Chip 
                          label={`${workflow.actions} actions`} 
                          size="small" 
                          color="primary"
                        />
                        <Chip 
                          label={workflow.difficulty} 
                          size="small" 
                          color={workflow.difficulty === 'easy' ? 'success' : workflow.difficulty === 'medium' ? 'warning' : 'error'}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="success.main" fontWeight={500}>
                          Saves: {workflow.estimatedSavings}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {workflow.popularity}% popularity
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}

        {viewMode === 'suggestions' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  AI has analyzed your business processes and identified these automation opportunities:
                </Typography>
              </Alert>
            </Grid>
            
            {suggestions.map((suggestion, index) => (
              <Grid item xs={12} key={suggestion.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {getSuggestionIcon(suggestion.type)}
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="h6">{suggestion.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={suggestion.type} 
                            size="small" 
                            color="primary"
                          />
                          <Chip 
                            label={`${suggestion.impact} impact`} 
                            size="small" 
                            color={getImpactColor(suggestion.impact) as any}
                          />
                          <Chip 
                            label={`${Math.round(suggestion.confidence * 100)}% confidence`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={suggestion.estimatedTime} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" paragraph>
                      {suggestion.description}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Implementation Steps:
                    </Typography>
                    <List dense>
                      {suggestion.implementation.map((step, stepIndex) => (
                        <ListItem key={stepIndex}>
                          <ListItemIcon>
                            <Typography variant="body2" color="primary.main" fontWeight={500}>
                              {stepIndex + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        startIcon={<MagicIcon />}
                        onClick={() => generateWorkflowFromPrompt(suggestion.title)}
                      >
                        Generate Workflow
                      </Button>
                      <Button variant="outlined">
                        Learn More
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Selected Workflow Detail Dialog */}
        <Dialog
          open={!!selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FlowIcon sx={{ mr: 1 }} />
              {selectedWorkflow?.name}
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedWorkflow && (
              <Box>
                <Typography variant="body1" paragraph>
                  {selectedWorkflow.description}
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Workflow Nodes
                </Typography>
                <Grid container spacing={1}>
                  {selectedWorkflow.nodes.map((node) => (
                    <Grid item xs={12} sm={6} md={4} key={node.id}>
                      <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getNodeTypeIcon(node.type)}
                          <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            {node.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {node.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={node.type} 
                            size="small" 
                            color={getNodeTypeColor(node.type) as any}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedWorkflow(null)}>Close</Button>
            <Button variant="outlined" startIcon={<EditIcon />}>
              Customize
            </Button>
            <Button variant="contained" startIcon={<PlayIcon />}>
              Deploy Workflow
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AIWorkflowBuilder;
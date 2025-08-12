import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Fab,
  Tooltip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Stop,
  Save,
  Download,
  Upload,
  Delete,
  Edit,
  AccountTree,
  Assignment,
  Timer,
  CheckCircle,
  Cancel,
  Email,
  NotificationsActive,
  Code,
  Settings,
  Close,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Workflow node types
interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'timer' | 'email' | 'approval' | 'end' | 'automation';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config: any;
  connections: string[];
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'inactive';
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowBuilder: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'wf_' + Date.now(),
    name: 'New Workflow',
    description: '',
    version: '1.0',
    status: 'draft',
    nodes: [],
    connections: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Node type definitions
  const nodeTypes = [
    {
      type: 'start',
      label: 'Start Event',
      icon: <PlayArrow />,
      color: '#4caf50',
      description: 'Process start point'
    },
    {
      type: 'task',
      label: 'User Task',
      icon: <Assignment />,
      color: '#2196f3',
      description: 'Manual task requiring user input'
    },
    {
      type: 'approval',
      label: 'Approval Task',
      icon: <CheckCircle />,
      color: '#ff9800',
      description: 'Approval or review task'
    },
    {
      type: 'automation',
      label: 'Automated Task',
      icon: <Settings />,
      color: '#9c27b0',
      description: 'System automated task'
    },
    {
      type: 'decision',
      label: 'Decision Gateway',
      icon: <AccountTree />,
      color: '#ffc107',
      description: 'Conditional branching point'
    },
    {
      type: 'timer',
      label: 'Timer Event',
      icon: <Timer />,
      color: '#795548',
      description: 'Time-based delay or trigger'
    },
    {
      type: 'email',
      label: 'Email Notification',
      icon: <Email />,
      color: '#607d8b',
      description: 'Send email notification'
    },
    {
      type: 'end',
      label: 'End Event',
      icon: <Stop />,
      color: '#f44336',
      description: 'Process end point'
    }
  ];

  const handleDragStart = (nodeType: string) => {
    setDraggedNodeType(nodeType);
  };

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodeTypeConfig = nodeTypes.find(nt => nt.type === draggedNodeType);
    if (!nodeTypeConfig) return;

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: draggedNodeType as any,
      label: nodeTypeConfig.label,
      x: x - 75, // Center the node
      y: y - 40,
      width: 150,
      height: 80,
      config: {},
      connections: []
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date()
    }));

    setDraggedNodeType(null);
  }, [draggedNodeType, nodeTypes]);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
    setConfigDialogOpen(true);
  };

  const handleNodeUpdate = (updatedNode: WorkflowNode) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      ),
      updatedAt: new Date()
    }));
    setConfigDialogOpen(false);
    setSelectedNode(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => 
        conn.from !== nodeId && conn.to !== nodeId
      ),
      updatedAt: new Date()
    }));
  };

  const handleDeployWorkflow = async () => {
    setIsDeploying(true);
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWorkflow(prev => ({
        ...prev,
        status: 'active',
        updatedAt: new Date()
      }));
      
      alert('Workflow deployed successfully!');
    } catch (error) {
      alert('Failed to deploy workflow');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSaveWorkflow = () => {
    // Save workflow logic
    console.log('Saving workflow:', workflow);
    alert('Workflow saved successfully!');
  };

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.icon || <Assignment />;
  };

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.color || '#2196f3';
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Toolbox Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%'
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Workflow Toolbox
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag and drop components to build your workflow
          </Typography>
        </Box>
        <Divider />
        
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {nodeTypes.map((nodeType) => (
            <ListItem
              key={nodeType.type}
              draggable
              onDragStart={() => handleDragStart(nodeType.type)}
              sx={{
                cursor: 'grab',
                '&:hover': { bgcolor: 'action.hover' },
                '&:active': { cursor: 'grabbing' }
              }}
            >
              <ListItemIcon sx={{ color: nodeType.color }}>
                {nodeType.icon}
              </ListItemIcon>
              <ListItemText 
                primary={nodeType.label}
                secondary={nodeType.description}
              />
            </ListItem>
          ))}
        </List>

        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Workflow Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveWorkflow}
              fullWidth
            >
              Save Workflow
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              fullWidth
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              fullWidth
            >
              Import
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Main Canvas Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
              {drawerOpen ? <Close /> : <AccountTree />}
            </IconButton>
            <Typography variant="h6">
              {workflow.name}
            </Typography>
            <Chip 
              label={workflow.status.toUpperCase()} 
              color={workflow.status === 'active' ? 'success' : 'default'}
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleDeployWorkflow}
              disabled={isDeploying || workflow.nodes.length === 0}
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </Button>
          </Box>
        </Paper>

        {/* Canvas */}
        <Box
          ref={canvasRef}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          sx={{
            flex: 1,
            position: 'relative',
            bgcolor: '#fafafa',
            backgroundImage: 'radial-gradient(circle, #e0e0e0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            overflow: 'auto'
          }}
        >
          {workflow.nodes.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              <AccountTree sx={{ fontSize: 64, opacity: 0.3 }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Start Building Your Workflow
              </Typography>
              <Typography variant="body2">
                Drag components from the toolbox to create your business process
              </Typography>
            </Box>
          )}

          {/* Render Workflow Nodes */}
          {workflow.nodes.map((node) => (
            <Card
              key={node.id}
              sx={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: selectedNode?.id === node.id ? 'primary.main' : 'grey.300',
                '&:hover': {
                  boxShadow: 4,
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => handleNodeClick(node)}
            >
              <CardContent sx={{ 
                p: 1, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <IconButton
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    top: 2, 
                    right: 2,
                    bgcolor: 'error.light',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.main' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNode(node.id);
                  }}
                >
                  <Delete sx={{ fontSize: 16 }} />
                </IconButton>
                
                <Box sx={{ 
                  color: getNodeColor(node.type), 
                  mb: 1 
                }}>
                  {getNodeIcon(node.type)}
                </Box>
                <Typography 
                  variant="caption" 
                  align="center" 
                  sx={{ fontWeight: 'bold' }}
                >
                  {node.label}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Status Bar */}
        <Paper sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Nodes: {workflow.nodes.length} | Last saved: {workflow.updatedAt.toLocaleTimeString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.name} • {user?.role}
          </Typography>
        </Paper>
      </Box>

      {/* Node Configuration Dialog */}
      <Dialog 
        open={configDialogOpen} 
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Configure Node: {selectedNode?.label}
        </DialogTitle>
        <DialogContent>
          {selectedNode && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Node Name"
                value={selectedNode.label}
                onChange={(e) => setSelectedNode({
                  ...selectedNode,
                  label: e.target.value
                })}
                sx={{ mb: 2 }}
              />
              
              {selectedNode.type === 'task' && (
                <>
                  <TextField
                    fullWidth
                    label="Task Description"
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Assignee Role"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Due Date (hours)"
                    type="number"
                    sx={{ mb: 2 }}
                  />
                </>
              )}
              
              {selectedNode.type === 'approval' && (
                <>
                  <TextField
                    fullWidth
                    label="Approval Type"
                    select
                    SelectProps={{ native: true }}
                    sx={{ mb: 2 }}
                  >
                    <option value="single">Single Approver</option>
                    <option value="multiple">Multiple Approvers</option>
                    <option value="majority">Majority Vote</option>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Approver Roles"
                    placeholder="manager, admin"
                    sx={{ mb: 2 }}
                  />
                </>
              )}
              
              {selectedNode.type === 'timer' && (
                <>
                  <TextField
                    fullWidth
                    label="Delay Duration (minutes)"
                    type="number"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Timer Type"
                    select
                    SelectProps={{ native: true }}
                    sx={{ mb: 2 }}
                  >
                    <option value="delay">Delay</option>
                    <option value="deadline">Deadline</option>
                    <option value="recurring">Recurring</option>
                  </TextField>
                </>
              )}
              
              {selectedNode.type === 'email' && (
                <>
                  <TextField
                    fullWidth
                    label="Email Template"
                    select
                    SelectProps={{ native: true }}
                    sx={{ mb: 2 }}
                  >
                    <option value="notification">Notification</option>
                    <option value="approval_request">Approval Request</option>
                    <option value="reminder">Reminder</option>
                    <option value="completion">Completion Notice</option>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Recipients"
                    placeholder="Enter email addresses or roles"
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => selectedNode && handleNodeUpdate(selectedNode)}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowBuilder;

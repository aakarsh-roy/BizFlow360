import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogContent,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Psychology as AIIcon,
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Close as CloseIcon,
  AttachFile as AttachIcon,
  AutoAwesome as MagicIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  TrendingUp as AnalyticsIcon,
  Assignment as TaskIcon,
  Inventory as InventoryIcon,
  Speed as ProcessIcon,
  MoreVert as MoreIcon,
  Clear as ClearIcon,
  Download as ExportIcon
} from '@mui/icons-material';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  actions?: Array<{
    label: string;
    action: string;
    params?: any;
  }>;
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, onMinimize }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const capabilities: AICapability[] = [
    {
      id: 'analytics',
      name: 'Analytics & Insights',
      description: 'Get AI-powered insights from your business data',
      icon: <AnalyticsIcon />,
      examples: [
        'Show me sales trends for this month',
        'What are my top performing products?',
        'Analyze customer satisfaction metrics'
      ]
    },
    {
      id: 'tasks',
      name: 'Task Management',
      description: 'Manage and prioritize tasks intelligently',
      icon: <TaskIcon />,
      examples: [
        'Create a high-priority task for inventory review',
        'Show me my overdue tasks',
        'Suggest task assignments for the team'
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Optimize stock levels and predict demand',
      icon: <InventoryIcon />,
      examples: [
        'Check inventory levels for laptops',
        'When should I reorder headphones?',
        'Show me items at risk of stockout'
      ]
    },
    {
      id: 'processes',
      name: 'Process Optimization',
      description: 'Identify bottlenecks and improve workflows',
      icon: <ProcessIcon />,
      examples: [
        'Find bottlenecks in order processing',
        'How can I improve customer onboarding?',
        'Suggest automation opportunities'
      ]
    }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: "Hi! I'm your AI assistant for BizFlow360. I can help you with analytics, task management, inventory optimization, and process improvement. How can I assist you today?",
        timestamp: new Date(),
        suggestions: [
          'Show dashboard insights',
          'Check critical tasks',
          'Review inventory alerts',
          'Find process bottlenecks'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    // Analyze user intent and generate appropriate response
    if (input.includes('dashboard') || input.includes('insights') || input.includes('analytics')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "I've analyzed your dashboard data. Here are the key insights: Revenue is up 15% this month, conversion rates have improved by 8%, and customer satisfaction scores are at 8.4/10. Would you like me to dive deeper into any specific metric?",
        timestamp: new Date(),
        suggestions: ['Show revenue breakdown', 'Analyze conversion funnel', 'Customer feedback summary'],
        actions: [
          { label: 'Open Analytics Dashboard', action: 'navigate', params: { route: '/analytics' } },
          { label: 'Generate Report', action: 'generate_report', params: { type: 'monthly_insights' } }
        ]
      };
    }
    
    if (input.includes('task') || input.includes('todo') || input.includes('priority')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "I found 12 pending tasks, 3 of which are high priority. The most critical task is 'Inventory Review for Q4' due tomorrow. I've also identified 5 tasks that can be automated. Shall I prioritize your task list?",
        timestamp: new Date(),
        suggestions: ['Show high priority tasks', 'Automate routine tasks', 'Create new task'],
        actions: [
          { label: 'View Task Board', action: 'navigate', params: { route: '/tasks' } },
          { label: 'Auto-prioritize Tasks', action: 'ai_prioritize' }
        ]
      };
    }
    
    if (input.includes('inventory') || input.includes('stock') || input.includes('reorder')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "Inventory analysis complete! I found 3 critical stock alerts: Smart Phone Cases need immediate reordering (2 days supply left), Premium Laptops have unusual demand surge (+40%), and Wireless Headphones are overstocked by 50%. Total optimization potential: $8,750 savings.",
        timestamp: new Date(),
        suggestions: ['Place emergency orders', 'Optimize stock levels', 'Review demand forecasts'],
        actions: [
          { label: 'Open Inventory Manager', action: 'navigate', params: { route: '/inventory' } },
          { label: 'Create Purchase Orders', action: 'create_orders' }
        ]
      };
    }
    
    if (input.includes('process') || input.includes('workflow') || input.includes('bottleneck')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "Process analysis reveals 3 major bottlenecks: Order Processing (2-hour delays due to manual approvals), Quality Control (45% impact on performance), and Customer Onboarding (under-staffed during peak). I've identified automation opportunities that could improve efficiency by 35%.",
        timestamp: new Date(),
        suggestions: ['Automate approvals', 'Optimize quality control', 'Scale onboarding team'],
        actions: [
          { label: 'View Process Monitor', action: 'navigate', params: { route: '/processes' } },
          { label: 'Start Optimization', action: 'optimize_processes' }
        ]
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: "I understand you're asking about " + userInput + ". Let me help you with that. Based on your business data, I can provide insights on analytics, manage your tasks, optimize inventory, or improve processes. What specific area would you like to focus on?",
      timestamp: new Date(),
      suggestions: ['Analytics insights', 'Task management', 'Inventory optimization', 'Process improvement']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleActionClick = (action: any) => {
    // Handle action execution
    console.log('Executing action:', action);
    // In a real implementation, this would trigger actual navigation or operations
    if (action.action === 'navigate') {
      alert(`Navigating to ${action.params.route}`);
    } else {
      alert(`Executing: ${action.label}`);
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // In a real implementation, this would start/stop speech recognition
    if (!isListening) {
      // Start voice recognition
      setTimeout(() => {
        setInputValue("Show me today's analytics insights");
        setIsListening(false);
      }, 3000);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setAnchorEl(null);
  };

  const handleExportChat = () => {
    const chatData = messages.map(msg => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    }));
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-assistant-chat.json';
    link.click();
    setAnchorEl(null);
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <BotIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">AI Assistant</Typography>
            <Typography variant="caption" color="text.secondary">
              Powered by BizFlow360 Intelligence
            </Typography>
          </Box>
          <IconButton onClick={() => setAnchorEl(prev => prev ? null : document.querySelector('[data-menu-anchor]'))}>
            <MoreIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Capabilities (shown when no messages) */}
        {messages.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>What I can help you with:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {capabilities.map((capability) => (
                <Paper 
                  key={capability.id}
                  sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => handleSuggestionClick(capability.examples[0])}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {capability.icon}
                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                      {capability.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {capability.description}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
          <List>
            {messages.map((message) => (
              <ListItem key={message.id} sx={{ alignItems: 'flex-start', px: 1 }}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    bgcolor: message.type === 'ai' ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  {message.type === 'ai' ? <BotIcon fontSize="small" /> : <UserIcon fontSize="small" />}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: message.type === 'ai' ? 'grey.100' : 'primary.light',
                      color: message.type === 'ai' ? 'text.primary' : 'primary.contrastText'
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            clickable
                            onClick={() => handleSuggestionClick(suggestion)}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {/* Actions */}
                    {message.actions && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="small"
                            variant="contained"
                            startIcon={<MagicIcon />}
                            onClick={() => handleActionClick(action)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <ListItem sx={{ alignItems: 'flex-start', px: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      AI is thinking...
                    </Typography>
                  </Box>
                </Paper>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              ref={inputRef}
              fullWidth
              variant="outlined"
              placeholder="Ask me anything about your business..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
              size="small"
            />
            <Tooltip title="Voice input">
              <IconButton 
                color={isListening ? 'error' : 'default'}
                onClick={handleVoiceToggle}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Send message">
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {isListening && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption" color="primary.main">
                Listening... Speak now
              </Typography>
            </Box>
          )}
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={handleClearChat}>
            <ClearIcon sx={{ mr: 1 }} />
            Clear Chat
          </MenuItem>
          <MenuItem onClick={handleExportChat}>
            <ExportIcon sx={{ mr: 1 }} />
            Export Chat
          </MenuItem>
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

// Floating Action Button component to open the assistant
export const AIAssistantFAB: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000
      }}
      onClick={onClick}
    >
      <AIIcon />
    </Fab>
  );
};

export default AIAssistant;
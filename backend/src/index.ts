import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

import connectDB from './config/database';
import { initializeSocket } from './services/SocketService';
import authRoutes from './routes/auth';
import operationsRoutes from './routes/operations';
import tasksRoutes from './routes/tasks';
import kpiRoutes from './routes/kpi';
import aiRoutes from './routes/aiRoutes';
import aiTaskRoutes from './routes/aiTasks';
import aiKPIRoutes from './routes/aiKPI';
import enhancedAIRoutes from './routes/enhancedAI';
import automatedWorkflowRoutes from './routes/automatedWorkflows';
import workflowRoutes from './routes/workflow';
import productRoutes from './modules/inventory/routes/productRoutes';
import mlRoutes from './routes/ml';
import chatRoutes from './routes/chat';
import { errorHandler } from './middleware/errorHandler';
import { seedKPIData, simulateRealTimeUpdates } from './seeders/kpiSeeder';

dotenv.config();

const app = express();
const server = createServer(app);

// Connect to database
connectDB();

// Initialize Socket.IO for real-time chat
const socketService = initializeSocket(server);
console.log('🚀 Socket.IO initialized for real-time chat');

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log request body for POST/PUT requests (exclude passwords)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    console.log(`[${timestamp}] Request Body:`, sanitizedBody);
  }
  
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai', aiTaskRoutes);
app.use('/api/ai', aiKPIRoutes);
app.use('/api/ai', enhancedAIRoutes);
app.use('/api/workflows/automated', automatedWorkflowRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/inventory/products', productRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    service: 'BizFlow360 - Business Process Automation & KPI Platform',
    modules: [
      'Authentication & Authorization',
      'Business Process Automation',
      'Task Management',
      'Workflow Engine',
      'KPI Analytics',
      'Stock Management',
      'Sales Operations',
      'Audit & Compliance',
      'Real-time Notifications'
    ],
    database: 'MongoDB - All operations stored',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 BizFlow360 BPA Platform Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: MongoDB - All operations stored`);
  console.log(`📦 Modules: BPA, Workflows, Tasks, Analytics, Operations, AI Services, Automated Workflows`);
  console.log(`🔧 API Endpoints:`);
  console.log(`   - /api/auth/login - User authentication`);
  console.log(`   - /api/auth/register - User registration`);
  console.log(`   - /api/workflows - Process definitions & instances`);
  console.log(`   - /api/workflows/automated - Automated workflow generation`);
  console.log(`   - /api/operations/stock/movement - Stock updates`);
  console.log(`   - /api/operations/tasks - Task management`);
  console.log(`   - /api/operations/sales - Sales transactions`);
  console.log(`   - /api/kpi - KPI metrics`);
  console.log(`   - /api/chat/* - Real-time team chat`);
  console.log(`   - /api/ai/forecast - AI-powered forecasting`);
  console.log(`   - /api/ai/analyze-text - NLP text analysis`);
  console.log(`   - /api/ai/recommendations/* - Intelligent recommendations`);
  console.log(`   - /api/ai/detect-anomalies - Anomaly detection`);
  console.log(`   - /api/ai/dashboard - AI-enhanced dashboard`);
  console.log(`   - /api/workflows/generate - Automated workflow generation`);
  console.log(`   - /api/workflows/templates - Workflow template library`);
  console.log(`   - /api/workflows/analyze - Workflow description analysis`);
  console.log(`   - /api/operations/workflow/step - Process steps`);
  console.log(`   - /api/operations/history - Audit trail`);
  console.log(`   - /api/operations/metrics - Real-time metrics`);
  console.log(`   - /api/chat/rooms - Chat room management`);
  console.log(`   - /api/chat/rooms/:id/messages - Real-time messaging`);
  console.log(`   - /api/chat/search - Message search`);
  console.log(`💬 Real-time chat with Socket.IO is active`);
  console.log(`✅ All business operations are being stored in MongoDB`);
  console.log(`📝 Audit logging is active for compliance tracking`);
  console.log(`🔍 Request logging is enabled`);

  // Initialize KPI data seeding in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      setTimeout(async () => {
        await seedKPIData();
        console.log(`✅ KPI data seeding completed`);
        
        // Seed AI training data for enhanced AI services
        const { AIDataSeeder } = await import('./services/AIDataSeeder');
        const mongoose = await import('mongoose');
        const defaultCompanyId = new mongoose.default.Types.ObjectId();
        await AIDataSeeder.seedAITrainingData(defaultCompanyId.toString());
        console.log(`🤖 AI training data seeding completed`);
        
        // Seed default chat rooms
        const { ChatSeeder } = await import('./seeders/chatSeeder');
        await ChatSeeder.seedDefaultChatRooms();
        console.log(`💬 Chat rooms seeding completed`);
        
        // Start real-time simulation every 30 seconds
        setInterval(simulateRealTimeUpdates, 30000);
        console.log(`🔄 Real-time KPI updates started (every 30 seconds)`);
      }, 2000); // Wait 2 seconds for DB connection to stabilize
    } catch (error) {
      console.error(`❌ Error initializing KPI system:`, error);
    }
  }
});

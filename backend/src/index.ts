import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/database';
import authRoutes from './routes/auth';
import operationsRoutes from './routes/operations';
import tasksRoutes from './routes/tasks';
import kpiRoutes from './routes/kpi';
import productRoutes from './modules/inventory/routes/productRoutes';
import { errorHandler } from './middleware/errorHandler';
import { seedKPIData, simulateRealTimeUpdates } from './seeders/kpiSeeder';

dotenv.config();

const app = express();

// Connect to database
connectDB();

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
app.use('/api/inventory/products', productRoutes);

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

app.listen(PORT, async () => {
  console.log(`🚀 BizFlow360 BPA Platform Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: MongoDB - All operations stored`);
  console.log(`📦 Modules: BPA, Workflows, Tasks, Analytics, Operations`);
  console.log(`🔧 API Endpoints:`);
  console.log(`   - /api/auth/login - User authentication`);
  console.log(`   - /api/auth/register - User registration`);
  console.log(`   - /api/operations/stock/movement - Stock updates`);
  console.log(`   - /api/operations/tasks - Task management`);
  console.log(`   - /api/operations/sales - Sales transactions`);
  console.log(`   - /api/kpi - KPI metrics`);
  console.log(`   - /api/operations/workflow/step - Process steps`);
  console.log(`   - /api/operations/history - Audit trail`);
  console.log(`   - /api/operations/metrics - Real-time metrics`);
  console.log(`✅ All business operations are being stored in MongoDB`);
  console.log(`📝 Audit logging is active for compliance tracking`);
  console.log(`🔍 Request logging is enabled`);

  // Initialize KPI data seeding in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      setTimeout(async () => {
        await seedKPIData();
        console.log(`✅ KPI data seeding completed`);
        
        // Start real-time simulation every 30 seconds
        setInterval(simulateRealTimeUpdates, 30000);
        console.log(`🔄 Real-time KPI updates started (every 30 seconds)`);
      }, 2000); // Wait 2 seconds for DB connection to stabilize
    } catch (error) {
      console.error(`❌ Error initializing KPI system:`, error);
    }
  }
});

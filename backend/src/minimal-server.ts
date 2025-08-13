import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';

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

// API Routes - only auth for now
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    service: 'BizFlow360 - Minimal Auth Server',
    timestamp: new Date().toISOString() 
  });
});

// Manifest.json for PWA
app.get('/manifest.json', (req, res) => {
  console.log('📱 Manifest.json requested');
  res.json({
    short_name: "BizFlow360",
    name: "BizFlow360 Business Process Automation",
    icons: [
      {
        src: "favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon"
      }
    ],
    start_url: ".",
    display: "standalone",
    theme_color: "#000000",
    background_color: "#ffffff"
  });
});

// Simple error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 BizFlow360 Minimal Auth Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: MongoDB Connected`);
  console.log(`🔧 API Endpoints:`);
  console.log(`   - /api/auth/login - User authentication`);
  console.log(`   - /api/auth/register - User registration`);
  console.log(`   - /api/health - Health check`);
  console.log(`🔍 Request logging is enabled`);
});

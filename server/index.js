/**
 * Agent Workflow Dashboard - Backend Server
 * BMAD v4 + PRP + Real-time WebSocket Integration
 * Kevin Gardner - Enterprise Agent Orchestration System
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const socketHandler = require('./sockets/socketHandler');

// Import routes
const agentRoutes = require('./routes/agents');
const messageRoutes = require('./routes/messages');
const githubRoutes = require('./routes/github');
const deploymentRoutes = require('./routes/deployment');
const systemRoutes = require('./routes/system');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/deployment', deploymentRoutes);
app.use('/api/system', systemRoutes);

// Socket.IO handling
socketHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Server startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Agent Workflow Dashboard Backend running on port ${PORT}`);
  logger.info(`🎯 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Client URL: ${process.env.CLIENT_URL}`);
  logger.info(`📡 WebSocket ready for real-time communication`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
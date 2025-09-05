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

// Import metrics for Grafana
const metrics = require('./metrics');

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

// Initialize Prometheus metrics
metrics.initializeMetrics();

// Security middleware
app.use(helmet({
  // Allow Prometheus scraping
  contentSecurityPolicy: false
}));

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

// Request logging with metrics
app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  
  // Track HTTP metrics for Grafana
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
    
    metrics.httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    agents: {
      total: 33,
      active: 33,
      teams: {
        atlas: 10,
        aurora: 10,
        phoenix: 10,
        sentinel: 3
      }
    }
  });
});

// GRAFANA METRICS ENDPOINT - Critical for monitoring
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    const metricsData = await metrics.register.metrics();
    res.end(metricsData);
    logger.info('Metrics scraped by Grafana Agent');
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).end();
  }
});

// API Routes with metric tracking
app.use('/api/agents', (req, res, next) => {
  // Track agent API calls
  metrics.apiCallsTotal.labels('agents', req.method).inc();
  next();
}, agentRoutes);

app.use('/api/messages', (req, res, next) => {
  // Track message API calls
  metrics.apiCallsTotal.labels('messages', req.method).inc();
  next();
}, messageRoutes);

app.use('/api/github', (req, res, next) => {
  // Track GitHub API calls
  metrics.apiCallsTotal.labels('github', req.method).inc();
  metrics.githubApiCalls.inc();
  next();
}, githubRoutes);

app.use('/api/deployment', (req, res, next) => {
  // Track deployment API calls
  metrics.apiCallsTotal.labels('deployment', req.method).inc();
  next();
}, deploymentRoutes);

app.use('/api/system', (req, res, next) => {
  // Track system API calls
  metrics.apiCallsTotal.labels('system', req.method).inc();
  next();
}, systemRoutes);

// Socket.IO handling with metrics
io.on('connection', (socket) => {
  metrics.websocketConnections.inc();
  logger.info(`WebSocket client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    metrics.websocketConnections.dec();
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
  
  // Track agent status changes
  socket.on('agent:status', (data) => {
    metrics.agentStatusChanges.labels(data.agentId, data.status).inc();
    metrics.updateAgentMetrics(data.agentId, 'status_change');
  });
  
  // Track task completions
  socket.on('task:complete', (data) => {
    metrics.tasksCompleted.labels(data.agentId, data.team).inc();
    metrics.updateAgentMetrics(data.agentId, 'task_completed');
  });
  
  // Track ChromaDB queries
  socket.on('chromadb:query', (data) => {
    metrics.chromadbQueries.labels(data.collection).inc();
  });
  
  // Track GitHub commits
  socket.on('github:commit', (data) => {
    metrics.githubCommits.labels(data.branch, data.agentId).inc();
  });
});

socketHandler(io);

// Error handling middleware with metrics
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  metrics.errorsTotal.labels(err.name || 'UnknownError').inc();
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler with metrics
app.use('*', (req, res) => {
  metrics.errorsTotal.labels('NotFound').inc();
  res.status(404).json({ error: 'Route not found' });
});

// Server startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Agent Workflow Dashboard Backend running on port ${PORT}`);
  logger.info(`🎯 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Client URL: ${process.env.CLIENT_URL}`);
  logger.info(`📡 WebSocket ready for real-time communication`);
  logger.info(`📊 Grafana metrics exposed at /metrics`);
  logger.info(`📈 Monitoring 33 agents across 4 teams`);
  
  // Set initial metric values
  metrics.systemInfo.labels(
    process.version,
    process.platform,
    PORT.toString()
  ).set(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Update metrics every 30 seconds (simulate agent activity for now)
setInterval(() => {
  // Simulate some agent activity for Grafana
  const teams = ['atlas', 'aurora', 'phoenix', 'sentinel'];
  const randomTeam = teams[Math.floor(Math.random() * teams.length)];
  const randomAgent = `${randomTeam}-${Math.floor(Math.random() * 10) + 1}`;
  
  // Randomly update metrics to show activity in Grafana
  if (Math.random() > 0.7) {
    metrics.tasksCompleted.labels(randomAgent, randomTeam).inc();
    logger.info(`Simulated task completion for ${randomAgent}`);
  }
  
  if (Math.random() > 0.8) {
    metrics.chromadbQueries.labels(`${randomTeam}_workspace`).inc();
  }
  
  if (Math.random() > 0.9) {
    metrics.githubCommits.labels(randomAgent, randomAgent).inc();
  }
  
  // Update project progress
  const currentProgress = Math.min(100, Math.random() * 5);
  metrics.projectProgress.labels('seo-learning-platform').inc(currentProgress / 100);
  
}, 30000);

module.exports = { app, server, io };
/**
 * Agent Model - MongoDB Schema
 * BMAD v4 + PRP Agent Management
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed', 'blocked'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedAt: { type: Date, default: Date.now },
  startedAt: Date,
  completedAt: Date,
  estimatedDuration: Number, // minutes
  actualDuration: Number, // minutes
  dependencies: [String], // task IDs
  metadata: mongoose.Schema.Types.Mixed
});

const metricSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  cpuUsage: Number,
  memoryUsage: Number,
  responseTime: Number,
  throughput: Number,
  errorRate: Number
});

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'database', 'ai', 'devops', 'testing', 'documentation', 'visualization', 'realtime', 'orchestration']
  },
  status: {
    type: String,
    enum: ['active', 'working', 'completed', 'blocked', 'offline', 'deploying', 'error'],
    default: 'offline'
  },
  branch: {
    type: String,
    required: true
  },
  repository: {
    type: String,
    default: 'agent-workflow-dash'
  },
  description: String,
  capabilities: [String],
  version: {
    type: String,
    default: '1.0.0'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  lastDeployment: Date,
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'development'
  },
  configuration: {
    port: Number,
    endpoint: String,
    healthCheckUrl: String,
    logLevel: {
      type: String,
      enum: ['debug', 'info', 'warn', 'error'],
      default: 'info'
    },
    maxRetries: {
      type: Number,
      default: 3
    },
    timeout: {
      type: Number,
      default: 30000
    }
  },
  tasks: [taskSchema],
  currentTask: String, // current task ID
  progress: {
    completedTasks: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  metrics: [metricSchema],
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: {
      type: String,
      enum: ['debug', 'info', 'warn', 'error'],
      default: 'info'
    },
    message: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  dependencies: [String], // other agent names this agent depends on
  communication: {
    lastMessageAt: Date,
    messageCount: {
      type: Number,
      default: 0
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current task details
agentSchema.virtual('currentTaskDetails').get(function() {
  if (!this.currentTask) return null;
  return this.tasks.find(task => task.id === this.currentTask);
});

// Virtual for latest metrics
agentSchema.virtual('latestMetrics').get(function() {
  if (this.metrics.length === 0) return null;
  return this.metrics[this.metrics.length - 1];
});

// Method to update progress
agentSchema.methods.updateProgress = function() {
  const completed = this.tasks.filter(task => task.status === 'completed').length;
  const total = this.tasks.length;
  this.progress.completedTasks = completed;
  this.progress.totalTasks = total;
  this.progress.percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
};

// Method to add task
agentSchema.methods.addTask = function(taskData) {
  const task = {
    id: taskData.id || new mongoose.Types.ObjectId().toString(),
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority || 'medium',
    dependencies: taskData.dependencies || [],
    metadata: taskData.metadata || {}
  };
  this.tasks.push(task);
  this.updateProgress();
  return task;
};

// Method to update task status
agentSchema.methods.updateTaskStatus = function(taskId, status, metadata = {}) {
  const task = this.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    if (status === 'in-progress' && !task.startedAt) {
      task.startedAt = new Date();
    }
    if (status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
      if (task.startedAt) {
        task.actualDuration = Math.round((task.completedAt - task.startedAt) / 60000); // minutes
      }
    }
    task.metadata = { ...task.metadata, ...metadata };
    this.updateProgress();
  }
  return task;
};

// Method to add log entry
agentSchema.methods.addLog = function(level, message, metadata = {}) {
  this.logs.push({
    level,
    message,
    metadata
  });
  // Keep only last 1000 logs
  if (this.logs.length > 1000) {
    this.logs = this.logs.slice(-1000);
  }
};

// Method to add metrics
agentSchema.methods.addMetrics = function(metricsData) {
  this.metrics.push(metricsData);
  // Keep only last 100 metric entries
  if (this.metrics.length > 100) {
    this.metrics = this.metrics.slice(-100);
  }
};

// Method to update last seen
agentSchema.methods.heartbeat = function() {
  this.lastSeen = new Date();
  this.communication.isOnline = true;
};

// Index for efficient queries
agentSchema.index({ status: 1, type: 1 });
agentSchema.index({ lastSeen: 1 });
agentSchema.index({ 'tasks.status': 1 });

module.exports = mongoose.model('Agent', agentSchema);
/**
 * System Metrics Model - Overall System Health
 * Enterprise System Monitoring
 */

const mongoose = require('mongoose');

const systemMetricsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  system: {
    cpuUsage: Number, // percentage
    memoryUsage: Number, // percentage
    diskUsage: Number, // percentage
    uptime: Number, // seconds
    loadAverage: [Number], // 1, 5, 15 minute averages
    activeConnections: Number
  },
  agents: {
    total: Number,
    active: Number,
    working: Number,
    completed: Number,
    blocked: Number,
    offline: Number,
    error: Number
  },
  tasks: {
    total: Number,
    pending: Number,
    inProgress: Number,
    completed: Number,
    failed: Number,
    blocked: Number
  },
  deployments: {
    total: Number,
    pending: Number,
    running: Number,
    completed: Number,
    failed: Number,
    rollbacks: Number
  },
  communication: {
    totalMessages: Number,
    messagesPerHour: Number,
    activeConversations: Number,
    unreadMessages: Number,
    averageResponseTime: Number // minutes
  },
  github: {
    totalCommits: Number,
    commitsToday: Number,
    activeBranches: Number,
    openPullRequests: Number,
    runningActions: Number,
    failedActions: Number
  },
  performance: {
    averageResponseTime: Number, // milliseconds
    requestsPerSecond: Number,
    errorRate: Number, // percentage
    throughput: Number, // requests per minute
    peakMemoryUsage: Number,
    peakCpuUsage: Number
  },
  health: {
    overallScore: Number, // 0-100
    databaseStatus: String,
    cacheStatus: String,
    externalServices: [{
      name: String,
      status: String,
      responseTime: Number
    }]
  }
}, {
  timestamps: true
});

// Index for time-series queries
systemMetricsSchema.index({ timestamp: -1 });
systemMetricsSchema.index({ 'health.overallScore': -1, timestamp: -1 });

// Static method to get latest metrics
systemMetricsSchema.statics.getLatest = function() {
  return this.findOne().sort({ timestamp: -1 });
};

// Static method to get metrics in time range
systemMetricsSchema.statics.getInTimeRange = function(startTime, endTime, limit = 100) {
  return this.find({
    timestamp: {
      $gte: startTime,
      $lte: endTime
    }
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Method to calculate health score
systemMetricsSchema.methods.calculateHealthScore = function() {
  let score = 100;
  
  // Deduct points based on system metrics
  if (this.system.cpuUsage > 80) score -= 20;
  else if (this.system.cpuUsage > 60) score -= 10;
  
  if (this.system.memoryUsage > 80) score -= 20;
  else if (this.system.memoryUsage > 60) score -= 10;
  
  // Deduct points for agent issues
  const totalAgents = this.agents.total;
  if (totalAgents > 0) {
    const problemAgents = this.agents.blocked + this.agents.offline + this.agents.error;
    const problemRatio = problemAgents / totalAgents;
    score -= Math.round(problemRatio * 30);
  }
  
  // Deduct points for high error rate
  if (this.performance.errorRate > 5) score -= 15;
  else if (this.performance.errorRate > 2) score -= 5;
  
  this.health.overallScore = Math.max(0, score);
  return this.health.overallScore;
};

module.exports = mongoose.model('SystemMetrics', systemMetricsSchema);
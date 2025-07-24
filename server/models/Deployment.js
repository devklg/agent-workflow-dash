/**
 * Deployment Model - Agent Deployment Tracking
 * BMAD v4 Deployment Management
 */

const mongoose = require('mongoose');

const deploymentStepSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'skipped'],
    default: 'pending'
  },
  startedAt: Date,
  completedAt: Date,
  duration: Number, // milliseconds
  output: String,
  error: String
});

const deploymentSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'rollback'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['fresh', 'update', 'rollback', 'hotfix'],
    default: 'fresh'
  },
  triggeredBy: {
    type: String,
    default: 'kevin'
  },
  branch: {
    type: String,
    required: true
  },
  commitHash: String,
  commitMessage: String,
  steps: [deploymentStepSchema],
  configuration: {
    buildCommand: String,
    startCommand: String,
    healthCheckUrl: String,
    environmentVariables: mongoose.Schema.Types.Mixed,
    resources: {
      cpu: String,
      memory: String,
      storage: String
    }
  },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: String,
    message: String
  }],
  metrics: {
    buildTime: Number, // milliseconds
    deployTime: Number, // milliseconds
    totalTime: Number, // milliseconds
    artifactSize: Number, // bytes
    healthCheckTime: Number // milliseconds
  },
  previousDeployment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deployment'
  },
  rollbackData: {
    reason: String,
    rollbackTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deployment'
    },
    rollbackAt: Date
  },
  notifications: [{
    type: String,
    recipient: String,
    sentAt: Date,
    status: String
  }]
}, {
  timestamps: true
});

// Method to add step
deploymentSchema.methods.addStep = function(stepData) {
  this.steps.push(stepData);
};

// Method to update step status
deploymentSchema.methods.updateStepStatus = function(stepName, status, output = '', error = '') {
  const step = this.steps.find(s => s.name === stepName);
  if (step) {
    step.status = status;
    if (status === 'running' && !step.startedAt) {
      step.startedAt = new Date();
    }
    if (['completed', 'failed'].includes(status) && !step.completedAt) {
      step.completedAt = new Date();
      if (step.startedAt) {
        step.duration = step.completedAt - step.startedAt;
      }
    }
    if (output) step.output = output;
    if (error) step.error = error;
  }
  return step;
};

// Method to add log
deploymentSchema.methods.addLog = function(level, message) {
  this.logs.push({ level, message });
};

// Method to calculate total deployment time
deploymentSchema.methods.calculateTotalTime = function() {
  if (this.status === 'completed' && this.createdAt) {
    this.metrics.totalTime = new Date() - this.createdAt;
  }
};

// Index for efficient queries
deploymentSchema.index({ agentName: 1, createdAt: -1 });
deploymentSchema.index({ status: 1, environment: 1 });
deploymentSchema.index({ triggeredBy: 1, createdAt: -1 });

module.exports = mongoose.model('Deployment', deploymentSchema);
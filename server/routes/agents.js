/**
 * Agent Management Routes
 * BMAD v4 + PRP Agent Orchestration API
 */

const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Deployment = require('../models/Deployment');
const logger = require('../utils/logger');
const { validateAgent, validateTask } = require('../middleware/validation');
const agentService = require('../services/agentService');
const deploymentService = require('../services/deploymentService');

// GET /api/agents - List all agents
router.get('/', async (req, res) => {
  try {
    const { status, type, environment } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (environment) filter.environment = environment;
    
    const agents = await Agent.find(filter)
      .sort({ lastSeen: -1 })
      .select('-logs'); // Exclude logs for performance
    
    // Add real-time status check
    const agentsWithStatus = await Promise.all(
      agents.map(async (agent) => {
        const isOnline = await agentService.checkAgentHealth(agent.name);
        agent.communication.isOnline = isOnline;
        return agent;
      })
    );
    
    res.json({
      success: true,
      data: agentsWithStatus,
      count: agentsWithStatus.length
    });
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET /api/agents/:name - Get specific agent
router.get('/:name', async (req, res) => {
  try {
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Check real-time status
    const isOnline = await agentService.checkAgentHealth(agent.name);
    agent.communication.isOnline = isOnline;
    
    res.json({ success: true, data: agent });
  } catch (error) {
    logger.error(`Error fetching agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// POST /api/agents - Create new agent
router.post('/', validateAgent, async (req, res) => {
  try {
    const agentData = req.body;
    
    // Check if agent already exists
    const existingAgent = await Agent.findOne({ name: agentData.name });
    if (existingAgent) {
      return res.status(409).json({ error: 'Agent already exists' });
    }
    
    const agent = new Agent(agentData);
    await agent.save();
    
    logger.info(`Agent created: ${agent.name}`);
    
    // Emit to WebSocket
    req.app.get('io').emit('agent-created', agent);
    
    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    logger.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// PUT /api/agents/:name - Update agent
router.put('/:name', validateAgent, async (req, res) => {
  try {
    const agent = await Agent.findOneAndUpdate(
      { name: req.params.name },
      { ...req.body, lastSeen: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    logger.info(`Agent updated: ${agent.name}`);
    
    // Emit to WebSocket
    req.app.get('io').emit('agent-updated', agent);
    
    res.json({ success: true, data: agent });
  } catch (error) {
    logger.error(`Error updating agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// DELETE /api/agents/:name - Delete agent
router.delete('/:name', async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    logger.info(`Agent deleted: ${agent.name}`);
    
    // Emit to WebSocket
    req.app.get('io').emit('agent-deleted', { name: agent.name });
    
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// POST /api/agents/:name/deploy - Deploy agent
router.post('/:name/deploy', async (req, res) => {
  try {
    const { environment = 'development', version = '1.0.0' } = req.body;
    
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Start deployment process
    const deployment = await deploymentService.deployAgent(agent, {
      environment,
      version,
      triggeredBy: 'kevin'
    });
    
    // Update agent status
    agent.status = 'deploying';
    agent.lastDeployment = new Date();
    await agent.save();
    
    logger.info(`Deployment started for agent: ${agent.name}`);
    
    // Emit to WebSocket
    req.app.get('io').emit('deployment-started', {
      agent: agent.name,
      deployment: deployment._id
    });
    
    res.json({
      success: true,
      message: 'Deployment started',
      deploymentId: deployment._id
    });
  } catch (error) {
    logger.error(`Error deploying agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to start deployment' });
  }
});

// GET /api/agents/:name/logs - Get agent logs
router.get('/:name/logs', async (req, res) => {
  try {
    const { limit = 100, level } = req.query;
    
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    let logs = agent.logs;
    
    // Filter by level if specified
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    // Sort by timestamp descending and limit
    logs = logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));
    
    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error(`Error fetching logs for agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// POST /api/agents/:name/logs - Add log entry
router.post('/:name/logs', async (req, res) => {
  try {
    const { level, message, metadata = {} } = req.body;
    
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    agent.addLog(level, message, metadata);
    await agent.save();
    
    // Emit to WebSocket for real-time log viewing
    req.app.get('io').emit('agent-log', {
      agent: agent.name,
      log: { level, message, metadata, timestamp: new Date() }
    });
    
    res.json({ success: true, message: 'Log added' });
  } catch (error) {
    logger.error(`Error adding log for agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to add log' });
  }
});

// GET /api/agents/:name/tasks - Get agent tasks
router.get('/:name/tasks', async (req, res) => {
  try {
    const { status } = req.query;
    
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    let tasks = agent.tasks;
    
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    
    // Sort by created date
    tasks = tasks.sort((a, b) => b.assignedAt - a.assignedAt);
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error(`Error fetching tasks for agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/agents/:name/tasks - Add task to agent
router.post('/:name/tasks', validateTask, async (req, res) => {
  try {
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const task = agent.addTask(req.body);
    await agent.save();
    
    logger.info(`Task assigned to agent ${agent.name}: ${task.title}`);
    
    // Emit to WebSocket
    req.app.get('io').emit('task-assigned', {
      agent: agent.name,
      task: task
    });
    
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    logger.error(`Error adding task to agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// PUT /api/agents/:name/tasks/:taskId - Update task status
router.put('/:name/tasks/:taskId', async (req, res) => {
  try {
    const { status, metadata = {} } = req.body;
    
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const task = agent.updateTaskStatus(req.params.taskId, status, metadata);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await agent.save();
    
    logger.info(`Task updated for agent ${agent.name}: ${task.id} -> ${status}`);
    
    // Emit to WebSocket
    req.app.get('io').emit('task-updated', {
      agent: agent.name,
      task: task
    });
    
    res.json({ success: true, data: task });
  } catch (error) {
    logger.error(`Error updating task for agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// POST /api/agents/:name/heartbeat - Agent heartbeat
router.post('/:name/heartbeat', async (req, res) => {
  try {
    const { metrics = {} } = req.body;
    
    const agent = await Agent.findOne({ name: req.params.name });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    agent.heartbeat();
    
    // Add metrics if provided
    if (Object.keys(metrics).length > 0) {
      agent.addMetrics(metrics);
    }
    
    await agent.save();
    
    // Emit to WebSocket
    req.app.get('io').emit('agent-heartbeat', {
      agent: agent.name,
      timestamp: new Date(),
      metrics
    });
    
    res.json({ success: true, message: 'Heartbeat received' });
  } catch (error) {
    logger.error(`Error processing heartbeat for agent ${req.params.name}:`, error);
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

// POST /api/agents/bulk/deploy - Deploy multiple agents
router.post('/bulk/deploy', async (req, res) => {
  try {
    const { agentNames, environment = 'development' } = req.body;
    
    if (!Array.isArray(agentNames) || agentNames.length === 0) {
      return res.status(400).json({ error: 'Agent names array required' });
    }
    
    const deployments = [];
    
    for (const agentName of agentNames) {
      try {
        const agent = await Agent.findOne({ name: agentName });
        if (agent) {
          const deployment = await deploymentService.deployAgent(agent, {
            environment,
            triggeredBy: 'kevin'
          });
          
          agent.status = 'deploying';
          await agent.save();
          
          deployments.push({
            agent: agentName,
            deploymentId: deployment._id,
            status: 'started'
          });
        }
      } catch (error) {
        deployments.push({
          agent: agentName,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    logger.info(`Bulk deployment started for ${deployments.length} agents`);
    
    // Emit to WebSocket
    req.app.get('io').emit('bulk-deployment-started', { deployments });
    
    res.json({
      success: true,
      message: 'Bulk deployment started',
      deployments
    });
  } catch (error) {
    logger.error('Error in bulk deployment:', error);
    res.status(500).json({ error: 'Failed to start bulk deployment' });
  }
});

module.exports = router;
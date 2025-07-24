/**
 * Agent Service - Business Logic for Agent Management
 * BMAD v4 + PRP Agent Orchestration
 */

const Agent = require('../models/Agent');
const logger = require('../utils/logger');
const axios = require('axios');

class AgentService {
  
  /**
   * Check if an agent is healthy and responsive
   */
  async checkAgentHealth(agentName) {
    try {
      const agent = await Agent.findOne({ name: agentName });
      if (!agent) return false;
      
      // Check if agent has been seen recently (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (agent.lastSeen < fiveMinutesAgo) {
        return false;
      }
      
      // If agent has a health check URL, ping it
      if (agent.configuration.healthCheckUrl) {
        try {
          const response = await axios.get(agent.configuration.healthCheckUrl, {
            timeout: 5000
          });
          return response.status === 200;
        } catch (error) {
          logger.warn(`Health check failed for ${agentName}:`, error.message);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error(`Error checking health for agent ${agentName}:`, error);
      return false;
    }
  }
  
  /**
   * Get agent performance metrics
   */
  async getAgentMetrics(agentName, timeRange = '1h') {
    try {
      const agent = await Agent.findOne({ name: agentName });
      if (!agent) throw new Error('Agent not found');
      
      // Calculate time range
      let startTime;
      switch (timeRange) {
        case '1h':
          startTime = new Date(Date.now() - 60 * 60 * 1000);
          break;
        case '6h':
          startTime = new Date(Date.now() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(Date.now() - 60 * 60 * 1000);
      }
      
      // Filter metrics by time range
      const metrics = agent.metrics.filter(metric => 
        metric.timestamp >= startTime
      );
      
      // Calculate aggregated metrics
      const aggregated = {
        averageCpuUsage: 0,
        averageMemoryUsage: 0,
        averageResponseTime: 0,
        totalThroughput: 0,
        averageErrorRate: 0,
        dataPoints: metrics.length
      };
      
      if (metrics.length > 0) {
        aggregated.averageCpuUsage = metrics.reduce((sum, m) => sum + (m.cpuUsage || 0), 0) / metrics.length;
        aggregated.averageMemoryUsage = metrics.reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / metrics.length;
        aggregated.averageResponseTime = metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0) / metrics.length;
        aggregated.totalThroughput = metrics.reduce((sum, m) => sum + (m.throughput || 0), 0);
        aggregated.averageErrorRate = metrics.reduce((sum, m) => sum + (m.errorRate || 0), 0) / metrics.length;
      }
      
      return {
        agent: agentName,
        timeRange,
        aggregated,
        rawMetrics: metrics
      };
    } catch (error) {
      logger.error(`Error getting metrics for agent ${agentName}:`, error);
      throw error;
    }
  }
  
  /**
   * Assign a task to an agent
   */
  async assignTask(agentName, taskData) {
    try {
      const agent = await Agent.findOne({ name: agentName });
      if (!agent) throw new Error('Agent not found');
      
      // Check if agent is available
      if (!['active', 'completed'].includes(agent.status)) {
        throw new Error(`Agent ${agentName} is not available (status: ${agent.status})`);
      }
      
      // Check dependencies
      if (taskData.dependencies && taskData.dependencies.length > 0) {
        for (const depTaskId of taskData.dependencies) {
          const depTask = agent.tasks.find(t => t.id === depTaskId);
          if (!depTask || depTask.status !== 'completed') {
            throw new Error(`Dependency task ${depTaskId} is not completed`);
          }
        }
      }
      
      // Add task to agent
      const task = agent.addTask(taskData);
      
      // Update agent status if it was idle
      if (agent.status === 'completed') {
        agent.status = 'working';
      }
      
      await agent.save();
      
      logger.info(`Task assigned to ${agentName}: ${task.title}`);
      
      return task;
    } catch (error) {
      logger.error(`Error assigning task to agent ${agentName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get task dependencies and execution order
   */
  async getTaskExecutionPlan(agentName) {
    try {
      const agent = await Agent.findOne({ name: agentName });
      if (!agent) throw new Error('Agent not found');
      
      const tasks = agent.tasks.filter(task => 
        ['pending', 'in-progress'].includes(task.status)
      );
      
      // Build dependency graph
      const taskMap = new Map();
      const dependencyGraph = new Map();
      
      tasks.forEach(task => {
        taskMap.set(task.id, task);
        dependencyGraph.set(task.id, task.dependencies || []);
      });
      
      // Topological sort for execution order
      const visited = new Set();
      const visiting = new Set();
      const executionOrder = [];
      
      const visit = (taskId) => {
        if (visited.has(taskId)) return;
        if (visiting.has(taskId)) {
          throw new Error(`Circular dependency detected involving task ${taskId}`);
        }
        
        visiting.add(taskId);
        
        const dependencies = dependencyGraph.get(taskId) || [];
        dependencies.forEach(depId => {
          if (taskMap.has(depId)) {
            visit(depId);
          }
        });
        
        visiting.delete(taskId);
        visited.add(taskId);
        executionOrder.push(taskId);
      };
      
      tasks.forEach(task => {
        if (!visited.has(task.id)) {
          visit(task.id);
        }
      });
      
      return {
        agent: agentName,
        executionOrder: executionOrder.map(id => taskMap.get(id)),
        totalTasks: tasks.length
      };
    } catch (error) {
      logger.error(`Error getting execution plan for agent ${agentName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get overall system status
   */
  async getSystemStatus() {
    try {
      const agents = await Agent.find();
      
      const status = {
        agents: {
          total: agents.length,
          active: 0,
          working: 0,
          completed: 0,
          blocked: 0,
          offline: 0,
          error: 0
        },
        tasks: {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          failed: 0,
          blocked: 0
        },
        performance: {
          averageCpuUsage: 0,
          averageMemoryUsage: 0,
          averageResponseTime: 0,
          totalThroughput: 0,
          errorRate: 0
        }
      };
      
      // Calculate status counts
      agents.forEach(agent => {
        status.agents[agent.status] = (status.agents[agent.status] || 0) + 1;
        
        // Count tasks
        agent.tasks.forEach(task => {
          status.tasks.total++;
          if (task.status === 'pending') status.tasks.pending++;
          else if (task.status === 'in-progress') status.tasks.inProgress++;
          else if (task.status === 'completed') status.tasks.completed++;
          else if (task.status === 'failed') status.tasks.failed++;
          else if (task.status === 'blocked') status.tasks.blocked++;
        });
        
        // Calculate performance metrics
        const latestMetrics = agent.latestMetrics;
        if (latestMetrics) {
          status.performance.averageCpuUsage += latestMetrics.cpuUsage || 0;
          status.performance.averageMemoryUsage += latestMetrics.memoryUsage || 0;
          status.performance.averageResponseTime += latestMetrics.responseTime || 0;
          status.performance.totalThroughput += latestMetrics.throughput || 0;
          status.performance.errorRate += latestMetrics.errorRate || 0;
        }
      });
      
      // Average the performance metrics
      if (agents.length > 0) {
        status.performance.averageCpuUsage /= agents.length;
        status.performance.averageMemoryUsage /= agents.length;
        status.performance.averageResponseTime /= agents.length;
        status.performance.errorRate /= agents.length;
      }
      
      return status;
    } catch (error) {
      logger.error('Error getting system status:', error);
      throw error;
    }
  }
  
  /**
   * Auto-scale agents based on workload
   */
  async autoScale() {
    try {
      const agents = await Agent.find();
      const recommendations = [];
      
      // Calculate average task load per agent type
      const agentTypes = {};
      
      agents.forEach(agent => {
        if (!agentTypes[agent.type]) {
          agentTypes[agent.type] = {
            agents: [],
            totalTasks: 0,
            pendingTasks: 0,
            averageLoad: 0
          };
        }
        
        agentTypes[agent.type].agents.push(agent);
        agentTypes[agent.type].totalTasks += agent.tasks.length;
        agentTypes[agent.type].pendingTasks += agent.tasks.filter(t => 
          ['pending', 'in-progress'].includes(t.status)
        ).length;
      });
      
      // Analyze each agent type
      Object.keys(agentTypes).forEach(type => {
        const typeData = agentTypes[type];
        const agentCount = typeData.agents.length;
        
        if (agentCount > 0) {
          typeData.averageLoad = typeData.pendingTasks / agentCount;
          
          // Recommend scaling if average load is high
          if (typeData.averageLoad > 5) {
            recommendations.push({
              type: 'scale-up',
              agentType: type,
              currentAgents: agentCount,
              recommendedAgents: Math.ceil(agentCount * 1.5),
              reason: `High task load: ${typeData.averageLoad.toFixed(1)} tasks per agent`
            });
          }
          
          // Recommend scaling down if load is very low
          if (typeData.averageLoad < 1 && agentCount > 1) {
            recommendations.push({
              type: 'scale-down',
              agentType: type,
              currentAgents: agentCount,
              recommendedAgents: Math.max(1, Math.floor(agentCount * 0.7)),
              reason: `Low task load: ${typeData.averageLoad.toFixed(1)} tasks per agent`
            });
          }
        }
      });
      
      return {
        timestamp: new Date(),
        agentTypes,
        recommendations
      };
    } catch (error) {
      logger.error('Error in auto-scaling analysis:', error);
      throw error;
    }
  }
}

module.exports = new AgentService();
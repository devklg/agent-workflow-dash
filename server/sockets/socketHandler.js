/**
 * WebSocket Handler - Real-time Communication
 * BMAD v4 + PRP Real-time Agent Communication System
 */

const logger = require('../utils/logger');
const Agent = require('../models/Agent');
const Message = require('../models/Message');

const socketHandler = (io) => {
  // Store connected agents and users
  const connectedAgents = new Map();
  const connectedUsers = new Map();
  
  io.on('connection', (socket) => {
    logger.info(`New socket connection: ${socket.id}`);
    
    // Handle user identification
    socket.on('identify', async (data) => {
      const { type, name, agentData } = data;
      
      if (type === 'agent') {
        // Agent connection
        connectedAgents.set(name, {
          socketId: socket.id,
          name,
          connectedAt: new Date(),
          ...agentData
        });
        
        // Join agent-specific room
        socket.join(name);
        socket.join('agents');
        
        // Update agent status in database
        try {
          const agent = await Agent.findOne({ name });
          if (agent) {
            agent.communication.isOnline = true;
            agent.lastSeen = new Date();
            await agent.save();
            
            // Notify Kevin of agent coming online
            socket.to('kevin').emit('agent-online', {
              agent: name,
              timestamp: new Date()
            });
          }
        } catch (error) {
          logger.error(`Error updating agent status for ${name}:`, error);
        }
        
        logger.info(`Agent connected: ${name} (${socket.id})`);
        
      } else if (type === 'user') {
        // User (Kevin) connection
        connectedUsers.set(name || 'kevin', {
          socketId: socket.id,
          name: name || 'kevin',
          connectedAt: new Date()
        });
        
        socket.join(name || 'kevin');
        socket.join('users');
        
        logger.info(`User connected: ${name || 'kevin'} (${socket.id})`);
        
        // Send current agent status to user
        socket.emit('agent-status-update', {
          connectedAgents: Array.from(connectedAgents.values()),
          timestamp: new Date()
        });
      }
      
      // Broadcast connection update
      io.emit('connection-update', {
        connectedAgents: connectedAgents.size,
        connectedUsers: connectedUsers.size,
        agents: Array.from(connectedAgents.keys()),
        users: Array.from(connectedUsers.keys())
      });
    });
    
    // Handle direct messages
    socket.on('send-message', async (data) => {
      try {
        const { to, message, messageType = 'chat', metadata = {} } = data;
        
        // Create message in database
        const messageDoc = new Message({
          sender: data.from || 'kevin',
          receiver: to,
          content: message,
          messageType,
          metadata,
          threadId: data.threadId || `${data.from || 'kevin'}-${to}-${Date.now()}`
        });
        
        await messageDoc.save();
        
        // Send to recipient
        if (to === 'all') {
          io.to('agents').emit('message-received', messageDoc);
        } else {
          io.to(to).emit('message-received', messageDoc);
        }
        
        // Confirm to sender
        socket.emit('message-sent', {
          messageId: messageDoc._id,
          timestamp: messageDoc.createdAt
        });
        
        logger.info(`Message sent from ${data.from || 'kevin'} to ${to}: ${messageType}`);
        
      } catch (error) {
        logger.error('Error handling socket message:', error);
        socket.emit('message-error', {
          error: 'Failed to send message'
        });
      }
    });
    
    // Handle agent commands
    socket.on('agent-command', async (data) => {
      try {
        const { agentName, command, commandData = {}, priority = 'medium' } = data;
        
        // Create command message
        const message = new Message({
          sender: 'kevin',
          receiver: agentName,
          messageType: 'command',
          content: `Command: ${command}`,
          metadata: {
            priority,
            requiresResponse: true,
            responseDeadline: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            commandData: { command, ...commandData }
          }
        });
        
        await message.save();
        
        // Send command to agent
        io.to(agentName).emit('command-received', {
          messageId: message._id,
          command,
          data: commandData,
          priority,
          timestamp: new Date()
        });
        
        // Confirm to sender
        socket.emit('command-sent', {
          agentName,
          command,
          messageId: message._id
        });
        
        logger.info(`Command sent to ${agentName}: ${command}`);
        
      } catch (error) {
        logger.error('Error handling agent command:', error);
        socket.emit('command-error', {
          error: 'Failed to send command'
        });
      }
    });
    
    // Handle agent status updates
    socket.on('agent-status-update', async (data) => {
      try {
        const { agentName, status, progress, currentTask, metrics } = data;
        
        // Update agent in database
        const agent = await Agent.findOne({ name: agentName });
        if (agent) {
          if (status) agent.status = status;
          if (progress) {
            agent.progress = { ...agent.progress, ...progress };
          }
          if (currentTask) agent.currentTask = currentTask;
          if (metrics) agent.addMetrics(metrics);
          
          agent.lastSeen = new Date();
          await agent.save();
          
          // Broadcast update to all users
          io.to('users').emit('agent-updated', {
            agent: agentName,
            status,
            progress,
            currentTask,
            metrics,
            timestamp: new Date()
          });
        }
        
      } catch (error) {
        logger.error('Error handling agent status update:', error);
      }
    });
    
    // Handle task updates
    socket.on('task-update', async (data) => {
      try {
        const { agentName, taskId, status, progress, output } = data;
        
        const agent = await Agent.findOne({ name: agentName });
        if (agent) {
          agent.updateTaskStatus(taskId, status, { progress, output });
          await agent.save();
          
          // Broadcast to users
          io.to('users').emit('task-updated', {
            agent: agentName,
            taskId,
            status,
            progress,
            output,
            timestamp: new Date()
          });
          
          logger.info(`Task updated for ${agentName}: ${taskId} -> ${status}`);
        }
        
      } catch (error) {
        logger.error('Error handling task update:', error);
      }
    });
    
    // Handle agent logs
    socket.on('agent-log', async (data) => {
      try {
        const { agentName, level, message, metadata = {} } = data;
        
        const agent = await Agent.findOne({ name: agentName });
        if (agent) {
          agent.addLog(level, message, metadata);
          await agent.save();
          
          // Broadcast to users if it's an important log
          if (['warn', 'error'].includes(level)) {
            io.to('users').emit('agent-log', {
              agent: agentName,
              level,
              message,
              metadata,
              timestamp: new Date()
            });
          }
        }
        
      } catch (error) {
        logger.error('Error handling agent log:', error);
      }
    });
    
    // Handle deployment updates
    socket.on('deployment-update', (data) => {
      const { agentName, deploymentId, status, step, output } = data;
      
      // Broadcast deployment progress
      io.emit('deployment-progress', {
        agent: agentName,
        deploymentId,
        status,
        step,
        output,
        timestamp: new Date()
      });
      
      logger.info(`Deployment update for ${agentName}: ${status}`);
    });
    
    // Handle GitHub webhook events
    socket.on('github-event', (data) => {
      const { repository, action, workflow, branch } = data;
      
      // Broadcast GitHub events
      io.emit('github-update', {
        repository,
        action,
        workflow,
        branch,
        timestamp: new Date()
      });
      
      logger.info(`GitHub event: ${action} in ${repository}`);
    });
    
    // Handle system metrics updates
    socket.on('system-metrics', (data) => {
      // Broadcast system metrics to dashboard
      io.to('users').emit('system-metrics-update', {
        ...data,
        timestamp: new Date()
      });
    });
    
    // Handle heartbeat/ping
    socket.on('ping', (callback) => {
      if (callback) callback('pong');
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      // Find and remove from connected lists
      let disconnectedAgent = null;
      let disconnectedUser = null;
      
      for (const [name, info] of connectedAgents.entries()) {
        if (info.socketId === socket.id) {
          disconnectedAgent = name;
          connectedAgents.delete(name);
          break;
        }
      }
      
      for (const [name, info] of connectedUsers.entries()) {
        if (info.socketId === socket.id) {
          disconnectedUser = name;
          connectedUsers.delete(name);
          break;
        }
      }
      
      // Update agent status if it was an agent
      if (disconnectedAgent) {
        try {
          const agent = await Agent.findOne({ name: disconnectedAgent });
          if (agent) {
            agent.communication.isOnline = false;
            await agent.save();
            
            // Notify users of agent going offline
            io.to('users').emit('agent-offline', {
              agent: disconnectedAgent,
              timestamp: new Date()
            });
          }
        } catch (error) {
          logger.error(`Error updating agent status for ${disconnectedAgent}:`, error);
        }
        
        logger.info(`Agent disconnected: ${disconnectedAgent}`);
      }
      
      if (disconnectedUser) {
        logger.info(`User disconnected: ${disconnectedUser}`);
      }
      
      // Broadcast connection update
      io.emit('connection-update', {
        connectedAgents: connectedAgents.size,
        connectedUsers: connectedUsers.size,
        agents: Array.from(connectedAgents.keys()),
        users: Array.from(connectedUsers.keys())
      });
    });
    
    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });
  
  // Periodic cleanup and status updates
  setInterval(async () => {
    try {
      // Check for stale agent connections
      const staleThreshold = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();
      
      for (const [name, info] of connectedAgents.entries()) {
        if (now - info.connectedAt.getTime() > staleThreshold) {
          // Remove stale connection
          connectedAgents.delete(name);
          
          // Update agent status
          const agent = await Agent.findOne({ name });
          if (agent) {
            agent.communication.isOnline = false;
            await agent.save();
          }
        }
      }
      
      // Broadcast periodic status update
      io.emit('system-status', {
        connectedAgents: connectedAgents.size,
        connectedUsers: connectedUsers.size,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('Error in periodic cleanup:', error);
    }
  }, 60000); // Every minute
  
  logger.info('📡 WebSocket handler initialized - ready for real-time communication');
};

module.exports = socketHandler;
/**
 * Message Routes - Agent Communication System
 * Real-time messaging between Kevin and Agents
 */

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Agent = require('../models/Agent');
const logger = require('../utils/logger');
const { validateMessage } = require('../middleware/validation');

// GET /api/messages - Get messages with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      sender, 
      receiver, 
      messageType, 
      status, 
      limit = 50, 
      page = 1,
      unreadOnly = false
    } = req.query;
    
    const filter = { isArchived: false };
    
    if (sender) filter.sender = sender;
    if (receiver) filter.receiver = { $in: [receiver, 'all'] };
    if (messageType) filter.messageType = messageType;
    if (status) filter.status = status;
    if (unreadOnly === 'true') {
      filter.status = { $in: ['sent', 'delivered'] };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('parentMessageId', 'content sender createdAt');
    
    const totalCount = await Message.countDocuments(filter);
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/conversation/:participant - Get conversation with participant
router.get('/conversation/:participant', async (req, res) => {
  try {
    const { participant } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = await Message.getConversation('kevin', participant, parseInt(limit));
    
    res.json({ success: true, data: messages });
  } catch (error) {
    logger.error(`Error fetching conversation with ${req.params.participant}:`, error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// GET /api/messages/unread/:receiver - Get unread messages for receiver
router.get('/unread/:receiver', async (req, res) => {
  try {
    const { receiver } = req.params;
    
    const messages = await Message.getUnreadMessages(receiver);
    
    res.json({ success: true, data: messages, count: messages.length });
  } catch (error) {
    logger.error(`Error fetching unread messages for ${req.params.receiver}:`, error);
    res.status(500).json({ error: 'Failed to fetch unread messages' });
  }
});

// POST /api/messages - Send new message
router.post('/', validateMessage, async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      // Default sender to 'kevin' if not specified
      sender: req.body.sender || 'kevin'
    };
    
    // Generate thread ID if not provided
    if (!messageData.threadId) {
      messageData.threadId = `${messageData.sender}-${messageData.receiver}-${Date.now()}`;
    }
    
    const message = new Message(messageData);
    await message.save();
    
    logger.info(`Message sent from ${message.sender} to ${message.receiver}: ${message.messageType}`);
    
    // Update agent message count if receiver is an agent
    if (message.receiver !== 'kevin' && message.receiver !== 'all') {
      const agent = await Agent.findOne({ name: message.receiver });
      if (agent) {
        agent.communication.messageCount += 1;
        agent.communication.lastMessageAt = new Date();
        await agent.save();
      }
    }
    
    // Emit to WebSocket for real-time delivery
    const io = req.app.get('io');
    
    if (message.receiver === 'all') {
      // Broadcast to all connected agents
      io.emit('message-broadcast', message);
    } else {
      // Send to specific recipient
      io.to(message.receiver).emit('message-received', message);
      // Also send to sender for confirmation
      io.to(message.sender).emit('message-sent', message);
    }
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PUT /api/messages/:id/read - Mark message as read
router.put('/:id/read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.markAsRead();
    await message.save();
    
    // Emit to WebSocket
    req.app.get('io').to(message.sender).emit('message-read', {
      messageId: message._id,
      readAt: message.readAt
    });
    
    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    logger.error(`Error marking message as read:`, error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// PUT /api/messages/:id/process - Mark message as processed with response
router.put('/:id/process', async (req, res) => {
  try {
    const { responseContent } = req.body;
    
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.markAsProcessed({ content: responseContent });
    await message.save();
    
    // If this was a command, create a response message
    if (message.messageType === 'command' && responseContent) {
      const responseMessage = new Message({
        sender: message.receiver,
        receiver: message.sender,
        messageType: 'notification',
        content: responseContent,
        threadId: message.threadId,
        parentMessageId: message._id
      });
      await responseMessage.save();
      
      // Emit response to WebSocket
      req.app.get('io').to(message.sender).emit('command-response', responseMessage);
    }
    
    // Emit to WebSocket
    req.app.get('io').to(message.sender).emit('message-processed', {
      messageId: message._id,
      processedAt: message.processedAt,
      response: message.response
    });
    
    res.json({ success: true, message: 'Message processed' });
  } catch (error) {
    logger.error(`Error processing message:`, error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// DELETE /api/messages/:id - Delete message (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    message.isArchived = true;
    await message.save();
    
    logger.info(`Message archived: ${message._id}`);
    
    res.json({ success: true, message: 'Message archived' });
  } catch (error) {
    logger.error(`Error archiving message:`, error);
    res.status(500).json({ error: 'Failed to archive message' });
  }
});

// POST /api/messages/command - Send command to agent
router.post('/command', async (req, res) => {
  try {
    const { agent, command, data = {}, priority = 'medium' } = req.body;
    
    if (!agent || !command) {
      return res.status(400).json({ error: 'Agent and command are required' });
    }
    
    // Check if agent exists
    const targetAgent = await Agent.findOne({ name: agent });
    if (!targetAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const message = new Message({
      sender: 'kevin',
      receiver: agent,
      messageType: 'command',
      content: `Command: ${command}`,
      metadata: {
        priority,
        requiresResponse: true,
        responseDeadline: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        commandData: { command, data }
      },
      threadId: `command-${agent}-${Date.now()}`
    });
    
    await message.save();
    
    logger.info(`Command sent to ${agent}: ${command}`);
    
    // Emit to WebSocket
    req.app.get('io').to(agent).emit('command-received', {
      command,
      data,
      messageId: message._id,
      priority
    });
    
    res.status(201).json({
      success: true,
      message: 'Command sent',
      messageId: message._id
    });
  } catch (error) {
    logger.error('Error sending command:', error);
    res.status(500).json({ error: 'Failed to send command' });
  }
});

// GET /api/messages/stats - Get messaging statistics
router.get('/stats', async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments({ isArchived: false });
    const unreadMessages = await Message.countDocuments({ 
      status: { $in: ['sent', 'delivered'] },
      isArchived: false 
    });
    const commandMessages = await Message.countDocuments({ 
      messageType: 'command',
      isArchived: false 
    });
    
    // Get message counts by agent
    const messagesByAgent = await Message.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$receiver',
          count: { $sum: 1 },
          lastMessage: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get hourly message distribution for last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hourlyDistribution = await Message.aggregate([
      { $match: { createdAt: { $gte: last24Hours }, isArchived: false } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalMessages,
        unread: unreadMessages,
        commands: commandMessages,
        byAgent: messagesByAgent,
        hourlyDistribution
      }
    });
  } catch (error) {
    logger.error('Error fetching message statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
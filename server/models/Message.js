/**
 * Message Model - Agent Communication System
 * Real-time messaging between Kevin and Agents
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    // Can be 'kevin' or agent name
  },
  receiver: {
    type: String,
    required: true,
    // Can be 'kevin', 'all', or specific agent name
  },
  messageType: {
    type: String,
    enum: ['chat', 'command', 'notification', 'task-assignment', 'status-update', 'error', 'warning'],
    default: 'chat'
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    taskId: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    requiresResponse: {
      type: Boolean,
      default: false
    },
    responseDeadline: Date,
    attachments: [{
      type: String,
      url: String,
      size: Number
    }],
    commandData: mongoose.Schema.Types.Mixed,
    statusData: mongoose.Schema.Types.Mixed
  },
  threadId: String, // For grouping related messages
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'processed', 'failed'],
    default: 'sent'
  },
  readAt: Date,
  processedAt: Date,
  response: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    content: String,
    processedAt: Date
  },
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ threadId: 1, createdAt: 1 });
messageSchema.index({ messageType: 1, status: 1 });
messageSchema.index({ 'metadata.priority': 1, createdAt: -1 });

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
};

// Method to mark as processed
messageSchema.methods.markAsProcessed = function(responseData = {}) {
  this.status = 'processed';
  this.processedAt = new Date();
  if (responseData.content) {
    this.response.content = responseData.content;
    this.response.processedAt = new Date();
  }
};

// Static method to get conversation
messageSchema.statics.getConversation = function(participant1, participant2, limit = 50) {
  return this.find({
    $or: [
      { sender: participant1, receiver: participant2 },
      { sender: participant2, receiver: participant1 }
    ],
    isArchived: false
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('parentMessageId', 'content sender createdAt');
};

// Static method to get unread messages
messageSchema.statics.getUnreadMessages = function(receiver) {
  return this.find({
    receiver: { $in: [receiver, 'all'] },
    status: { $in: ['sent', 'delivered'] },
    isArchived: false
  })
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Message', messageSchema);
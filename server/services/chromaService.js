/**
 * ChromaDB Service
 * Stores hook events, agent communication, and context
 */

const { ChromaClient } = require('chromadb');
const { logger } = require('../utils/logger');

class ChromaService {
  constructor() {
    this.client = null;
    this.collections = {};
    this.connect();
  }

  /**
   * Connect to ChromaDB
   */
  async connect() {
    try {
      const host = process.env.CHROMA_HOST || 'localhost';
      const port = parseInt(process.env.CHROMA_PORT) || 3710;

      this.client = new ChromaClient({
        path: `http://${host}:${port}`
      });

      // Initialize collections
      await this.initializeCollections();
      
      logger.info('Connected to ChromaDB successfully');
    } catch (error) {
      logger.error('Failed to connect to ChromaDB:', error);
      // Don't throw - ChromaDB is optional
    }
  }

  /**
   * Initialize required collections
   */
  async initializeCollections() {
    try {
      // Hook events collection
      this.collections.hookEvents = await this.client.getOrCreateCollection({
        name: 'hook_events',
        metadata: { description: 'Claude Code hook events' }
      });

      // Session summaries collection
      this.collections.sessions = await this.client.getOrCreateCollection({
        name: 'agent_sessions',
        metadata: { description: 'Agent session summaries' }
      });

      // Agent prompts collection
      this.collections.prompts = await this.client.getOrCreateCollection({
        name: 'agent_prompts',
        metadata: { description: 'User prompts to agents' }
      });

      logger.info('ChromaDB collections initialized');
    } catch (error) {
      logger.error('Failed to initialize ChromaDB collections:', error);
    }
  }

  /**
   * Store hook event
   */
  async storeHookEvent(event) {
    try {
      if (!this.collections.hookEvents) {
        logger.warn('Hook events collection not initialized');
        return;
      }

      const id = `${event.agentId}-${event.sessionId}-${Date.now()}`;
      const document = JSON.stringify(event.data || event);
      
      await this.collections.hookEvents.add({
        ids: [id],
        documents: [document],
        metadatas: [{
          agentId: event.agentId,
          sessionId: event.sessionId,
          type: event.type,
          timestamp: event.timestamp
        }]
      });

      logger.debug(`Stored hook event: ${event.type} for ${event.agentId}`);
    } catch (error) {
      logger.error('Failed to store hook event:', error);
    }
  }

  /**
   * Store session summary
   */
  async storeSessionSummary(summary) {
    try {
      if (!this.collections.sessions) {
        logger.warn('Sessions collection not initialized');
        return;
      }

      const id = `${summary.agentId}-${summary.sessionId}`;
      const document = `Session for ${summary.agentId}: ${summary.summary}. Completed ${summary.tasksCompleted} tasks in ${summary.totalExecutionTimeMs}ms. Reason: ${summary.reason}`;
      
      await this.collections.sessions.add({
        ids: [id],
        documents: [document],
        metadatas: [{
          agentId: summary.agentId,
          sessionId: summary.sessionId,
          reason: summary.reason,
          tasksCompleted: summary.tasksCompleted,
          timestamp: summary.timestamp
        }]
      });

      logger.debug(`Stored session summary for ${summary.agentId}`);
    } catch (error) {
      logger.error('Failed to store session summary:', error);
    }
  }

  /**
   * Store user prompt
   */
  async storePrompt(prompt) {
    try {
      if (!this.collections.prompts) {
        logger.warn('Prompts collection not initialized');
        return;
      }

      const id = `${prompt.agentId}-${prompt.sessionId}-${Date.now()}`;
      
      await this.collections.prompts.add({
        ids: [id],
        documents: [prompt.prompt],
        metadatas: [{
          agentId: prompt.agentId,
          sessionId: prompt.sessionId,
          timestamp: prompt.timestamp
        }]
      });

      logger.debug(`Stored prompt for ${prompt.agentId}`);
    } catch (error) {
      logger.error('Failed to store prompt:', error);
    }
  }

  /**
   * Query agent history
   */
  async queryAgentHistory(agentId, limit = 10) {
    try {
      if (!this.collections.hookEvents) {
        return [];
      }

      const results = await this.collections.hookEvents.query({
        queryTexts: [agentId],
        nResults: limit,
        where: { agentId }
      });

      return results;
    } catch (error) {
      logger.error('Failed to query agent history:', error);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.client) {
        return { connected: false, error: 'Client not initialized' };
      }

      await this.client.heartbeat();
      return { 
        connected: true,
        collections: Object.keys(this.collections)
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

module.exports = new ChromaService();

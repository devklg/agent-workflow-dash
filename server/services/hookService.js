/**
 * Hook Service
 * Processes webhook events from Claude Code agents
 * Updates dashboard state and emits WebSocket events
 */

const { logger } = require('../utils/logger');
const neo4jService = require('./neo4jService');
const chromaService = require('./chromaService');

class HookService {
  constructor() {
    this.io = null; // Will be set by index.js
    this.activeToolCalls = new Map(); // Track ongoing tool calls
  }

  /**
   * Set Socket.IO instance for real-time updates
   */
  setSocketIO(io) {
    this.io = io;
    logger.info('HookService connected to Socket.IO');
  }

  /**
   * Handle PreToolUse hook
   * Fired before agent executes a tool
   */
  async handlePreToolUse(hookData) {
    try {
      const { agentId, agentName, sessionId, toolName, toolParams, timestamp } = hookData;

      // Track tool call start time
      const callKey = `${sessionId}-${toolName}-${Date.now()}`;
      this.activeToolCalls.set(callKey, {
        startTime: Date.now(),
        hookData
      });

      // Update agent status in Neo4j
      await neo4jService.updateAgentActivity(agentId, {
        status: 'executing',
        currentTool: toolName,
        lastActivity: timestamp
      });

      // Store event in ChromaDB for context
      await chromaService.storeHookEvent({
        type: 'pre_tool_use',
        agentId,
        sessionId,
        toolName,
        timestamp,
        data: hookData
      });

      // Emit real-time update to dashboard
      if (this.io) {
        this.io.emit('agent:tool:start', {
          agentId,
          agentName,
          sessionId,
          toolName,
          toolParams,
          timestamp
        });
      }

      logger.info(`Agent ${agentName} starting tool: ${toolName}`);
    } catch (error) {
      logger.error('Error handling PreToolUse:', error);
      throw error;
    }
  }

  /**
   * Handle PostToolUse hook
   * Fired after agent completes tool execution
   */
  async handlePostToolUse(hookData) {
    try {
      const { 
        agentId, 
        agentName, 
        sessionId, 
        toolName, 
        result, 
        executionTimeMs, 
        timestamp 
      } = hookData;

      // Update agent status in Neo4j
      await neo4jService.updateAgentActivity(agentId, {
        status: 'active',
        lastTool: toolName,
        lastToolSuccess: result.success,
        lastActivity: timestamp
      });

      // Store event in ChromaDB
      await chromaService.storeHookEvent({
        type: 'post_tool_use',
        agentId,
        sessionId,
        toolName,
        success: result.success,
        executionTime: executionTimeMs,
        timestamp,
        data: hookData
      });

      // Check for errors and create alerts if needed
      if (!result.success && result.error) {
        await this.handleToolError(agentId, agentName, toolName, result.error);
      }

      // Emit real-time update to dashboard
      if (this.io) {
        this.io.emit('agent:tool:complete', {
          agentId,
          agentName,
          sessionId,
          toolName,
          success: result.success,
          executionTimeMs,
          error: result.error,
          timestamp
        });
      }

      logger.info(`Agent ${agentName} completed tool: ${toolName} (${executionTimeMs}ms)`);
    } catch (error) {
      logger.error('Error handling PostToolUse:', error);
      throw error;
    }
  }

  /**
   * Handle SessionEnd hook
   * Fired when agent session completes
   */
  async handleSessionEnd(hookData) {
    try {
      const { 
        agentId, 
        agentName, 
        sessionId, 
        reason, 
        summary,
        tasksCompleted, 
        totalExecutionTimeMs, 
        timestamp 
      } = hookData;

      // Update agent status in Neo4j
      await neo4jService.updateAgentActivity(agentId, {
        status: 'idle',
        lastSession: sessionId,
        lastSessionEnd: timestamp,
        lastSessionReason: reason
      });

      // Store session summary in ChromaDB
      await chromaService.storeSessionSummary({
        agentId,
        sessionId,
        reason,
        summary,
        tasksCompleted,
        totalExecutionTimeMs,
        timestamp
      });

      // Update task completion if tasks were completed
      if (tasksCompleted > 0) {
        await neo4jService.incrementAgentTaskCount(agentId, tasksCompleted);
      }

      // Emit real-time update to dashboard
      if (this.io) {
        this.io.emit('agent:session:end', {
          agentId,
          agentName,
          sessionId,
          reason,
          summary,
          tasksCompleted,
          totalExecutionTimeMs,
          timestamp
        });
      }

      logger.info(`Agent ${agentName} session ended: ${reason} (${tasksCompleted} tasks, ${totalExecutionTimeMs}ms)`);
    } catch (error) {
      logger.error('Error handling SessionEnd:', error);
      throw error;
    }
  }

  /**
   * Handle UserPromptSubmit hook
   * Fired when user sends a prompt to agent
   */
  async handleUserPromptSubmit(hookData) {
    try {
      const { agentId, agentName, sessionId, prompt, timestamp } = hookData;

      // Store prompt in ChromaDB for context
      await chromaService.storePrompt({
        agentId,
        sessionId,
        prompt,
        timestamp
      });

      // Emit real-time update to dashboard
      if (this.io) {
        this.io.emit('agent:prompt:received', {
          agentId,
          agentName,
          sessionId,
          promptPreview: prompt.substring(0, 100) + '...',
          timestamp
        });
      }

      logger.info(`Agent ${agentName} received user prompt`);
    } catch (error) {
      logger.error('Error handling UserPromptSubmit:', error);
      throw error;
    }
  }

  /**
   * Handle tool execution errors
   * Creates alerts and notifications
   */
  async handleToolError(agentId, agentName, toolName, error) {
    try {
      logger.error(`Tool error for agent ${agentName}:`, { toolName, error });

      // Emit alert to dashboard
      if (this.io) {
        this.io.emit('agent:alert', {
          agentId,
          agentName,
          severity: 'error',
          message: `Tool ${toolName} failed: ${error}`,
          timestamp: new Date().toISOString()
        });
      }

      // Check alert rules (from CLAUDE-CODE-HOOK-CONFIGS.md)
      await this.checkAlertRules(agentId, agentName, toolName, error);
    } catch (err) {
      logger.error('Error handling tool error:', err);
    }
  }

  /**
   * Check and execute alert rules
   * Based on CLAUDE-CODE-HOOK-CONFIGS.md alert configuration
   */
  async checkAlertRules(agentId, agentName, toolName, error) {
    // TODO: Implement specific alert rules from configuration
    // Examples:
    // - Security-critical errors from Marcus Thompson
    // - Deployment failures from Alex Martinez
    // - Database migration errors from Sarah Chen
    // - Test failures from Kevin Brown
    
    logger.info('Checking alert rules', { agentId, toolName });
  }

  /**
   * Get current hook statistics
   */
  getStats() {
    return {
      activeToolCalls: this.activeToolCalls.size,
      totalProcessed: 0 // TODO: Track this
    };
  }
}

module.exports = new HookService();

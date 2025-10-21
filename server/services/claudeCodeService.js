/**
 * Claude Code Service
 * Manages Claude Code agent spawning, lifecycle, and configuration
 */

const { ClaudeCodeSDK } = require('@anthropic-ai/claude-code-sdk');
const { logger } = require('../utils/logger');
const neo4jService = require('./neo4jService');

class ClaudeCodeService {
  constructor() {
    this.sdk = null;
    this.activeSessions = new Map();
    this.initializeSDK();
  }

  /**
   * Initialize Claude Code SDK
   */
  initializeSDK() {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        logger.error('ANTHROPIC_API_KEY not configured');
        return;
      }

      this.sdk = new ClaudeCodeSDK({
        apiKey,
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'
      });

      logger.info('Claude Code SDK initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Claude Code SDK:', error);
      throw error;
    }
  }

  /**
   * Spawn a Claude Code agent
   * Reads agent identity from Neo4j and creates session with hooks configured
   * 
   * @param {string} agentId - Agent identifier (e.g., 'agent-alex-martinez')
   * @returns {Promise<Object>} Session information
   */
  async spawnAgent(agentId) {
    try {
      if (!this.sdk) {
        throw new Error('Claude Code SDK not initialized');
      }

      // Get agent identity from Neo4j
      const agentIdentity = await neo4jService.getAgentIdentity(agentId);
      
      if (!agentIdentity) {
        throw new Error(`Agent identity not found: ${agentId}`);
      }

      const { name, role, branch, callsign } = agentIdentity;

      // Get agent's assigned tasks
      const tasks = await neo4jService.getAgentTasks(agentId);

      // Configure hooks
      const hookBaseURL = process.env.HOOK_BASE_URL || 'http://localhost:3551/api/hooks';
      const webhookSecret = process.env.DASHBOARD_WEBHOOK_SECRET;

      const hooks = {
        preToolUse: `${hookBaseURL}/pre-tool-use`,
        postToolUse: `${hookBaseURL}/post-tool-use`,
        sessionEnd: `${hookBaseURL}/session-end`,
        userPromptSubmit: `${hookBaseURL}/user-prompt-submit`,
        headers: {
          'Authorization': `Bearer ${webhookSecret}`,
          'Content-Type': 'application/json'
        }
      };

      // Build agent context from Neo4j
      const context = await this.buildAgentContext(agentId);

      // Create Claude Code session
      const session = await this.sdk.createSession({
        repository: process.env.GITHUB_REPO || 'devklg/telnyx-mern-app',
        branch: branch,
        hooks: hooks,
        identity: {
          agentId,
          agentName: name,
          callsign,
          role
        },
        initialPrompt: this.buildInitialPrompt(agentIdentity, tasks, context),
        timeout: parseInt(process.env.AGENT_TIMEOUT_MS) || 300000
      });

      // Track active session
      this.activeSessions.set(agentId, {
        sessionId: session.id,
        agentName: name,
        startTime: Date.now(),
        status: 'active'
      });

      // Update agent status in Neo4j
      await neo4jService.updateAgentActivity(agentId, {
        status: 'active',
        sessionId: session.id,
        sessionStartTime: new Date().toISOString()
      });

      logger.info(`Spawned agent: ${name} (${callsign}) on branch ${branch}`);

      return {
        agentId,
        sessionId: session.id,
        agentName: name,
        callsign,
        branch,
        status: 'active'
      };
    } catch (error) {
      logger.error(`Failed to spawn agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Build initial prompt for agent
   * Includes identity, tasks, and context from Neo4j
   */
  buildInitialPrompt(agentIdentity, tasks, context) {
    const { name, role, callsign, specialty } = agentIdentity;

    return `# Agent Boot Sequence - ${name} (${callsign})

## Your Identity
- **Name:** ${name}
- **Role:** ${role}
- **Callsign:** ${callsign}
- **Specialty:** ${specialty}

## Your Mission
You are an autonomous AI development agent working on the BMAD V4 Lead Qualification project.
You have ${tasks.length} tasks assigned to you.

## Current Context
${context}

## Your Tasks
${this.formatTasks(tasks)}

## Instructions
1. Query Neo4j to understand your full task graph and dependencies
2. Select the first READY task (all dependencies satisfied)
3. Execute the task autonomously
4. Create a PR when complete
5. Update Neo4j task status
6. Notify dependent agents via webhooks
7. Move to next ready task

## Neo4j Connection
Use the neo4j:run-cypher tool to query your task graph.

**Begin autonomous execution now.**
`;
  }

  /**
   * Build agent context from Neo4j
   */
  async buildAgentContext(agentId) {
    try {
      const context = await neo4jService.getAgentContext(agentId);
      return JSON.stringify(context, null, 2);
    } catch (error) {
      logger.error('Error building agent context:', error);
      return '{}';
    }
  }

  /**
   * Format tasks for agent prompt
   */
  formatTasks(tasks) {
    if (!tasks || tasks.length === 0) {
      return 'No tasks currently assigned.';
    }

    return tasks.map((task, index) => `
### Task ${index + 1}: ${task.title}
- **ID:** ${task.id}
- **Status:** ${task.status}
- **Priority:** ${task.priority}
- **Dependencies:** ${task.dependencies.join(', ') || 'None'}
- **Description:** ${task.description}
`).join('\n');
  }

  /**
   * Stop an agent session
   */
  async stopAgent(agentId, reason = 'manual_stop') {
    try {
      const session = this.activeSessions.get(agentId);
      
      if (!session) {
        throw new Error(`No active session for agent: ${agentId}`);
      }

      // Stop the session
      await this.sdk.stopSession(session.sessionId, reason);

      // Remove from active sessions
      this.activeSessions.delete(agentId);

      // Update Neo4j
      await neo4jService.updateAgentActivity(agentId, {
        status: 'stopped',
        sessionEndTime: new Date().toISOString(),
        stopReason: reason
      });

      logger.info(`Stopped agent: ${session.agentName} (reason: ${reason})`);

      return { success: true, reason };
    } catch (error) {
      logger.error(`Failed to stop agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active agent sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([agentId, session]) => ({
      agentId,
      ...session,
      uptime: Date.now() - session.startTime
    }));
  }

  /**
   * Health check for Claude Code service
   */
  async healthCheck() {
    return {
      sdkInitialized: !!this.sdk,
      activeSessions: this.activeSessions.size,
      apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
    };
  }
}

module.exports = new ClaudeCodeService();

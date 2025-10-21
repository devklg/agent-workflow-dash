/**
 * Claude Code Hook Endpoints
 * Receives webhook events from Claude Code agents
 * 
 * Hook Types:
 * - PreToolUse: Before Claude executes any tool
 * - PostToolUse: After tool execution completes
 * - SessionEnd: When Claude Code session ends
 * - UserPromptSubmit: When user submits a prompt to agent
 */

const express = require('express');
const router = express.Router();
const { authenticateWebhook } = require('../middleware/webhookAuth');
const hookService = require('../services/hookService');
const { logger } = require('../utils/logger');

// Apply webhook authentication to all hook endpoints
router.use(authenticateWebhook);

/**
 * POST /api/hooks/pre-tool-use
 * Fired BEFORE Claude executes any tool
 * 
 * Payload:
 * {
 *   agentId: string,
 *   agentName: string,
 *   callsign: string,
 *   eventType: "PreToolUse",
 *   sessionId: string,
 *   toolName: string,
 *   toolParams: object,
 *   timestamp: string,
 *   branch: string
 * }
 */
router.post('/pre-tool-use', async (req, res) => {
  try {
    const hookData = req.body;
    
    logger.info(`PreToolUse hook received from ${hookData.agentName}`, {
      sessionId: hookData.sessionId,
      toolName: hookData.toolName
    });

    // Process hook asynchronously
    hookService.handlePreToolUse(hookData).catch(err => {
      logger.error('Error processing PreToolUse hook:', err);
    });

    // Respond immediately
    res.status(200).json({ 
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('PreToolUse endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/hooks/post-tool-use
 * Fired AFTER tool execution completes
 * 
 * Payload:
 * {
 *   agentId: string,
 *   agentName: string,
 *   callsign: string,
 *   eventType: "PostToolUse",
 *   sessionId: string,
 *   toolName: string,
 *   result: {
 *     success: boolean,
 *     output: string,
 *     error?: string
 *   },
 *   executionTimeMs: number,
 *   timestamp: string,
 *   branch: string
 * }
 */
router.post('/post-tool-use', async (req, res) => {
  try {
    const hookData = req.body;
    
    logger.info(`PostToolUse hook received from ${hookData.agentName}`, {
      sessionId: hookData.sessionId,
      toolName: hookData.toolName,
      success: hookData.result?.success,
      executionTime: hookData.executionTimeMs
    });

    // Process hook asynchronously
    hookService.handlePostToolUse(hookData).catch(err => {
      logger.error('Error processing PostToolUse hook:', err);
    });

    res.status(200).json({ 
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('PostToolUse endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/hooks/session-end
 * Fired when Claude Code session ends
 * 
 * Payload:
 * {
 *   agentId: string,
 *   agentName: string,
 *   callsign: string,
 *   eventType: "SessionEnd",
 *   sessionId: string,
 *   reason: "task_complete" | "error" | "timeout" | "manual_stop",
 *   summary: string,
 *   tasksCompleted: number,
 *   totalExecutionTimeMs: number,
 *   timestamp: string
 * }
 */
router.post('/session-end', async (req, res) => {
  try {
    const hookData = req.body;
    
    logger.info(`SessionEnd hook received from ${hookData.agentName}`, {
      sessionId: hookData.sessionId,
      reason: hookData.reason,
      tasksCompleted: hookData.tasksCompleted,
      totalExecutionTime: hookData.totalExecutionTimeMs
    });

    // Process hook asynchronously
    hookService.handleSessionEnd(hookData).catch(err => {
      logger.error('Error processing SessionEnd hook:', err);
    });

    res.status(200).json({ 
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('SessionEnd endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/hooks/user-prompt-submit
 * Fired when user submits a prompt to the agent
 * 
 * Payload:
 * {
 *   agentId: string,
 *   agentName: string,
 *   sessionId: string,
 *   prompt: string,
 *   timestamp: string
 * }
 */
router.post('/user-prompt-submit', async (req, res) => {
  try {
    const hookData = req.body;
    
    logger.info(`UserPromptSubmit hook received from ${hookData.agentName}`, {
      sessionId: hookData.sessionId,
      promptLength: hookData.prompt?.length
    });

    // Process hook asynchronously
    hookService.handleUserPromptSubmit(hookData).catch(err => {
      logger.error('Error processing UserPromptSubmit hook:', err);
    });

    res.status(200).json({ 
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('UserPromptSubmit endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/hooks/health
 * Health check endpoint for hook system
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    endpoints: [
      '/api/hooks/pre-tool-use',
      '/api/hooks/post-tool-use',
      '/api/hooks/session-end',
      '/api/hooks/user-prompt-submit'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

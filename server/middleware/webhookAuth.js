/**
 * Webhook Authentication Middleware
 * Verifies that webhook requests come from trusted Claude Code agents
 */

const { logger } = require('../utils/logger');

/**
 * Authenticate webhook requests using Bearer token
 * 
 * Expected header: Authorization: Bearer <DASHBOARD_WEBHOOK_SECRET>
 */
const authenticateWebhook = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Webhook request without authorization header', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer') {
      logger.warn('Invalid authorization type', { type, ip: req.ip });
      return res.status(401).json({ error: 'Invalid authorization type' });
    }

    const expectedSecret = process.env.DASHBOARD_WEBHOOK_SECRET;
    
    if (!expectedSecret) {
      logger.error('DASHBOARD_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (token !== expectedSecret) {
      logger.warn('Invalid webhook secret', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Authentication successful
    next();
  } catch (error) {
    logger.error('Webhook authentication error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = { authenticateWebhook };

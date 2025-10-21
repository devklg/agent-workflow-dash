/**
 * Neo4j Service
 * Manages connections to Neo4j graph database
 * Queries agent identities, tasks, and dependencies
 */

const neo4j = require('neo4j-driver');
const { logger } = require('../utils/logger');

class Neo4jService {
  constructor() {
    this.driver = null;
    this.connect();
  }

  /**
   * Connect to Neo4j
   */
  async connect() {
    try {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const user = process.env.NEO4J_USER || 'neo4j';
      const password = process.env.NEO4J_PASSWORD;

      if (!password) {
        logger.error('NEO4J_PASSWORD not configured');
        return;
      }

      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      
      // Test connection
      const session = this.driver.session();
      await session.run('RETURN 1');
      await session.close();
      
      logger.info('Connected to Neo4j successfully');
    } catch (error) {
      logger.error('Failed to connect to Neo4j:', error);
      throw error;
    }
  }

  /**
   * Get agent identity card from Neo4j
   */
  async getAgentIdentity(agentId) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Agent {id: $agentId})-[:HAS_IDENTITY_CARD]->(ic:AgentIdentityCard)
         RETURN a, ic`,
        { agentId }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const agent = record.get('a').properties;
      const identityCard = record.get('ic').properties;

      return {
        id: agentId,
        name: agent.name || identityCard.agent_name,
        role: agent.role || identityCard.role,
        branch: agent.branch || agent.github_branch,
        callsign: identityCard.callsign,
        specialty: identityCard.specialty || agent.specialty,
        motto: identityCard.motto,
        personality: identityCard.personality,
        competencies: identityCard.core_competencies
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get agent's assigned tasks
   */
  async getAgentTasks(agentId) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Agent {id: $agentId})-[:HAS_TASK]->(t:Task)
         OPTIONAL MATCH (t)-[:DEPENDS_ON]->(dep:Task)
         RETURN t, collect(dep.id) as dependencies
         ORDER BY t.priority DESC, t.created ASC`,
        { agentId }
      );

      return result.records.map(record => {
        const task = record.get('t').properties;
        const dependencies = record.get('dependencies').filter(d => d);
        
        return {
          id: task.id,
          title: task.title || task.name,
          description: task.description,
          status: task.status || 'PENDING',
          priority: task.priority || 'MEDIUM',
          dependencies: dependencies,
          estimatedHours: task.estimated_hours
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Get agent context (collaborators, dependencies, etc.)
   */
  async getAgentContext(agentId) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Agent {id: $agentId})
         OPTIONAL MATCH (a)-[:COLLABORATES_WITH]->(collab:Agent)
         OPTIONAL MATCH (a)-[:DEPENDS_ON]->(dep:Agent)
         RETURN a, 
                collect(DISTINCT collab.name) as collaborators,
                collect(DISTINCT dep.name) as dependencies`,
        { agentId }
      );

      if (result.records.length === 0) {
        return {};
      }

      const record = result.records[0];
      return {
        collaborators: record.get('collaborators').filter(c => c),
        dependencies: record.get('dependencies').filter(d => d)
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Update agent activity
   */
  async updateAgentActivity(agentId, updates) {
    const session = this.driver.session();
    try {
      const setClause = Object.keys(updates)
        .map(key => `a.${key} = $${key}`)
        .join(', ');

      await session.run(
        `MATCH (a:Agent {id: $agentId})
         SET ${setClause}
         RETURN a`,
        { agentId, ...updates }
      );

      logger.debug(`Updated agent ${agentId} activity:`, updates);
    } finally {
      await session.close();
    }
  }

  /**
   * Increment agent task completion count
   */
  async incrementAgentTaskCount(agentId, count = 1) {
    const session = this.driver.session();
    try {
      await session.run(
        `MATCH (a:Agent {id: $agentId})
         SET a.completed_tasks = coalesce(a.completed_tasks, 0) + $count
         RETURN a`,
        { agentId, count }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Get all agents
   */
  async getAllAgents() {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Agent)
         OPTIONAL MATCH (a)-[:HAS_IDENTITY_CARD]->(ic:AgentIdentityCard)
         RETURN a, ic
         ORDER BY a.name`
      );

      return result.records.map(record => {
        const agent = record.get('a').properties;
        const ic = record.get('ic')?.properties;
        
        return {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          status: agent.status || 'idle',
          callsign: ic?.callsign,
          branch: agent.branch || agent.github_branch
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.driver) {
      return { connected: false, error: 'Driver not initialized' };
    }

    const session = this.driver.session();
    try {
      await session.run('RETURN 1');
      return { connected: true };
    } catch (error) {
      return { connected: false, error: error.message };
    } finally {
      await session.close();
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.driver) {
      await this.driver.close();
      logger.info('Neo4j connection closed');
    }
  }
}

module.exports = new Neo4jService();

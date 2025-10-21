/**
 * Neo4j Database Connection
 * BMAD V4 Lead Qualification - Agent & Task Management
 */

const neo4j = require('neo4j-driver');
const logger = require('../utils/logger');

let driver = null;
let session = null;

const connectNeo4j = async () => {
  try {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'neo4j';

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    });

    // Verify connectivity
    await driver.verifyConnectivity();
    logger.info(`🔷 Neo4j Connected: ${uri}`);

    return driver;
  } catch (error) {
    logger.error('Neo4j connection failed:', error);
    throw error;
  }
};

const getSession = () => {
  if (!driver) {
    throw new Error('Neo4j driver not initialized. Call connectNeo4j() first.');
  }
  return driver.session();
};

const closeConnection = async () => {
  if (driver) {
    await driver.close();
    logger.info('🔷 Neo4j connection closed');
  }
};

// Query helpers
const runQuery = async (query, params = {}) => {
  const session = getSession();
  try {
    const result = await session.run(query, params);
    return result.records.map(record => record.toObject());
  } catch (error) {
    logger.error('Neo4j query error:', error);
    throw error;
  } finally {
    await session.close();
  }
};

module.exports = {
  connectNeo4j,
  getSession,
  closeConnection,
  runQuery,
  driver: () => driver
};

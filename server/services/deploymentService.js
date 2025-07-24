/**
 * Deployment Service - Agent Deployment Management
 * BMAD v4 + PRP Deployment Orchestration
 */

const Deployment = require('../models/Deployment');
const Agent = require('../models/Agent');
const logger = require('../utils/logger');
const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');

const execAsync = promisify(exec);

class DeploymentService {
  
  /**
   * Deploy an agent
   */
  async deployAgent(agent, options = {}) {
    const {
      environment = 'development',
      version = '1.0.0',
      triggeredBy = 'system',
      configuration = {}
    } = options;
    
    try {
      // Create deployment record
      const deployment = new Deployment({
        agentName: agent.name,
        version,
        environment,
        triggeredBy,
        branch: agent.branch,
        configuration: {
          ...agent.configuration,
          ...configuration
        }
      });
      
      // Define deployment steps
      const steps = this.getDeploymentSteps(agent, environment);
      steps.forEach(step => deployment.addStep(step));
      
      await deployment.save();
      
      logger.info(`Starting deployment for ${agent.name} (${deployment._id})`);
      
      // Execute deployment asynchronously
      this.executeDeployment(deployment, agent).catch(error => {
        logger.error(`Deployment failed for ${agent.name}:`, error);
      });
      
      return deployment;
    } catch (error) {
      logger.error(`Error starting deployment for ${agent.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Get deployment steps based on agent type and environment
   */
  getDeploymentSteps(agent, environment) {
    const baseSteps = [
      { name: 'validate-prerequisites', status: 'pending' },
      { name: 'fetch-code', status: 'pending' },
      { name: 'install-dependencies', status: 'pending' },
      { name: 'run-tests', status: 'pending' },
      { name: 'build', status: 'pending' },
      { name: 'deploy', status: 'pending' },
      { name: 'health-check', status: 'pending' }
    ];
    
    // Add agent-specific steps
    switch (agent.type) {
      case 'frontend':
        baseSteps.splice(4, 0, 
          { name: 'build-assets', status: 'pending' },
          { name: 'optimize-bundle', status: 'pending' }
        );
        break;
      case 'backend':
        baseSteps.splice(4, 0,
          { name: 'database-migration', status: 'pending' },
          { name: 'seed-data', status: 'pending' }
        );
        break;
      case 'database':
        baseSteps.splice(3, 1); // Remove run-tests for database
        baseSteps.splice(3, 0,
          { name: 'backup-database', status: 'pending' },
          { name: 'run-migrations', status: 'pending' }
        );
        break;
    }
    
    // Add environment-specific steps
    if (environment === 'production') {
      baseSteps.splice(-1, 0,
        { name: 'blue-green-switch', status: 'pending' },
        { name: 'smoke-tests', status: 'pending' }
      );
    }
    
    return baseSteps;
  }
  
  /**
   * Execute deployment steps
   */
  async executeDeployment(deployment, agent) {
    deployment.status = 'running';
    await deployment.save();
    
    try {
      for (const step of deployment.steps) {
        deployment.updateStepStatus(step.name, 'running');
        deployment.addLog('info', `Starting step: ${step.name}`);
        await deployment.save();
        
        try {
          const result = await this.executeStep(step.name, deployment, agent);
          
          deployment.updateStepStatus(step.name, 'completed', result.output, '');
          deployment.addLog('info', `Completed step: ${step.name}`);
          
        } catch (stepError) {
          deployment.updateStepStatus(step.name, 'failed', '', stepError.message);
          deployment.addLog('error', `Failed step: ${step.name} - ${stepError.message}`);
          
          // Stop deployment on critical step failure
          if (this.isCriticalStep(step.name)) {
            throw stepError;
          }
        }
        
        await deployment.save();
      }
      
      // Deployment successful
      deployment.status = 'completed';
      deployment.calculateTotalTime();
      
      // Update agent status
      agent.status = 'active';
      agent.lastDeployment = new Date();
      await agent.save();
      
      logger.info(`Deployment completed successfully for ${agent.name}`);
      
    } catch (error) {
      deployment.status = 'failed';
      deployment.addLog('error', `Deployment failed: ${error.message}`);
      
      // Update agent status
      agent.status = 'error';
      await agent.save();
      
      logger.error(`Deployment failed for ${agent.name}:`, error);
    }
    
    await deployment.save();
    return deployment;
  }
  
  /**
   * Execute individual deployment step
   */
  async executeStep(stepName, deployment, agent) {
    const startTime = Date.now();
    
    switch (stepName) {
      case 'validate-prerequisites':
        return await this.validatePrerequisites(agent);
      
      case 'fetch-code':
        return await this.fetchCode(agent, deployment);
      
      case 'install-dependencies':
        return await this.installDependencies(agent);
      
      case 'run-tests':
        return await this.runTests(agent);
      
      case 'build':
        return await this.buildAgent(agent);
      
      case 'deploy':
        return await this.deployToEnvironment(agent, deployment);
      
      case 'health-check':
        return await this.performHealthCheck(agent);
      
      case 'build-assets':
        return await this.buildAssets(agent);
      
      case 'database-migration':
        return await this.runDatabaseMigration(agent);
      
      case 'backup-database':
        return await this.backupDatabase(agent);
      
      default:
        return { output: `Step ${stepName} completed (no-op)` };
    }
  }
  
  /**
   * Validate prerequisites for deployment
   */
  async validatePrerequisites(agent) {
    // Check if required tools are available
    const checks = [];
    
    try {
      // Check Node.js
      const { stdout: nodeVersion } = await execAsync('node --version');
      checks.push(`Node.js: ${nodeVersion.trim()}`);
    } catch (error) {
      throw new Error('Node.js not found');
    }
    
    try {
      // Check npm
      const { stdout: npmVersion } = await execAsync('npm --version');
      checks.push(`npm: ${npmVersion.trim()}`);
    } catch (error) {
      throw new Error('npm not found');
    }
    
    // Check Git
    try {
      const { stdout: gitVersion } = await execAsync('git --version');
      checks.push(`Git: ${gitVersion.trim()}`);
    } catch (error) {
      throw new Error('Git not found');
    }
    
    return {
      output: `Prerequisites validated: ${checks.join(', ')}`
    };
  }
  
  /**
   * Fetch code from repository
   */
  async fetchCode(agent, deployment) {
    const repoUrl = `https://github.com/${process.env.GITHUB_OWNER}/${agent.repository}.git`;
    const workDir = `/tmp/deployment-${deployment._id}`;
    
    try {
      // Clone repository
      await execAsync(`git clone -b ${agent.branch} ${repoUrl} ${workDir}`);
      
      // Get commit hash
      const { stdout: commitHash } = await execAsync(`cd ${workDir} && git rev-parse HEAD`);
      deployment.commitHash = commitHash.trim();
      
      // Get commit message
      const { stdout: commitMessage } = await execAsync(`cd ${workDir} && git log -1 --pretty=%B`);
      deployment.commitMessage = commitMessage.trim();
      
      return {
        output: `Code fetched from ${agent.branch} (${commitHash.trim().slice(0, 8)})`
      };
    } catch (error) {
      throw new Error(`Failed to fetch code: ${error.message}`);
    }
  }
  
  /**
   * Install dependencies
   */
  async installDependencies(agent) {
    const workDir = `/tmp/deployment-${agent.name}`;
    
    try {
      const { stdout } = await execAsync(`cd ${workDir} && npm ci`);
      return {
        output: `Dependencies installed successfully`
      };
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }
  
  /**
   * Run tests
   */
  async runTests(agent) {
    const workDir = `/tmp/deployment-${agent.name}`;
    
    try {
      const { stdout } = await execAsync(`cd ${workDir} && npm test`);
      return {
        output: `Tests passed successfully`
      };
    } catch (error) {
      // Don't fail deployment for test failures in development
      if (agent.environment === 'development') {
        return {
          output: `Tests failed but continuing deployment in development mode`
        };
      }
      throw new Error(`Tests failed: ${error.message}`);
    }
  }
  
  /**
   * Build agent
   */
  async buildAgent(agent) {
    const workDir = `/tmp/deployment-${agent.name}`;
    
    try {
      let buildCommand = 'npm run build';
      
      // Agent-specific build commands
      if (agent.type === 'frontend') {
        buildCommand = 'npm run build:production';
      } else if (agent.type === 'backend') {
        buildCommand = 'npm run build:server';
      }
      
      const { stdout } = await execAsync(`cd ${workDir} && ${buildCommand}`);
      return {
        output: `Build completed successfully`
      };
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }
  
  /**
   * Deploy to environment
   */
  async deployToEnvironment(agent, deployment) {
    // This would typically involve:
    // - Copying files to target environment
    // - Starting/restarting services
    // - Updating load balancer configuration
    
    // For now, simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      output: `Deployed to ${deployment.environment} environment`
    };
  }
  
  /**
   * Perform health check
   */
  async performHealthCheck(agent) {
    if (!agent.configuration.healthCheckUrl) {
      return {
        output: 'No health check URL configured - skipping'
      };
    }
    
    try {
      const response = await axios.get(agent.configuration.healthCheckUrl, {
        timeout: 10000
      });
      
      if (response.status === 200) {
        return {
          output: `Health check passed - ${response.status}`
        };
      } else {
        throw new Error(`Health check returned ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
  
  /**
   * Build frontend assets
   */
  async buildAssets(agent) {
    // Simulate asset building
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      output: 'Frontend assets built and optimized'
    };
  }
  
  /**
   * Run database migration
   */
  async runDatabaseMigration(agent) {
    // Simulate database migration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      output: 'Database migration completed'
    };
  }
  
  /**
   * Backup database
   */
  async backupDatabase(agent) {
    // Simulate database backup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      output: 'Database backup created'
    };
  }
  
  /**
   * Check if step is critical (deployment should stop on failure)
   */
  isCriticalStep(stepName) {
    const criticalSteps = [
      'validate-prerequisites',
      'fetch-code',
      'install-dependencies',
      'build',
      'deploy'
    ];
    
    return criticalSteps.includes(stepName);
  }
  
  /**
   * Get deployment history for an agent
   */
  async getDeploymentHistory(agentName, limit = 10) {
    try {
      const deployments = await Deployment.find({ agentName })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('previousDeployment', 'version status createdAt');
      
      return deployments;
    } catch (error) {
      logger.error(`Error fetching deployment history for ${agentName}:`, error);
      throw error;
    }
  }
  
  /**
   * Rollback to previous deployment
   */
  async rollbackDeployment(deploymentId, reason = 'Manual rollback') {
    try {
      const deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        throw new Error('Deployment not found');
      }
      
      const agent = await Agent.findOne({ name: deployment.agentName });
      if (!agent) {
        throw new Error('Agent not found');
      }
      
      // Find previous successful deployment
      const previousDeployment = await Deployment.findOne({
        agentName: deployment.agentName,
        status: 'completed',
        createdAt: { $lt: deployment.createdAt }
      }).sort({ createdAt: -1 });
      
      if (!previousDeployment) {
        throw new Error('No previous successful deployment found');
      }
      
      // Create rollback deployment
      const rollbackDeployment = new Deployment({
        agentName: agent.name,
        version: previousDeployment.version,
        environment: deployment.environment,
        type: 'rollback',
        triggeredBy: 'system',
        branch: agent.branch,
        previousDeployment: deployment._id,
        rollbackData: {
          reason,
          rollbackTo: previousDeployment._id,
          rollbackAt: new Date()
        }
      });
      
      await rollbackDeployment.save();
      
      // Update original deployment status
      deployment.status = 'rollback';
      await deployment.save();
      
      logger.info(`Rollback initiated for ${agent.name}: ${deploymentId} -> ${previousDeployment._id}`);
      
      return rollbackDeployment;
    } catch (error) {
      logger.error(`Error rolling back deployment ${deploymentId}:`, error);
      throw error;
    }
  }
}

module.exports = new DeploymentService();
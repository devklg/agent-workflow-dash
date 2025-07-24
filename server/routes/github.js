/**
 * GitHub Integration Routes
 * GitHub Actions Monitoring & Repository Management
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');
const Agent = require('../models/Agent');

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'devklg';

// Helper function to make GitHub API requests
const githubRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${GITHUB_API_BASE}${endpoint}`,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Agent-Workflow-Dashboard'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    logger.error(`GitHub API error for ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// GET /api/github/repos - List repositories
router.get('/repos', async (req, res) => {
  try {
    const { type = 'owner', sort = 'updated', per_page = 10 } = req.query;
    
    const repos = await githubRequest(`/user/repos?type=${type}&sort=${sort}&per_page=${per_page}`);
    
    const repoData = repos.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at
    }));
    
    res.json({ success: true, data: repoData });
  } catch (error) {
    logger.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// GET /api/github/repos/:repo/branches - List repository branches
router.get('/repos/:repo/branches', async (req, res) => {
  try {
    const { repo } = req.params;
    
    const branches = await githubRequest(`/repos/${GITHUB_OWNER}/${repo}/branches`);
    
    const branchData = branches.map(branch => ({
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected,
      commitMessage: branch.commit.commit?.message,
      commitDate: branch.commit.commit?.author?.date,
      commitAuthor: branch.commit.commit?.author?.name
    }));
    
    res.json({ success: true, data: branchData });
  } catch (error) {
    logger.error(`Error fetching branches for ${req.params.repo}:`, error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// GET /api/github/repos/:repo/actions - List GitHub Actions workflows
router.get('/repos/:repo/actions', async (req, res) => {
  try {
    const { repo } = req.params;
    
    const workflows = await githubRequest(`/repos/${GITHUB_OWNER}/${repo}/actions/workflows`);
    
    const workflowData = workflows.workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      path: workflow.path,
      state: workflow.state,
      url: workflow.html_url,
      badgeUrl: workflow.badge_url,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at
    }));
    
    res.json({ success: true, data: workflowData });
  } catch (error) {
    logger.error(`Error fetching workflows for ${req.params.repo}:`, error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// GET /api/github/repos/:repo/actions/runs - List workflow runs
router.get('/repos/:repo/actions/runs', async (req, res) => {
  try {
    const { repo } = req.params;
    const { status, branch, per_page = 10 } = req.query;
    
    let endpoint = `/repos/${GITHUB_OWNER}/${repo}/actions/runs?per_page=${per_page}`;
    if (status) endpoint += `&status=${status}`;
    if (branch) endpoint += `&branch=${branch}`;
    
    const runs = await githubRequest(endpoint);
    
    const runData = runs.workflow_runs.map(run => ({
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      sha: run.head_sha,
      url: run.html_url,
      workflowId: run.workflow_id,
      runNumber: run.run_number,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      runStartedAt: run.run_started_at,
      actor: {
        login: run.actor.login,
        avatarUrl: run.actor.avatar_url
      },
      triggeringActor: run.triggering_actor ? {
        login: run.triggering_actor.login,
        avatarUrl: run.triggering_actor.avatar_url
      } : null
    }));
    
    res.json({ success: true, data: runData });
  } catch (error) {
    logger.error(`Error fetching workflow runs for ${req.params.repo}:`, error);
    res.status(500).json({ error: 'Failed to fetch workflow runs' });
  }
});

// GET /api/github/repos/:repo/actions/runs/:runId - Get specific workflow run
router.get('/repos/:repo/actions/runs/:runId', async (req, res) => {
  try {
    const { repo, runId } = req.params;
    
    const run = await githubRequest(`/repos/${GITHUB_OWNER}/${repo}/actions/runs/${runId}`);
    
    // Get jobs for this run
    const jobs = await githubRequest(`/repos/${GITHUB_OWNER}/${repo}/actions/runs/${runId}/jobs`);
    
    const runData = {
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      sha: run.head_sha,
      url: run.html_url,
      workflowId: run.workflow_id,
      runNumber: run.run_number,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      runStartedAt: run.run_started_at,
      jobs: jobs.jobs.map(job => ({
        id: job.id,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        url: job.html_url,
        steps: job.steps?.map(step => ({
          name: step.name,
          status: step.status,
          conclusion: step.conclusion,
          number: step.number,
          startedAt: step.started_at,
          completedAt: step.completed_at
        }))
      }))
    };
    
    res.json({ success: true, data: runData });
  } catch (error) {
    logger.error(`Error fetching workflow run ${req.params.runId}:`, error);
    res.status(500).json({ error: 'Failed to fetch workflow run' });
  }
});

// POST /api/github/repos/:repo/actions/:workflowId/dispatches - Trigger workflow
router.post('/repos/:repo/actions/:workflowId/dispatches', async (req, res) => {
  try {
    const { repo, workflowId } = req.params;
    const { ref = 'main', inputs = {} } = req.body;
    
    await githubRequest(
      `/repos/${GITHUB_OWNER}/${repo}/actions/workflows/${workflowId}/dispatches`,
      'POST',
      { ref, inputs }
    );
    
    logger.info(`Workflow triggered: ${repo}/${workflowId} on ${ref}`);
    
    // Emit to WebSocket
    req.app.get('io').emit('workflow-triggered', {
      repo,
      workflowId,
      ref,
      inputs
    });
    
    res.json({ success: true, message: 'Workflow triggered successfully' });
  } catch (error) {
    logger.error(`Error triggering workflow ${req.params.workflowId}:`, error);
    res.status(500).json({ error: 'Failed to trigger workflow' });
  }
});

// GET /api/github/repos/:repo/commits - List recent commits
router.get('/repos/:repo/commits', async (req, res) => {
  try {
    const { repo } = req.params;
    const { sha, since, until, per_page = 10 } = req.query;
    
    let endpoint = `/repos/${GITHUB_OWNER}/${repo}/commits?per_page=${per_page}`;
    if (sha) endpoint += `&sha=${sha}`;
    if (since) endpoint += `&since=${since}`;
    if (until) endpoint += `&until=${until}`;
    
    const commits = await githubRequest(endpoint);
    
    const commitData = commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date
      },
      committer: {
        name: commit.commit.committer.name,
        email: commit.commit.committer.email,
        date: commit.commit.committer.date
      },
      url: commit.html_url,
      stats: commit.stats,
      files: commit.files?.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes
      }))
    }));
    
    res.json({ success: true, data: commitData });
  } catch (error) {
    logger.error(`Error fetching commits for ${req.params.repo}:`, error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

// GET /api/github/agent-sync - Sync agent status with GitHub branches
router.get('/agent-sync', async (req, res) => {
  try {
    const { repo = 'agent-workflow-dash' } = req.query;
    
    // Get all agents from database
    const agents = await Agent.find();
    
    // Get branches from GitHub
    const branches = await githubRequest(`/repos/${GITHUB_OWNER}/${repo}/branches`);
    
    const syncResults = [];
    
    for (const agent of agents) {
      const branch = branches.find(b => b.name === agent.branch);
      
      if (branch) {
        // Check if branch has recent commits
        const commits = await githubRequest(
          `/repos/${GITHUB_OWNER}/${repo}/commits?sha=${branch.name}&per_page=1`
        );
        
        const lastCommit = commits[0];
        const lastCommitDate = new Date(lastCommit.commit.author.date);
        const isRecentlyActive = (Date.now() - lastCommitDate.getTime()) < (24 * 60 * 60 * 1000); // 24 hours
        
        // Update agent status based on GitHub activity
        if (isRecentlyActive && agent.status === 'offline') {
          agent.status = 'active';
          await agent.save();
        }
        
        syncResults.push({
          agent: agent.name,
          branch: agent.branch,
          lastCommit: {
            sha: lastCommit.sha,
            message: lastCommit.commit.message,
            date: lastCommitDate
          },
          isActive: isRecentlyActive,
          updated: isRecentlyActive && agent.status === 'active'
        });
      } else {
        syncResults.push({
          agent: agent.name,
          branch: agent.branch,
          error: 'Branch not found',
          isActive: false
        });
      }
    }
    
    logger.info(`GitHub sync completed for ${agents.length} agents`);
    
    // Emit to WebSocket
    req.app.get('io').emit('github-sync-completed', {
      repository: repo,
      results: syncResults
    });
    
    res.json({ success: true, data: syncResults });
  } catch (error) {
    logger.error('Error syncing with GitHub:', error);
    res.status(500).json({ error: 'Failed to sync with GitHub' });
  }
});

// GET /api/github/stats - Get GitHub statistics
router.get('/stats', async (req, res) => {
  try {
    const { repo = 'agent-workflow-dash' } = req.query;
    
    // Get repository info
    const repoInfo = await githubRequest(`/repos/${GITHUB_OWNER}/${repo}`);
    
    // Get recent workflow runs
    const workflowRuns = await githubRequest(
      `/repos/${GITHUB_OWNER}/${repo}/actions/runs?per_page=10`
    );
    
    // Get recent commits
    const commits = await githubRequest(
      `/repos/${GITHUB_OWNER}/${repo}/commits?per_page=10`
    );
    
    // Calculate statistics
    const runningActions = workflowRuns.workflow_runs.filter(run => 
      run.status === 'in_progress' || run.status === 'queued'
    ).length;
    
    const failedActions = workflowRuns.workflow_runs.filter(run => 
      run.conclusion === 'failure'
    ).length;
    
    const successfulActions = workflowRuns.workflow_runs.filter(run => 
      run.conclusion === 'success'
    ).length;
    
    const commitsToday = commits.filter(commit => {
      const commitDate = new Date(commit.commit.author.date);
      const today = new Date();
      return commitDate.toDateString() === today.toDateString();
    }).length;
    
    const stats = {
      repository: {
        name: repoInfo.name,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        openIssues: repoInfo.open_issues_count,
        size: repoInfo.size,
        language: repoInfo.language,
        lastPush: repoInfo.pushed_at
      },
      actions: {
        total: workflowRuns.total_count,
        running: runningActions,
        failed: failedActions,
        successful: successfulActions,
        recentRuns: workflowRuns.workflow_runs.slice(0, 5)
      },
      commits: {
        total: commits.length,
        today: commitsToday,
        recent: commits.slice(0, 5)
      }
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching GitHub statistics:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub statistics' });
  }
});

module.exports = router;
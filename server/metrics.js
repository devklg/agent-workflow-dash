/**
 * Prometheus Metrics for Grafana Integration
 * Tracks agent activity, task progress, and system performance
 */

const prometheus = require('prom-client');

// Create a Registry
const register = new prometheus.Registry();

// Add default metrics (CPU, memory, etc.)
prometheus.collectDefaultMetrics({ register, prefix: 'seo_dashboard_' });

// HTTP Request metrics
const httpRequestDuration = new prometheus.Histogram({
    name: 'seo_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    registers: [register]
});

const httpRequestsTotal = new prometheus.Counter({
    name: 'seo_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register]
});

// Agent metrics
const activeAgents = new prometheus.Gauge({
    name: 'seo_active_agents',
    help: 'Number of currently active agents',
    labelNames: ['team', 'status'],
    registers: [register]
});

const agentStatusChanges = new prometheus.Counter({
    name: 'seo_agent_status_changes_total',
    help: 'Total number of agent status changes',
    labelNames: ['agent', 'status'],
    registers: [register]
});

// Task metrics
const tasksTotal = new prometheus.Gauge({
    name: 'seo_tasks_total',
    help: 'Total number of tasks',
    labelNames: ['status'],
    registers: [register]
});

const tasksCompleted = new prometheus.Counter({
    name: 'seo_tasks_completed_total',
    help: 'Number of completed tasks',
    labelNames: ['agent', 'team'],
    registers: [register]
});

const taskDuration = new prometheus.Histogram({
    name: 'seo_task_duration_seconds',
    help: 'Task completion duration in seconds',
    labelNames: ['task_type', 'team'],
    buckets: [60, 300, 600, 1800, 3600, 7200, 14400],
    registers: [register]
});

// Project metrics
const projectProgress = new prometheus.Gauge({
    name: 'seo_project_progress_percentage',
    help: 'Project completion percentage',
    labelNames: ['project'],
    registers: [register]
});

// ChromaDB metrics
const chromadbQueries = new prometheus.Counter({
    name: 'seo_chromadb_queries_total',
    help: 'Number of ChromaDB queries',
    labelNames: ['collection'],
    registers: [register]
});

const chromadbQueryDuration = new prometheus.Histogram({
    name: 'seo_chromadb_query_duration_seconds',
    help: 'ChromaDB query duration',
    labelNames: ['collection', 'operation'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register]
});

// GitHub metrics
const githubCommits = new prometheus.Counter({
    name: 'seo_github_commits_total',
    help: 'Number of GitHub commits',
    labelNames: ['branch', 'agent'],
    registers: [register]
});

const githubPullRequests = new prometheus.Gauge({
    name: 'seo_github_pull_requests',
    help: 'Number of open pull requests',
    labelNames: ['status', 'team'],
    registers: [register]
});

const githubApiCalls = new prometheus.Counter({
    name: 'seo_github_api_calls_total',
    help: 'Number of GitHub API calls',
    registers: [register]
});

// WebSocket metrics
const websocketConnections = new prometheus.Gauge({
    name: 'seo_websocket_connections',
    help: 'Current number of WebSocket connections',
    registers: [register]
});

const websocketMessages = new prometheus.Counter({
    name: 'seo_websocket_messages_total',
    help: 'Total WebSocket messages',
    labelNames: ['direction', 'type'],
    registers: [register]
});

// API metrics
const apiCallsTotal = new prometheus.Counter({
    name: 'seo_api_calls_total',
    help: 'Total API calls by endpoint',
    labelNames: ['endpoint', 'method'],
    registers: [register]
});

// System metrics
const systemInfo = new prometheus.Gauge({
    name: 'seo_system_info',
    help: 'System information',
    labelNames: ['node_version', 'platform', 'port'],
    registers: [register]
});

const errorsTotal = new prometheus.Counter({
    name: 'seo_errors_total',
    help: 'Total number of errors',
    labelNames: ['error_type'],
    registers: [register]
});

// Database metrics
const databaseConnections = new prometheus.Gauge({
    name: 'seo_database_connections',
    help: 'Number of database connections',
    labelNames: ['database', 'status'],
    registers: [register]
});

const databaseQueries = new prometheus.Counter({
    name: 'seo_database_queries_total',
    help: 'Total database queries',
    labelNames: ['database', 'operation'],
    registers: [register]
});

// Initialize metrics with current values
const initializeMetrics = () => {
    console.log('🎯 Initializing Prometheus metrics for Grafana...');
    
    // Set agent counts per team
    activeAgents.set({ team: 'atlas', status: 'active' }, 10);
    activeAgents.set({ team: 'aurora', status: 'active' }, 10);
    activeAgents.set({ team: 'phoenix', status: 'active' }, 10);
    activeAgents.set({ team: 'sentinel', status: 'active' }, 3);
    activeAgents.set({ team: 'all', status: 'total' }, 33);
    
    // Set task counts
    tasksTotal.set({ status: 'total' }, 147);
    tasksTotal.set({ status: 'pending' }, 147);
    tasksTotal.set({ status: 'in_progress' }, 0);
    tasksTotal.set({ status: 'completed' }, 0);
    
    // Set initial project progress
    projectProgress.set({ project: 'seo-learning-platform' }, 0);
    
    // Set GitHub PR counts
    githubPullRequests.set({ status: 'open', team: 'all' }, 0);
    githubPullRequests.set({ status: 'merged', team: 'all' }, 0);
    
    // Set database connections
    databaseConnections.set({ database: 'mongodb', status: 'active' }, 1);
    databaseConnections.set({ database: 'redis', status: 'active' }, 1);
    databaseConnections.set({ database: 'chromadb', status: 'active' }, 1);
    
    console.log('✅ Metrics initialized successfully');
};

// Update metrics based on agent activity
const updateAgentMetrics = (agentId, action) => {
    const team = agentId.split('-')[0];
    
    switch(action) {
        case 'task_completed':
            tasksCompleted.inc({ agent: agentId, team: team });
            const pending = tasksTotal.labels({ status: 'pending' });
            const completed = tasksTotal.labels({ status: 'completed' });
            // Update task counts
            break;
            
        case 'chromadb_query':
            chromadbQueries.inc({ collection: `${team}_workspace` });
            break;
            
        case 'github_commit':
            githubCommits.inc({ branch: agentId, agent: agentId });
            break;
            
        case 'status_change':
            agentStatusChanges.inc({ agent: agentId, status: 'active' });
            break;
            
        default:
            break;
    }
};

// Track ChromaDB operation
const trackChromaOperation = async (collection, operation, executeFunc) => {
    const end = chromadbQueryDuration.startTimer({ collection, operation });
    try {
        const result = await executeFunc();
        chromadbQueries.inc({ collection });
        return result;
    } finally {
        end();
    }
};

// Track task execution
const trackTaskExecution = (taskType, team, duration) => {
    taskDuration.observe({ task_type: taskType, team }, duration);
};

module.exports = {
    register,
    // Metrics
    httpRequestDuration,
    httpRequestsTotal,
    activeAgents,
    agentStatusChanges,
    tasksTotal,
    tasksCompleted,
    taskDuration,
    projectProgress,
    chromadbQueries,
    chromadbQueryDuration,
    githubCommits,
    githubPullRequests,
    githubApiCalls,
    websocketConnections,
    websocketMessages,
    apiCallsTotal,
    systemInfo,
    errorsTotal,
    databaseConnections,
    databaseQueries,
    // Functions
    initializeMetrics,
    updateAgentMetrics,
    trackChromaOperation,
    trackTaskExecution
};
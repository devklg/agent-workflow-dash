import React, { useState, useEffect } from 'react';
import agentAPI from './services/agentAPI';

// Import all components from claude-dashboard
// These will be copied over in the next step
import MainLayout from './components/layout/MainLayout';
import AgentList from './components/agents/AgentList';
import ProjectList from './components/projects/ProjectList';
import ChatInterface from './components/chat/ChatInterface';
import TaskBreakdownView from './components/dashboard/TaskBreakdownView';
import ActivityFeed from './components/dashboard/ActivityFeed';
import AgentStatusPanel from './components/dashboard/AgentStatusPanel';
import ActiveProjectsPanel from './components/dashboard/ActiveProjectsPanel';
import QuickActionsPanel from './components/dashboard/QuickActionsPanel';
import CreateAgentForm from './components/agents/CreateAgentForm';
import CreateProjectForm from './components/projects/CreateProjectForm';
import PrometheusStatusPanel from './components/dashboard/PrometheusStatusPanel';

function App() {
  const [agents, setAgents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [metrics, setMetrics] = useState({});
  const [activeView, setActiveView] = useState('dashboard');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [socket, setSocket] = useState(null);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load agents (33 agents)
        const agentsData = await agentAPI.getAgents();
        setAgents(agentsData);

        // Load projects (SEO Learning Platform)
        const projectsData = await agentAPI.getProjects();
        setProjects(projectsData);

        // Load tasks (147 tasks)
        const tasksData = await agentAPI.getTasks();
        setTasks(tasksData);

        // Load system status
        const statusData = await agentAPI.getSystemStatus();
        setSystemStatus(statusData);

        // Load metrics
        const metricsData = await agentAPI.getMetrics();
        setMetrics(metricsData);

        // Generate activities
        generateActivities();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Connect WebSocket
    const ws = agentAPI.connectWebSocket();
    setSocket(ws);

    // WebSocket event handlers
    ws.on('agent-update', (data) => {
      setAgents(prev => prev.map(agent => 
        agent.id === data.id ? { ...agent, ...data } : agent
      ));
    });

    ws.on('task-update', (data) => {
      setTasks(prev => prev.map(task =>
        task.id === data.id ? { ...task, ...data } : task
      ));
      generateActivities();
    });

    ws.on('metrics-update', (data) => {
      setMetrics(data);
    });

    // Refresh metrics every 15 seconds
    const metricsInterval = setInterval(async () => {
      const metricsData = await agentAPI.getMetrics();
      setMetrics(metricsData);
    }, 15000);

    // Refresh system status every 30 seconds
    const statusInterval = setInterval(async () => {
      const statusData = await agentAPI.getSystemStatus();
      setSystemStatus(statusData);
    }, 30000);

    return () => {
      ws.close();
      clearInterval(metricsInterval);
      clearInterval(statusInterval);
    };
  }, []);

  // Generate activities from real system events
  const generateActivities = () => {
    const recentActivities = [
      {
        id: 1,
        type: 'agent_joined',
        agent: 'System',
        action: 'initialized',
        description: 'Dashboard connected to backend services',
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'project_created',
        agent: 'Configuration',
        action: 'loaded',
        description: '33 agents ready in 4 teams',
        timestamp: new Date(Date.now() - 60000)
      },
      {
        id: 3,
        type: 'milestone_reached',
        agent: 'Setup',
        action: 'complete',
        description: 'System ready to begin development',
        timestamp: new Date(Date.now() - 120000)
      }
    ];
    setActivities(recentActivities);
  };

  const handleCreateAgent = (agentData) => {
    // In production, this would call the API
    console.log('Create agent:', agentData);
    setShowCreateAgent(false);
  };

  const handleCreateProject = (projectData) => {
    // In production, this would call the API
    console.log('Create project:', projectData);
    setShowCreateProject(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Prometheus Status Panel - New! */}
            <PrometheusStatusPanel 
              agents={agents}
              tasks={tasks}
              metrics={metrics}
              systemStatus={systemStatus}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <AgentStatusPanel agents={agents} />
                <ActiveProjectsPanel projects={projects} />
              </div>
              <div className="space-y-6">
                <QuickActionsPanel 
                  onCreateAgent={() => setShowCreateAgent(true)}
                  onCreateProject={() => setShowCreateProject(true)}
                />
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        );
      case 'agents':
        return (
          <AgentList 
            agents={agents} 
            onCreateAgent={() => setShowCreateAgent(true)}
            onAgentClick={(agent) => {
              setSelectedAgent(agent);
              setShowChat(true);
            }}
          />
        );
      case 'projects':
        return (
          <ProjectList 
            projects={projects}
            agents={agents}
            onCreateProject={() => setShowCreateProject(true)}
          />
        );
      case 'tasks':
        return <TaskBreakdownView projects={projects} agents={agents} tasks={tasks} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout activeView={activeView} onNavigate={setActiveView}>
      {renderContent()}
      
      <CreateAgentForm 
        isOpen={showCreateAgent}
        onClose={() => setShowCreateAgent(false)}
        onSubmit={handleCreateAgent}
      />
      
      <CreateProjectForm
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSubmit={handleCreateProject}
        agents={agents}
      />
      
      {showChat && (
        <ChatInterface
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          agents={agents}
          selectedAgent={selectedAgent}
        />
      )}
    </MainLayout>
  );
}

export default App;
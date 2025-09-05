import React, { useState } from 'react';
  import Modal from '../common/Modal';
  import StatusIndicator from '../common/StatusIndicator';
  import ProgressBar from '../common/ProgressBar';
  import TaskList from './TaskList';
  import Button from '../common/Button';

  const ProjectModal = ({ project, agents, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'tasks', label: 'Tasks' },
      { id: 'team', label: 'Team' },
    ];

    const getAgentById = (agentId) => {
      return agents.find(agent => agent.id === agentId);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="xlarge">
        <div className="flex border-b border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                <p className="text-slate-600">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <StatusIndicator status={project.status} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Priority</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.priority}
                  </span>
                </div>
              </div>

              <div>
                <ProgressBar progress={project.progress} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Start Date</p>
                  <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                {project.deadline && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Deadline</p>
                    <p className="font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskList 
              tasks={project.tasks || []} 
              agents={agents}
              projectId={project.id}
            />
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              {project.projectManager && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Project Manager</h4>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <img 
                      src="/api/placeholder/40/40" 
                      alt="PM"
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {getAgentById(project.projectManager)?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-600">Project Manager</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Team Members</h4>
                <div className="space-y-2">
                  {project.team?.map(memberId => {
                    const agent = getAgentById(memberId);
                    return agent ? (
                      <div key={memberId} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <img 
                          src={agent.avatar} 
                          alt={agent.name}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{agent.name}</p>
                          <p className="text-sm text-slate-600">{agent.role}</p>
                        </div>
                        <StatusIndicator status={agent.status} />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  export default ProjectModal;
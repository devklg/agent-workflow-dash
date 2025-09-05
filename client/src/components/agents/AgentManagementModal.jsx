import React, { useState } from 'react';
  import Modal from '../common/Modal';
  import Button from '../common/Button';
  import StatusIndicator from '../common/StatusIndicator';

  const AgentManagementModal = ({ agent, isOpen, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!agent) return null;

    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'performance', label: 'Performance' },
      { id: 'settings', label: 'Settings' },
    ];

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={agent.name} size="xlarge">
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
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={agent.avatar} 
                  alt={agent.name}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                  <p className="text-slate-600">{agent.role}</p>
                  <StatusIndicator status={agent.status} />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Specialization</h4>
                <p className="text-slate-600">{agent.specialization}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{agent.tasksCompleted}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Success Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{agent.performance}%</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Recent Activity</h4>
                <p className="text-slate-600">Last active: {new Date(agent.lastActive).toLocaleString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  defaultValue={agent.status}
                >
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
                <Button variant="danger">
                  Delete Agent
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  export default AgentManagementModal;
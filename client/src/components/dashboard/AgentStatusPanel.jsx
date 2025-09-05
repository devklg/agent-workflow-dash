import React from 'react';
import StatusIndicator from '../common/StatusIndicator';

const AgentStatusPanel = ({ agents }) => {
  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-slate-800 bg-opacity-90 rounded-xl shadow-2xl border border-slate-600 p-8" style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
      <h2 className="text-2xl font-bold text-white mb-6">Agent Status Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-green-400">{statusCounts.active || 0}</div>
          <div className="text-base font-medium text-gray-300 mt-1">Active</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-yellow-400">{statusCounts.idle || 0}</div>
          <div className="text-base font-medium text-gray-300 mt-1">Idle</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-400">{statusCounts.busy || 0}</div>
          <div className="text-base font-medium text-gray-300 mt-1">Busy</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-500">{statusCounts.offline || 0}</div>
          <div className="text-base font-medium text-gray-400 mt-1">Offline</div>
        </div>
      </div>

      <div className="space-y-3">
        {agents.slice(0, 5).map(agent => (
          <div key={agent.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <div className="flex items-center space-x-4">
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-yellow-400"
              />
              <div>
                <div className="font-semibold text-white text-base">{agent.name}</div>
                <div className="text-sm text-gray-300">{agent.role}</div>
              </div>
            </div>
            <StatusIndicator status={agent.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentStatusPanel;
import React from 'react';
  import StatusIndicator from '../common/StatusIndicator';

  const AgentSelector = ({ agents, currentAgent, onSelectAgent }) => {
    return (
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <div className="flex space-x-2 overflow-x-auto">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                currentAgent?.id === agent.id
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
              }`}
            >
              <img 
                src={agent.avatar} 
                alt={agent.name}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
              />
              <span className="text-sm font-medium text-slate-900">{agent.name}</span>
              <StatusIndicator status={agent.status} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  export default AgentSelector;
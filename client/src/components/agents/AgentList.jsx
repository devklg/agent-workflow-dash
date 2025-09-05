import React, { useState } from 'react';
  import AgentCard from './AgentCard';
  import Button from '../common/Button';

  const AgentList = ({ agents, onCreateAgent, onAgentClick }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgents = agents.filter(agent => {
      const matchesFilter = filter === 'all' || agent.status === filter;
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    const statusOptions = ['all', 'active', 'idle', 'busy', 'offline'];

    return (
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-700 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">AI Agents Command Center</h2>
            <button 
              onClick={onCreateAgent} 
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-6 py-3 text-base rounded-lg shadow-xl transition-all transform hover:scale-105"
            >
              Add New Agent
            </button>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base placeholder-gray-400"
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onClick={onAgentClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'No agents found matching your search' 
                : filter === 'all' 
                  ? 'Create your first agent to get started'
                  : `No agents with status "${filter}"`
              }
            </p>
            <Button variant="primary" onClick={onCreateAgent}>
              Add New Agent
            </Button>
          </div>
        )}
      </div>
    );
  };

  export default AgentList;
import React, { useState } from 'react';
import StatusIndicator from '../common/StatusIndicator';
import ProgressBar from '../common/ProgressBar';

const AgentCard = ({ agent, onClick, onEdit, onDelete, onPause }) => {
  const [showActions, setShowActions] = useState(false);
  
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(agent);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${agent.name}?`)) {
      onDelete(agent.id);
    }
  };

  const handlePause = (e) => {
    e.stopPropagation();
    onPause(agent.id);
  };

  return (
    <div 
      onClick={() => onClick(agent)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="bg-slate-900 rounded-xl shadow-xl border border-slate-700 p-6 hover:shadow-2xl hover:border-blue-500 transition-all cursor-pointer relative"
    >
      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            onClick={handleEdit}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            title="Edit Agent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handlePause}
            className={`p-2 ${agent.status === 'paused' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg transition-all`}
            title={agent.status === 'paused' ? 'Resume Agent' : 'Pause Agent'}
          >
            {agent.status === 'paused' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
            title="Delete Agent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-yellow-400"
          />
          <div>
            <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
            <p className="text-base text-gray-300">{agent.role}</p>
          </div>
        </div>
        <StatusIndicator status={agent.status === 'paused' ? 'paused' : agent.status} />
      </div>

      <p className="text-base text-gray-300 mb-4">{agent.specialization}</p>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-400">0%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div className="h-1.5 bg-slate-300 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-base">
          <div>
            <p className="text-gray-400">Tasks Completed</p>
            <p className="font-semibold text-white text-lg">{agent.tasksCompleted}</p>
          </div>
          <div>
            <p className="text-gray-400">Active Projects</p>
            <p className="font-semibold text-white text-lg">{agent.activeProjects}</p>
          </div>
        </div>
      </div>

      {agent.skills && agent.skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex flex-wrap gap-2">
            {agent.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full"
              >
                {skill}
              </span>
            ))}
            {agent.skills.length > 3 && (
              <span className="px-3 py-1 text-sm font-medium text-gray-400">
                +{agent.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;
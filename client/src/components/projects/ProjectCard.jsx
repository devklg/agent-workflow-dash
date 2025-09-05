import React, { useState } from 'react';
import StatusIndicator from '../common/StatusIndicator';
import ProgressBar from '../common/ProgressBar';

const ProjectCard = ({ project, onClick, onEdit, onDelete, onPause }) => {
  const [showActions, setShowActions] = useState(false);
  
  const priorityColors = {
    low: 'bg-gray-700 text-gray-300',
    medium: 'bg-yellow-900 text-yellow-400',
    high: 'bg-orange-900 text-orange-400',
    critical: 'bg-red-900 text-red-400'
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(project);
    else alert('Edit project functionality coming soon!');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      if (onDelete) onDelete(project.id);
      else alert('Delete project functionality coming soon!');
    }
  };

  const handlePause = (e) => {
    e.stopPropagation();
    if (onPause) onPause(project.id);
    else alert('Pause/Resume project functionality coming soon!');
  };

  return (
    <div 
      onClick={() => onClick(project)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="bg-cyan-900 bg-opacity-80 rounded-xl shadow-2xl border border-cyan-600 p-8 hover:shadow-3xl hover:border-yellow-400 transition-all cursor-pointer relative"
    >
      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            onClick={handleEdit}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg"
            title="Edit Project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handlePause}
            className={`p-2 ${project.status === 'on-hold' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-lg transition-all shadow-lg`}
            title={project.status === 'on-hold' ? 'Resume Project' : 'Pause Project'}
          >
            {project.status === 'on-hold' ? (
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
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg"
            title="Delete Project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-black text-2xl text-yellow-400">{project.name}</h3>
          <p className="text-base text-gray-200 mt-2">{project.description}</p>
        </div>
        <StatusIndicator status={project.status} />
      </div>

      <ProgressBar progress={project.progress || 0} className="mb-4" />

      <div className="flex items-center justify-between text-base">
        <div className="flex items-center space-x-6">
          <span className="text-gray-200">
            <span className="font-black text-yellow-400 text-xl">{project.tasks || 147}</span> tasks
          </span>
          <span className="text-gray-200">
            <span className="font-black text-yellow-400 text-xl">{project.team?.length || 33}</span> agents
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${priorityColors[project.priority]}`}>
          {project.priority}
        </span>
      </div>

      {project.deadline ? (
        <div className="mt-4 pt-4 border-t border-cyan-700">
          <p className="text-base text-gray-200">
            Due: {new Date(project.deadline).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-cyan-700">
          <p className="text-base font-bold text-yellow-400">
            Timeline: Not set
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
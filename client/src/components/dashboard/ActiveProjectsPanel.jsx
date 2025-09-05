import React from 'react';
import ProgressBar from '../common/ProgressBar';
import StatusIndicator from '../common/StatusIndicator';

const ActiveProjectsPanel = ({ projects }) => {
  // Show all projects, not just active ones since we only have one project
  const displayProjects = projects.slice(0, 4);

  return (
    <div className="bg-cyan-900 bg-opacity-80 rounded-xl shadow-2xl border border-cyan-600 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-400">Active Projects</h2>
        <span className="text-lg font-bold text-yellow-400">{displayProjects.length} project</span>
      </div>

      <div className="space-y-5">
        {displayProjects.map(project => (
          <div key={project.id} className="border border-cyan-700 bg-cyan-950 bg-opacity-90 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-2xl text-yellow-400">{project.name}</h3>
                <p className="text-base text-gray-200 mt-2">{project.description}</p>
              </div>
              <StatusIndicator status={project.status} />
            </div>
            
            <ProgressBar progress={project.progress || 0} className="mb-4" />
            
            <div className="flex justify-between items-center text-base">
              <div className="flex items-center space-x-6">
                <span className="text-gray-200">
                  <span className="font-black text-yellow-400 text-xl">{project.tasks || 147}</span> tasks
                </span>
                <span className="text-gray-200">
                  <span className="font-black text-yellow-400 text-xl">{project.team?.length || 33}</span> agents
                </span>
              </div>
              {project.deadline ? (
                <span className="text-gray-200 font-medium">
                  Due {new Date(project.deadline).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-yellow-400 font-bold text-lg">
                  Timeline: Not set
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveProjectsPanel;
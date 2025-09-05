import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

const ProjectList = ({ projects, agents, onCreateProject }) => {
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const filteredProjects = projects.filter(project => {
    return filter === 'all' || project.status === filter;
  });

  const statusOptions = ['all', 'planning', 'active', 'completed', 'on-hold'];

  // Project Management watermark pattern (10% darker than form)
  const watermarkPattern = (
    <div className="absolute inset-0 opacity-15 overflow-hidden pointer-events-none">
      <div className="relative w-full h-full">
        <div className="absolute text-blue-400/40 text-4xl font-black transform rotate-12" style={{ top: '10%', left: '5%' }}>
          PROJECT MANAGEMENT
        </div>
        <div className="absolute text-blue-400/40 text-3xl font-black transform -rotate-45" style={{ top: '25%', left: '60%' }}>
          PROJECT MANAGEMENT
        </div>
        <div className="absolute text-blue-400/40 text-5xl font-black transform rotate-45" style={{ top: '50%', left: '20%' }}>
          PROJECT MANAGEMENT
        </div>
        <div className="absolute text-blue-400/40 text-3xl font-black transform -rotate-12" style={{ top: '70%', left: '70%' }}>
          PROJECT MANAGEMENT
        </div>
        <div className="absolute text-blue-400/40 text-4xl font-black transform rotate-30" style={{ top: '85%', left: '40%' }}>
          PROJECT MANAGEMENT
        </div>
        <div className="absolute text-blue-400/40 text-3xl font-black transform -rotate-20" style={{ top: '40%', left: '80%' }}>
          PROJECT MANAGEMENT
        </div>
        <div className="absolute text-blue-400/40 text-4xl font-black transform rotate-60" style={{ top: '15%', left: '35%' }}>
          PROJECT MANAGEMENT
        </div>
        <div className="absolute text-blue-400/40 text-3xl font-black transform -rotate-30" style={{ top: '60%', left: '5%' }}>
          PROJECT MANAGEMENT
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {/* Background with watermark - 10% darker than form */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/45 via-blue-500/40 to-blue-600/45 -z-10">
        {watermarkPattern}
      </div>

      <div className="relative z-10 space-y-6">
        <div className="bg-slate-900/90 rounded-xl shadow-xl border border-slate-700 p-8 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-black text-white drop-shadow-lg">Project Management</h2>
            <button
              onClick={onCreateProject}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-6 py-3 text-base rounded-lg shadow-xl transition-all transform hover:scale-105"
            >
              Create New Project
            </button>
          </div>

          <div className="mt-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-semibold"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onClick={(project) => {
                  setSelectedProject(project);
                  setShowProjectModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/90 rounded-xl shadow-xl border border-slate-700 p-12 text-center backdrop-blur">
            <p className="text-gray-300 text-lg mb-6 font-semibold">No projects found</p>
            <button
              onClick={onCreateProject}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-6 py-3 text-base rounded-lg shadow-xl transition-all"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {showProjectModal && selectedProject && (
          <ProjectModal
            project={selectedProject}
            agents={agents}
            isOpen={showProjectModal}
            onClose={() => {
              setShowProjectModal(false);
              setSelectedProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectList;
import React, { useState } from 'react';
import Modal from '../common/Modal';

const CreateProjectForm = ({ isOpen, onClose, onSubmit, agents }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    deadline: '',
    team: [],
    projectManager: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleTeamToggle = (agentId) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.includes(agentId)
        ? prev.team.filter(id => id !== agentId)
        : [...prev.team, agentId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.team.length === 0) newErrors.team = 'Select at least one team member';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        deadline: '',
        team: [],
        projectManager: ''
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="large">
      <div className="relative bg-gradient-to-br from-blue-500/50 via-blue-400/45 to-blue-500/50 rounded-xl p-8 backdrop-blur-sm overflow-hidden">
        {/* Watermark Pattern - Much more visible */}
        <div className="absolute inset-0 opacity-40 select-none pointer-events-none">
          <div 
            className="absolute text-white/30 text-4xl font-black transform rotate-45"
            style={{ top: '5%', left: '10%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
          <div 
            className="absolute text-white/30 text-3xl font-black transform -rotate-12"
            style={{ top: '15%', left: '50%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
          <div 
            className="absolute text-white/30 text-5xl font-black transform rotate-30"
            style={{ top: '30%', left: '5%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
          <div 
            className="absolute text-white/30 text-3xl font-black transform -rotate-45"
            style={{ top: '45%', left: '60%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
          <div 
            className="absolute text-white/30 text-4xl font-black transform rotate-15"
            style={{ top: '60%', left: '20%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
          <div 
            className="absolute text-white/30 text-3xl font-black transform -rotate-30"
            style={{ top: '75%', left: '55%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
          <div 
            className="absolute text-white/30 text-4xl font-black transform rotate-60"
            style={{ top: '85%', left: '30%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
          <div 
            className="absolute text-white/30 text-3xl font-black transform -rotate-60"
            style={{ top: '10%', left: '75%', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            PROJECT MANAGEMENT
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div>
            <label className="block text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 bg-white/35 backdrop-blur text-white drop-shadow-md text-base font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/70 ${
                errors.name ? 'border-red-400' : 'border-white/50'
              }`}
              placeholder="Enter project name"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            />
            {errors.name && (
              <p className="mt-1 text-base font-bold text-red-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 bg-white/35 backdrop-blur text-white drop-shadow-md text-base font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/70 ${
                errors.description ? 'border-red-400' : 'border-white/50'
              }`}
              placeholder="Describe the project objectives..."
              rows={3}
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            />
            {errors.description && (
              <p className="mt-1 text-base font-bold text-red-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-3 bg-white/35 backdrop-blur text-white drop-shadow-md text-base font-bold border-2 border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              >
                <option value="low" className="bg-blue-700 text-white">Low</option>
                <option value="medium" className="bg-blue-700 text-white">Medium</option>
                <option value="high" className="bg-blue-700 text-white">High</option>
                <option value="critical" className="bg-blue-700 text-white">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full px-4 py-3 bg-white/35 backdrop-blur text-white drop-shadow-md text-base font-bold border-2 border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                style={{ colorScheme: 'dark', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2">
              Project Manager
            </label>
            <select
              value={formData.projectManager}
              onChange={(e) => handleInputChange('projectManager', e.target.value)}
              className="w-full px-4 py-3 bg-white/35 backdrop-blur text-white drop-shadow-md text-base font-bold border-2 border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            >
              <option value="" className="bg-blue-700 text-white">Select project manager</option>
              {agents.filter(agent => agent.role === 'Project Manager').map(agent => (
                <option key={agent.id} value={agent.id} className="bg-blue-700 text-white">{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-3">
              Team Members * (Select at least one)
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-5 bg-white/25 backdrop-blur border-2 border-white/50 rounded-lg">
              {agents.map(agent => (
                <label key={agent.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white/20 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={formData.team.includes(agent.id)}
                    onChange={() => handleTeamToggle(agent.id)}
                    className="w-5 h-5 rounded border-blue-300 text-cyan-400 focus:ring-cyan-400 bg-white/30"
                  />
                  <span className="text-base font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {agent.name} ({agent.role})
                  </span>
                </label>
              ))}
            </div>
            {errors.team && (
              <p className="mt-1 text-base font-bold text-red-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">{errors.team}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-white/40">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600/80 hover:bg-gray-700 text-white font-bold text-base rounded-lg transition-all backdrop-blur"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold text-base rounded-lg shadow-xl transition-all transform hover:scale-105"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateProjectForm;
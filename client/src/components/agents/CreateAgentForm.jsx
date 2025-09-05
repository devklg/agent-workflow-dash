import React, { useState } from 'react';
import Modal from '../common/Modal';

const CreateAgentForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialization: '',
    skills: [],
    personality: '',
    contextSources: []
  });

  const [errors, setErrors] = useState({});

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Project Manager',
    'UI/UX Designer',
    'Data Scientist',
    'Marketing Specialist',
    'Content Creator'
  ];

  const availableSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'HTML/CSS',
    'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'REST APIs',
    'GraphQL', 'Testing', 'CI/CD', 'UI/UX Design', 'Tailwind CSS', 'Next.js',
    'Vue.js', 'Angular', 'Express.js', 'Django', 'Flask', 'Kubernetes'
  ];

  const contextOptions = [
    'Project Documentation',
    'Code Repositories',
    'Previous Conversations',
    'External APIs',
    'Team Knowledge Base',
    'Industry Best Practices'
  ];

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

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleContextToggle = (context) => {
    setFormData(prev => ({
      ...prev,
      contextSources: prev.contextSources.includes(context)
        ? prev.contextSources.filter(c => c !== context)
        : [...prev.contextSources, context]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Agent name is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (formData.skills.length === 0) newErrors.skills = 'Select at least one skill';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        name: '',
        role: '',
        specialization: '',
        skills: [],
        personality: '',
        contextSources: []
      });
    }
  };

  // Techy background pattern - more visible
  const techPattern = (
    <div className="absolute inset-0 opacity-30">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="3" fill="#93c5fd" />
            <circle cx="95" cy="5" r="3" fill="#93c5fd" />
            <circle cx="50" cy="50" r="4" fill="#60a5fa" />
            <circle cx="5" cy="95" r="3" fill="#93c5fd" />
            <circle cx="95" cy="95" r="3" fill="#93c5fd" />
            <line x1="5" y1="5" x2="50" y2="50" stroke="#60a5fa" strokeWidth="1" opacity="0.7" />
            <line x1="95" y1="5" x2="50" y2="50" stroke="#60a5fa" strokeWidth="1" opacity="0.7" />
            <line x1="5" y1="95" x2="50" y2="50" stroke="#60a5fa" strokeWidth="1" opacity="0.7" />
            <line x1="95" y1="95" x2="50" y2="50" stroke="#60a5fa" strokeWidth="1" opacity="0.7" />
            <rect x="45" y="45" width="10" height="10" fill="none" stroke="#93c5fd" strokeWidth="1" />
            {/* Grid lines for tech effect */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="#dbeafe" strokeWidth="0.3" opacity="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#dbeafe" strokeWidth="0.3" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New AI Agent" size="large">
      <div className="relative bg-gradient-to-br from-blue-700/70 via-blue-600/65 to-blue-700/70 rounded-xl p-8 backdrop-blur-sm">
        {techPattern}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div>
            <label className="block text-base font-black text-white drop-shadow-lg mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 bg-white/25 backdrop-blur text-white drop-shadow-md text-base font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-blue-100 ${
                errors.name ? 'border-red-400' : 'border-blue-200/60'
              }`}
              placeholder="Enter agent name"
            />
            {errors.name && (
              <p className="mt-1 text-base font-semibold text-red-300">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-base font-bold text-white mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={`w-full px-4 py-3 bg-white/25 backdrop-blur text-white text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                errors.role ? 'border-red-400' : 'border-blue-200/60'
              }`}
            >
              <option value="" className="bg-blue-900 text-white">Select a role</option>
              {roles.map(role => (
                <option key={role} value={role} className="bg-blue-900 text-white">{role}</option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-base font-semibold text-red-300">{errors.role}</p>
            )}
          </div>

          <div>
            <label className="block text-base font-bold text-white mb-2">
              Specialization *
            </label>
            <textarea
              value={formData.specialization}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              className={`w-full px-4 py-3 bg-white/25 backdrop-blur text-white text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-blue-100 ${
                errors.specialization ? 'border-red-400' : 'border-blue-200/60'
              }`}
              placeholder="Describe the agent's specialization..."
              rows={3}
            />
            {errors.specialization && (
              <p className="mt-1 text-base font-semibold text-red-300">{errors.specialization}</p>
            )}
          </div>

          <div>
            <label className="block text-base font-bold text-white mb-3">
              Skills * (Select at least one)
            </label>
            <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto p-5 bg-white/15 backdrop-blur border-2 border-blue-200/60 rounded-lg">
              {availableSkills.map(skill => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="w-5 h-5 rounded border-blue-400 text-cyan-400 focus:ring-cyan-400 bg-white/20"
                  />
                  <span className="text-base font-bold text-white drop-shadow-md">{skill}</span>
                </label>
              ))}
            </div>
            {errors.skills && (
              <p className="mt-1 text-base font-semibold text-red-300">{errors.skills}</p>
            )}
          </div>

          <div>
            <label className="block text-base font-bold text-white mb-2">
              Personality Traits (Optional)
            </label>
            <input
              type="text"
              value={formData.personality}
              onChange={(e) => handleInputChange('personality', e.target.value)}
              className="w-full px-4 py-3 bg-white/25 backdrop-blur text-white text-base font-semibold border-2 border-blue-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-blue-100"
              placeholder="e.g., Professional, Creative, Detail-oriented"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-white mb-3">
              Context Sources (Optional)
            </label>
            <div className="space-y-3 bg-white/15 backdrop-blur p-5 rounded-lg border-2 border-blue-200/60">
              {contextOptions.map(context => (
                <label key={context} className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={formData.contextSources.includes(context)}
                    onChange={() => handleContextToggle(context)}
                    className="w-5 h-5 rounded border-blue-400 text-cyan-400 focus:ring-cyan-400 bg-white/20"
                  />
                  <span className="text-base font-bold text-white drop-shadow-md">{context}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-blue-200/40">
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
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateAgentForm;
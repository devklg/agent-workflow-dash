import React from 'react';
import Button from '../common/Button';

const QuickActionsPanel = ({ onCreateAgent, onCreateProject }) => {
  const handleGenerateReport = () => {
    alert('Report Generation\n\nSystem Status:\n• 33 Agents Configured\n• 147 Tasks Defined\n• 0 Tasks Completed\n• 4 Teams Ready\n\nNo work has been performed yet. All systems ready to begin.');
  };

  const handleTeamMeeting = () => {
    alert('Team Meeting Scheduler\n\nSchedule a synchronization meeting with the agent teams.\n\nNote: This would coordinate the 33 AI agents across Atlas, Aurora, Phoenix, and Sentinel teams when development begins.');
  };

  const actions = [
    {
      title: 'Create New Agent',
      description: 'Add a new AI agent to your team',
      icon: '🤖',
      action: onCreateAgent,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Start New Project',
      description: 'Initialize a new development project',
      icon: '🚀',
      action: onCreateProject,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Generate Report',
      description: 'Create performance analytics report',
      icon: '📊',
      action: handleGenerateReport,
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'Team Meeting',
      description: 'Schedule team synchronization',
      icon: '👥',
      action: handleTeamMeeting,
      color: 'bg-yellow-100 text-yellow-700'
    }
  ];

  return (
    <div className="bg-slate-800 bg-opacity-90 rounded-xl shadow-2xl border border-slate-600 p-8" style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
      <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="flex flex-col items-center p-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-blue-500 hover:shadow-xl transition-all"
          >
            <div className={`w-14 h-14 rounded-full ${action.color} flex items-center justify-center text-3xl mb-3`}>
              {action.icon}
            </div>
            <div className="text-base font-bold text-white">{action.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
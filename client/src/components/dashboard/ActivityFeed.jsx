import React from 'react';

  const ActivityFeed = ({ activities }) => {
    const getActivityIcon = (type) => {
      const icons = {
        task_completed: '✅',
        project_created: '🚀',
        agent_joined: '👋',
        code_committed: '💻',
        milestone_reached: '🎯',
        deployment: '🚢',
        error: '🚨',
        review_requested: '👀'
      };
      return icons[type] || '📌';
    };

    const formatTime = (timestamp) => {
      const now = new Date();
      const diff = now - new Date(timestamp);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    };

    return (
    <div className="bg-slate-800 bg-opacity-90 rounded-xl shadow-2xl border border-slate-600 p-8" style={{ backgroundColor: 'rgb(30, 41, 59)' }}>
    <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
              <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xl">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base text-white font-medium">
                  <span className="font-semibold">{activity.agent}</span> {activity.action}
                </p>
                <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                <p className="text-sm text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default ActivityFeed;
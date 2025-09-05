import React from 'react';

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active', textColor: 'text-green-400' },
    idle: { color: 'bg-yellow-500', text: 'Idle', textColor: 'text-yellow-400' },
    busy: { color: 'bg-blue-500', text: 'Busy', textColor: 'text-blue-400' },
    offline: { color: 'bg-gray-400', text: 'Offline', textColor: 'text-gray-300' },
    paused: { color: 'bg-orange-500', text: 'Paused', textColor: 'text-orange-400' },
    completed: { color: 'bg-green-500', text: 'Completed', textColor: 'text-green-400' },
    'in-progress': { color: 'bg-blue-500', text: 'In Progress', textColor: 'text-blue-400' },
    pending: { color: 'bg-yellow-500', text: 'Pending', textColor: 'text-yellow-400' },
    blocked: { color: 'bg-red-500', text: 'Blocked', textColor: 'text-red-400' },
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${config.color} animate-pulse`} />
      <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
    </div>
  );
};

export default StatusIndicator;
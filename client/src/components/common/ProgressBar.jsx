import React from 'react';

  const ProgressBar = ({ progress, showLabel = true, height = 'h-2', className = '' }) => {
    const percentage = Math.min(100, Math.max(0, progress));
    
    return (
      <div className={`w-full ${className}`}>
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm font-medium text-slate-700">{percentage}%</span>
          </div>
        )}
        <div className={`w-full bg-slate-200 rounded-full ${height} overflow-hidden`}>
          <div
            className={`bg-gradient-to-r from-blue-500 to-purple-500 ${height} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  export default ProgressBar;
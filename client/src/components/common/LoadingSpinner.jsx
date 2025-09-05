import React from 'react';

  const LoadingSpinner = ({ size = 'medium', className = '' }) => {
    const sizes = {
      small: 'w-4 h-4',
      medium: 'w-8 h-8',
      large: 'w-12 h-12',
    };

    return (
      <div className={`flex justify-center items-center ${className}`}>
        <div className={`animate-spin rounded-full border-b-2 border-slate-900 ${sizes[size]}`} />
      </div>
    );
  };

  export default LoadingSpinner;
import React from 'react';

  const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'medium', 
    onClick, 
    disabled = false,
    className = '',
    ...props 
  }) => {
    const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500',
      secondary: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    };
    
    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-sm',
      large: 'px-6 py-3 text-base',
    };
    
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

  export default Button;
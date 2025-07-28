import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'cyan', 
  message = 'Loading...', 
  centered = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    cyan: 'border-cyan-400',
    blue: 'border-blue-400',
    green: 'border-green-400',
    yellow: 'border-yellow-400',
    red: 'border-red-400',
    gray: 'border-gray-400'
  };

  const spinner = (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-2 border-t-transparent rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        {spinner}
        {message && (
          <p className="text-gray-400 mt-4 text-sm">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center space-x-2">
      {spinner}
      {message && (
        <span className="text-gray-400 text-sm">{message}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
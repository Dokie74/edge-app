// LoadingSpinner.tsx - TypeScript version with proper prop types
import React from 'react';
import { LoadingSpinnerProps } from '../../types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-cyan-600 rounded-full animate-spin`} />
      </div>
      {message && (
        <p className={`text-gray-400 ${textSizeClasses[size]} font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
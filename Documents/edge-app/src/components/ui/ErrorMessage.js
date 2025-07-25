import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  title = 'Error', 
  variant = 'default', 
  dismissible = false, 
  onDismiss = null,
  onRetry = null,
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-red-900 border-red-700 text-red-200',
    subtle: 'bg-red-900/20 border-red-800/30 text-red-300',
    inline: 'bg-transparent border-none text-red-400 p-2'
  };

  const iconClasses = {
    default: 'text-red-400',
    subtle: 'text-red-500',
    inline: 'text-red-400'
  };

  return (
    <div className={`
      ${variantClasses[variant]} 
      border rounded-lg p-4 mb-4 
      ${className}
    `}>
      <div className="flex items-start">
        <AlertTriangle 
          size={20} 
          className={`${iconClasses[variant]} mr-3 mt-0.5 flex-shrink-0`} 
        />
        
        <div className="flex-1">
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm opacity-90">
            {typeof error === 'string' ? error : error?.message || 'An unexpected error occurred'}
          </p>
          
          {/* Action buttons */}
          {(onRetry || onDismiss) && (
            <div className="flex items-center space-x-2 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs transition-colors"
                >
                  <RefreshCw size={12} className="mr-1" />
                  Retry
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
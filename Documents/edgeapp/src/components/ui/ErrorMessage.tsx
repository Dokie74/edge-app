// ErrorMessage.tsx - TypeScript version with proper error handling types
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ErrorMessageProps } from '../../types';
import Button from './Button';

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title = 'Something went wrong',
  onRetry,
  className = ''
}) => {
  // Ensure error is always a string
  const errorMessage = typeof error === 'string' ? error : 
                      (error as any)?.message || 
                      'An unexpected error occurred';

  return (
    <div className={`bg-red-900 border border-red-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1 min-w-0">
          <h3 className="text-red-200 font-semibold text-lg mb-2">
            {title}
          </h3>
          <p className="text-red-300 text-sm leading-relaxed mb-4">
            {errorMessage}
          </p>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="bg-red-700 hover:bg-red-600 border border-red-600"
            >
              <RefreshCw size={14} className="mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
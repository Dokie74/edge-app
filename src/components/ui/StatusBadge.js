import React from 'react';
import { getStatusBadgeColor } from '../../utils/uiUtils';

const StatusBadge = ({ 
  status, 
  variant = 'default', 
  size = 'sm', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const variantClasses = {
    default: getStatusBadgeColor(status),
    outline: `border ${getStatusBadgeColor(status).replace('bg-', 'border-').replace('text-white', 'text-current')} bg-transparent`,
    subtle: `${getStatusBadgeColor(status).replace('-600', '-900/20').replace('text-white', 'text-current')} border-none`
  };

  const displayText = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
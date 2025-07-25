import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'md', 
  className = '',
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-gray-800 border border-gray-700',
    elevated: 'bg-gray-800 shadow-2xl border border-gray-700',
    outline: 'border border-gray-600 bg-transparent',
    subtle: 'bg-gray-800/50 border border-gray-700/50'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6', 
    lg: 'p-8'
  };

  return (
    <div 
      className={`
        rounded-lg
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Card subcomponents for better composition
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-semibold text-white ${className}`} {...props}>
    {children}
  </h3>
);

Card.Content = ({ children, className = '', ...props }) => (
  <div className={`text-gray-300 ${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-700 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  headerAction,
  variant = 'default',
  padding = 'normal',
  hover = false,
  className = '' 
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200',
    dark: 'bg-gray-800 border border-gray-700 text-white',
    success: 'bg-green-50 border border-green-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    danger: 'bg-red-50 border border-red-200',
  };
  
  const paddings = {
    none: '',
    sm: 'p-3',
    normal: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  return (
    <div className={`rounded-lg shadow-md ${variants[variant]} ${hoverClass} ${className}`}>
      {(title || headerAction) && (
        <div className={`border-b border-gray-200 ${paddings[padding]} flex items-center justify-between`}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div>
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className={paddings[padding]}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-200 ${paddings[padding]} bg-gray-50 rounded-b-lg`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
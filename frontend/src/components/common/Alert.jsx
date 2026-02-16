import React from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title,
  message, 
  onClose,
  dismissible = true,
  className = '' 
}) => {
  const types = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
      icon: CheckCircle,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
      icon: XCircle,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
      icon: AlertCircle,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
      icon: Info,
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div 
      className={`
        ${config.bgColor} 
        ${config.borderColor} 
        border-l-4 
        p-4 
        rounded-r-lg 
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {title}
            </h3>
          )}
          {message && (
            <p className={`text-sm ${config.textColor} ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          )}
        </div>
        
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className={`ml-3 inline-flex rounded-md p-1.5 ${config.textColor} hover:bg-opacity-20 hover:bg-gray-900 focus:outline-none`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
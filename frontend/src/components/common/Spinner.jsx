import React from 'react';

const Spinner = ({ 
  size = 'md', 
  color = 'green',
  fullScreen = false,
  text = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    green: 'border-green-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`
          ${sizes[size]} 
          border-4 
          ${colors[color]} 
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ 
  trigger, 
  children, 
  align = 'left',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`
            absolute z-50 mt-2 w-56 
            ${alignments[align]}
            bg-white rounded-lg shadow-lg border border-gray-200
            animate-slideDown
          `}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ children, onClick, icon, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-4 py-2 text-left text-sm flex items-center gap-2
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}
        transition-colors duration-150
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const DropdownDivider = () => {
  return <hr className="my-1 border-gray-200" />;
};

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export default Dropdown;
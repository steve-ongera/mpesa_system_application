import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Menu, LogOut, Settings } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../store';
import Dropdown from '../common/Dropdown';
import Badge from '../common/Badge';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo and Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              M-Pesa System
            </span>
          </Link>
        </div>

        {/* Right: Notifications and User */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link 
            to="/notifications" 
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={24} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.first_name || 'User'}
                </span>
              </button>
            }
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || `${user?.first_name} ${user?.last_name}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {user?.phone_number}
              </p>
            </div>

            <Dropdown.Item 
              icon={<User size={16} />}
              onClick={() => window.location.href = '/profile'}
            >
              Profile
            </Dropdown.Item>

            <Dropdown.Item 
              icon={<Settings size={16} />}
              onClick={() => window.location.href = '/settings'}
            >
              Settings
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item 
              icon={<LogOut size={16} />}
              onClick={handleLogout}
              danger
            >
              Logout
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
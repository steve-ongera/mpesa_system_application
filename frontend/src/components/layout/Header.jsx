import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Menu, LogOut, Settings, Phone } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../store';
import Dropdown from '../common/Dropdown';
import Badge from '../common/Badge';
import './header.css'; // Import the CSS file

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Left: Logo and Menu */}
        <div className="header-left">
          <button
            onClick={onMenuClick}
            className="menu-button"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/dashboard" className="logo-link">
            <div className="logo-icon">
              <span>M</span>
            </div>
            <span className="logo-text">
              M-Pesa System
            </span>
          </Link>
        </div>

        {/* Right: Notifications and User */}
        <div className="header-right">
          {/* Notifications */}
          <Link 
            to="/notifications" 
            className="notification-link"
            aria-label="Notifications"
          >
            <Bell size={22} className="notification-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button className="user-trigger" aria-label="User menu">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <span className="user-name">
                  {user?.first_name || 'User'}
                </span>
              </button>
            }
            menuClassName="dropdown-menu"
          >
            <div className="dropdown-header">
              <div className="dropdown-user-name">
                {user?.full_name || `${user?.first_name} ${user?.last_name}`}
              </div>
              <div className="dropdown-user-phone">
                <Phone size={14} />
                {user?.phone_number}
              </div>
            </div>

            <Dropdown.Item 
              icon={<User size={18} />}
              onClick={() => window.location.href = '/profile'}
              className="dropdown-item"
            >
              Profile
            </Dropdown.Item>

            <Dropdown.Item 
              icon={<Settings size={18} />}
              onClick={() => window.location.href = '/settings'}
              className="dropdown-item"
            >
              Settings
            </Dropdown.Item>

            <div className="dropdown-divider" />

            <Dropdown.Item 
              icon={<LogOut size={18} />}
              onClick={handleLogout}
              className="dropdown-item danger"
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
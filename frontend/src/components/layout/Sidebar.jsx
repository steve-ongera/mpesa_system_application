import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Send, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  History,
  Wallet,
  Bell,
  MapPin,
  User,
  Settings,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store';
import './sidebar.css'; // Import the CSS file

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Send Money', 
      path: '/send-money', 
      icon: Send 
    },
    { 
      name: 'Deposit', 
      path: '/deposit', 
      icon: ArrowDownToLine 
    },
    { 
      name: 'Withdraw', 
      path: '/withdraw', 
      icon: ArrowUpFromLine 
    },
    { 
      name: 'Transactions', 
      path: '/transactions', 
      icon: History 
    },
    { 
      name: 'My Wallet', 
      path: '/wallet', 
      icon: Wallet 
    },
    { 
      name: 'Agents', 
      path: '/agents', 
      icon: MapPin 
    },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: Bell,
      badge: 3 // Example notification count
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: User 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings 
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${!isOpen ? 'closed' : ''}`}
      >
        {/* Header - Mobile Only */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <span>M</span>
            </div>
            <span className="sidebar-title">Menu</span>
          </div>
          <button 
            onClick={onClose}
            className="sidebar-close"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`sidebar-menu-item ${active ? 'active' : ''}`}
                >
                  <Icon className="sidebar-icon" />
                  <span className="sidebar-text">{item.name}</span>
                  {item.badge && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer with User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              <span>{getUserInitials()}</span>
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">
                {user?.first_name || 'User'}
              </div>
              <div className="sidebar-user-role">
                {user?.phone_number || 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
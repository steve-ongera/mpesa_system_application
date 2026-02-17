import React, { useEffect, useState } from 'react';
import { CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import NotificationList from '../../components/features/NotificationList';
import { notificationAPI } from '../../services/api';
import { useNotificationStore } from '../../store';
import toast from 'react-hot-toast';

const Notifications = () => {
  const {
    notifications, setNotifications,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAll,
    clearNotifications,
    setUnreadCount,
  } = useNotificationStore();

  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // 'all' | 'unread' | 'read'

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      const data = res.data.data || res.data;
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      storeMarkAsRead(id);
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      storeMarkAll();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all notifications?')) return;
    try {
      await notificationAPI.clearAll();
      clearNotifications();
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read')   return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const tabClass = (key) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      filter === key ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={fetchNotifications}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck size={16} />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button className={tabClass('all')}    onClick={() => setFilter('all')}>All</button>
        <button className={tabClass('unread')} onClick={() => setFilter('unread')}>
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button className={tabClass('read')}   onClick={() => setFilter('read')}>Read</button>
      </div>

      {/* Notifications */}
      <Card padding="none">
        <NotificationList
          notifications={filtered}
          loading={loading}
          onRead={handleMarkAsRead}
        />
      </Card>
    </div>
  );
};

export default Notifications;
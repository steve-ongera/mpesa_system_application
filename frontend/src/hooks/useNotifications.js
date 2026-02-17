import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotificationStore, useUiStore } from '../store';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * useNotifications — manages notifications with optional polling.
 *
 * Features:
 *  - Fetch & cache notifications in the store
 *  - Mark single / all as read
 *  - Clear all
 *  - Optional polling for new notifications (configurable interval)
 *  - Filter tabs (all / unread / read / by type)
 *
 * Usage:
 *   const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
 *   const { notifications: unread } = useNotifications({ filter: 'unread' });
 */
const useNotifications = ({ filter = 'all', pollInterval = 0 } = {}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    setNotifications,
    addNotification,
    markAsRead:    storeMarkAsRead,
    markAllAsRead: storeMarkAll,
    clearNotifications,
    setUnreadCount,
    setLoading,
    getUnread,
  } = useNotificationStore();

  const { setUnreadCount: setUiUnread } = useUiStore();

  const [isFetching,  setIsFetching]  = useState(false);
  const [isMarking,   setIsMarking]   = useState(false);
  const pollRef = useRef(null);

  // ─── Fetch all notifications ─────────────────────────────────
  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!silent) { setIsFetching(true); setLoading(true); }
    try {
      const res  = await notificationAPI.getNotifications();
      const data = res.data.data || res.data || [];
      setNotifications(data);
      const count = data.filter((n) => !n.is_read).length;
      setUnreadCount(count);
      setUiUnread(count);
      return data;
    } catch {
      if (!silent) toast.error('Failed to load notifications');
      return [];
    } finally {
      if (!silent) { setIsFetching(false); setLoading(false); }
    }
  }, [setNotifications, setUnreadCount, setUiUnread, setLoading]);

  // ─── Fetch just the unread count (lightweight header poll) ───
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res   = await notificationAPI.getUnreadCount();
      const count = res.data.data?.count ?? res.data?.count ?? 0;
      setUnreadCount(count);
      setUiUnread(count);
      return count;
    } catch {
      return unreadCount;
    }
  }, [setUnreadCount, setUiUnread, unreadCount]);

  // ─── Mark single as read ─────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    storeMarkAsRead(id);
    setUiUnread(Math.max(0, unreadCount - 1));

    try {
      await notificationAPI.markAsRead(id);
    } catch {
      // Roll back optimistically on failure — re-fetch
      await fetchNotifications({ silent: true });
    }
  }, [storeMarkAsRead, setUiUnread, unreadCount, fetchNotifications]);

  // ─── Mark all as read ────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;
    setIsMarking(true);
    storeMarkAll();
    setUiUnread(0);
    try {
      await notificationAPI.markAllAsRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
      await fetchNotifications({ silent: true });
    } finally {
      setIsMarking(false);
    }
  }, [unreadCount, storeMarkAll, setUiUnread, fetchNotifications]);

  // ─── Clear all ────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    if (!window.confirm('Delete all notifications?')) return;
    try {
      await notificationAPI.clearAll();
      clearNotifications();
      setUiUnread(0);
      toast.success('Notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  }, [clearNotifications, setUiUnread]);

  // ─── Auto-poll ───────────────────────────────────────────────
  useEffect(() => {
    if (pollInterval > 0) {
      pollRef.current = setInterval(
        () => fetchUnreadCount(),
        pollInterval
      );
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollInterval, fetchUnreadCount]);

  // ─── Filtering ────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (filter === 'unread')      return !n.is_read;
    if (filter === 'read')        return  n.is_read;
    if (filter === 'TRANSACTION') return n.notification_type === 'TRANSACTION';
    if (filter === 'SECURITY')    return n.notification_type === 'SECURITY';
    if (filter === 'PROMOTIONAL') return n.notification_type === 'PROMOTIONAL';
    return true;
  });

  // ─── Grouped by date for the full-page view ──────────────────
  const grouped = filtered.reduce((acc, n) => {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86_400_000).toDateString();
    const d         = new Date(n.created_at).toDateString();
    const label     = d === today ? 'Today' : d === yesterday ? 'Yesterday' :
      new Date(n.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {});

  // ─── Tab counts ───────────────────────────────────────────────
  const counts = {
    all:     notifications.length,
    unread:  unreadCount,
    read:    notifications.length - unreadCount,
  };

  return {
    // Data
    notifications: filtered,
    allNotifications: notifications,
    grouped,
    unreadCount,
    counts,
    unreadList: getUnread(),

    // Loading
    isFetching,
    isLoading,
    isMarking,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};

export default useNotifications;
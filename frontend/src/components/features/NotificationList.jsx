import React from 'react';
import { BellOff } from 'lucide-react';
import NotificationItem from './NotificationItem';
import Spinner from '../common/Spinner';

const NotificationList = ({ notifications = [], loading = false, onRead }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="md" text="Loading notifications..." />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BellOff size={30} className="text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">No Notifications</h3>
        <p className="text-sm text-gray-400">
          You're all caught up. New notifications will appear here.
        </p>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.is_read);
  const read   = notifications.filter((n) =>  n.is_read);

  return (
    <div className="divide-y divide-gray-100">
      {unread.length > 0 && (
        <>
          <div className="px-5 py-2 bg-gray-50">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              New — {unread.length}
            </span>
          </div>
          {unread.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={onRead} />
          ))}
        </>
      )}

      {read.length > 0 && (
        <>
          <div className="px-5 py-2 bg-gray-50">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Earlier
            </span>
          </div>
          {read.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={onRead} />
          ))}
        </>
      )}
    </div>
  );
};

export default NotificationList;
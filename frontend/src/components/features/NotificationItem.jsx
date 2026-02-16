import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

const NotificationItem = ({ notification, onRead }) => {
  return (
    <div 
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.is_read ? 'bg-gray-200' : 'bg-blue-200'}`}>
          <Bell size={20} className={notification.is_read ? 'text-gray-600' : 'text-blue-600'} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-medium text-gray-900">{notification.title}</h4>
            {!notification.is_read && (
              <Badge variant="info" size="sm">New</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
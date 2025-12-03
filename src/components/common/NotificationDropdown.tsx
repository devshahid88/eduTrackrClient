import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { NotificationDropdownProps, NotificationDropdownItem } from '../../types/components/common';

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  notifications, 
  onClose, 
  onMarkAsRead 
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: NotificationDropdownItem) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
      case 'media':
      case 'reaction':
      case 'reply':
        navigate(`/${notification.role}/chat`);
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'message': return '💬';
      case 'media': return '📎';
      case 'reaction': return '❤️';
      case 'reply': return '↩️';
      default: return '📢';
    }
  };

  const getNotificationText = (notification: NotificationDropdownItem): string => {
    switch (notification.type) {
      case 'message':
        return `${notification.sender} sent you a message`;
      case 'media':
        return `${notification.sender} shared a file`;
      case 'reaction':
        return `${notification.sender} reacted to your message`;
      case 'reply':
        return `${notification.sender} replied to your message`;
      default:
        return notification.message;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      if (!timestamp) return 'Just now';
      const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Just now';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-20">
      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <MdClose size={20} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-center text-gray-500">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

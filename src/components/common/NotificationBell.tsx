import React from 'react';
import { MdNotifications } from 'react-icons/md';
import { NotificationBellProps } from '../../types/components/common';

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  unreadCount, 
  role, 
  onNavigate 
}) => {
  return (
    <button 
      className="relative text-gray-500 hover:text-gray-700"
      onClick={() => onNavigate(`/${role}/notifications`)}
    >
      <MdNotifications size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs justify-center items-center">
            {unreadCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default NotificationBell;

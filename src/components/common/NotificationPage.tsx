import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsReadThunk,
  deleteNotificationThunk,
} from '../../redux/slices/notificationSlice';
import { toast } from 'react-toastify';

import { 
  MdNotifications, 
  MdAssignment, 
  MdGrade, 
  MdMessage, 
  MdAnnouncement,
  MdCheckCircle,
  MdDelete
} from 'react-icons/md';

const NotificationPage: React.FC = () => {
  const dispatch = useDispatch();
  // Safe useSelector with default values to prevent crashes
  const notificationState = useSelector((state: RootState) => state.notification);
  const { notifications, unreadCount, loading, error } = notificationState || { 
    notifications: [], 
    unreadCount: 0, 
    loading: false, 
    error: null 
  };

  useEffect(() => {
    dispatch(fetchNotifications() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id) as any);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsReadThunk() as any);
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    dispatch(deleteNotificationThunk(id) as any);
    toast.success('Notification deleted');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <MdAssignment className="text-orange-500 text-xl" />;
      case 'grade': return <MdGrade className="text-yellow-500 text-xl" />;
      case 'message': return <MdMessage className="text-blue-500 text-xl" />;
      case 'announcement': return <MdAnnouncement className="text-purple-500 text-xl" />;
      case 'system': return <MdNotifications className="text-gray-500 text-xl" />;
      default: return <MdNotifications className="text-gray-500 text-xl" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MdNotifications className="text-blue-600" /> Notifications
        </h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
            {unreadCount} New
          </span>
          <button
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <MdCheckCircle /> Mark All Read
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
             <MdNotifications className="text-6xl text-gray-300 mb-3" />
             <p className="text-lg">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                notif.read 
                  ? 'bg-white border-gray-100' 
                  : 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
              } hover:bg-gray-50`}
            >
              <div className={`mt-1 p-2 rounded-lg ${notif.read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <h3 className={`font-semibold text-sm truncate pr-2 ${notif.read ? 'text-gray-700' : 'text-blue-900'}`}>
                      {notif.title}
                   </h3>
                   <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(notif.timestamp).toLocaleString(undefined, {
                         month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                   </span>
                </div>
                <p className={`text-sm leading-relaxed ${notif.read ? 'text-gray-600' : 'text-gray-800'}`}>
                   {notif.message}
                </p>
                
                 <div className="flex gap-2 mt-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        className="text-xs flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition"
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                      >
                       <MdCheckCircle className="text-xs" /> Mark Read
                      </button>
                    )}
                    <button
                      className="text-xs flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition"
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                    >
                      <MdDelete className="text-xs" /> Delete
                    </button>
                  </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage; 
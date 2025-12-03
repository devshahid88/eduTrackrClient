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

const NotificationPage: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector(
    (state: RootState) => state.notification
  ) || { notifications: [], unreadCount: 0, loading: false, error: null };

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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="flex items-center gap-2">
          <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount} Unread
          </span>
          <button
            className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 animate-pulse">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-400 italic">No notifications found.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`flex items-start justify-between p-4 rounded-lg border transition-all duration-200 shadow-sm group cursor-pointer hover:scale-[1.01] hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-300 ${
                notif.read ? 'bg-gray-100' : 'bg-blue-50 border-blue-400 shadow-md'
              }`}
              tabIndex={0}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${notif.read ? 'bg-gray-400' : 'bg-blue-500 animate-pulse'}`}></span>
                  <span className="font-semibold group-hover:text-blue-700 transition-colors">{notif.title}</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(notif.timestamp).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-gray-700 group-hover:text-blue-900 transition-colors">{notif.message}</div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {!notif.read && (
                  <button
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition"
                    onClick={() => handleMarkAsRead(notif._id)}
                  >
                    Mark as read
                  </button>
                )}
                <button
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition"
                  onClick={() => handleDelete(notif._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage; 
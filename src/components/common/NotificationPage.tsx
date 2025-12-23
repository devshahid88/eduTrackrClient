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
    <div className="container mx-auto max-w-4xl py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            Updates & Alerts
          </h2>
          <div className="flex items-center gap-3 mt-2">
             <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                {unreadCount} UNREAD
             </span>
             <p className="text-gray-500 font-medium text-sm">Real-time alerts and system notifications.</p>
          </div>
        </div>
        <button
          className="px-8 py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark All As Read
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white h-24 rounded-3xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 px-4 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">
            🔕
          </div>
          <h3 className="text-2xl font-black text-gray-900">Inbox is Empty</h3>
          <p className="text-gray-500 max-w-sm font-medium">You’re all caught up! New notifications will appear here as they arrive.</p>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`group relative flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 ${
                notif.read 
                  ? 'bg-white/60 border-gray-50 opacity-80' 
                  : 'bg-white border-blue-100 shadow-lg shadow-blue-50/50 ring-1 ring-blue-50'
              } hover:translate-x-1 hover:bg-white`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                  notif.type === 'assignment' ? 'bg-amber-50 text-amber-500' :
                  notif.type === 'grade' ? 'bg-emerald-50 text-emerald-500' :
                  notif.type === 'message' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'
              }`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <h3 className={`font-black tracking-tight ${notif.read ? 'text-gray-600' : 'text-gray-900'} truncate mr-4`}>
                      {notif.title}
                   </h3>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                <p className={`text-sm font-medium leading-relaxed ${notif.read ? 'text-gray-400' : 'text-gray-600'} line-clamp-1 group-hover:line-clamp-none transition-all`}>
                   {notif.message}
                </p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                {!notif.read && (
                    <button
                        className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                        title="Mark as read"
                    >
                        <MdCheckCircle className="w-5 h-5" />
                    </button>
                )}
                <button
                    className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                    title="Delete notification"
                >
                    <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice';
import {
  MdDashboard,
  MdClass,
  MdPeople,
  MdAssignment,
  MdGrade,
  MdChat,
  MdAnnouncement,
  MdDescription,
  MdCalendarToday,
  MdPerson,
  MdSettings,
  MdExitToApp,
  MdSmartToy,
  MdNotifications,
  MdLibraryBooks,
} from 'react-icons/md';
import { RootState } from '../../../redux/store';

interface TeacherSideBarProps {
  activePage?: string;
  onClose?: () => void;
}

const TeacherSideBar: React.FC<TeacherSideBarProps> = ({ activePage, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);

  const isActive = (path: string) => {
    if (activePage) {
      return activePage === path.replace('/teacher/', '');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/auth/teacher-login');
  };

  const menuItems = {
    MAIN: [
      { icon: MdDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: MdClass, label: 'My Classes', path: '/teacher/my-classes' },
      { icon: MdPeople, label: 'Students', path: '/teacher/students' },
      { icon: MdAssignment, label: 'Assignments', path: '/teacher/assignments' },
      { icon: MdGrade, label: 'Grades', path: '/teacher/grades' },
      { icon: MdLibraryBooks, label: 'Resources', path: '/teacher/resources' },
      { icon: MdNotifications, label: 'Notifications', path: '/teacher/notifications', badge: unreadCount },
    ],
    COMMUNICATION: [
      { icon: MdChat, label: 'Student Chat', path: '/teacher/chat' },
      { icon: MdAnnouncement, label: 'Concerns', path: '/teacher/concerns' },
      { icon: MdSmartToy, label: 'AI Assistant', path: '/teacher/ai-assistant' },
    ],
    ACCOUNT: [
      { icon: MdPerson, label: 'Profile', path: '/teacher/profile' },
      { icon: MdExitToApp, label: 'Logout', path: '#' },
    ],
  };

  const renderSection = (title: string, items: { icon: React.ElementType; label: string; path: string; badge?: number }[]) => (
    <div className="mb-8">
      <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return item.label === 'Logout' ? (
            <button
              key={item.path}
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm ${
                isActive(item.path) ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="relative"><Icon className="w-5 h-5 mr-3" />{typeof item.badge === 'number' && item.badge > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">{item.badge}</span>}</div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/teacher/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-blue-600">EduPortal</span>
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-1 px-3 py-4">
        {Object.entries(menuItems).map(([section, items]) => (
          <React.Fragment key={section}>
            {renderSection(section, items)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TeacherSideBar;

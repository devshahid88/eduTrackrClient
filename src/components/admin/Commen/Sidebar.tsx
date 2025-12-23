
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdAssignment, 
  MdGrade,
  MdPeople,
  MdCategory,
  MdClass,
  MdAnnouncement,
  MdLogout,
  MdPerson,
  MdLibraryBooks,
  MdCampaign
} from 'react-icons/md';

interface AdminSideBarProps {
  activePage?: string;
  onClose?: () => void;
}

const AdminSideBar: React.FC<AdminSideBarProps> = ({ activePage, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (activePage) {
      return activePage === path.replace('/admin/', '');
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/auth/admin-login');
  };

  const menuItems = [
    {
      section: 'MAIN',
      items: [
        { name: 'Dashboard', icon: <MdDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
        { name: 'Users', icon: <MdPeople className="w-5 h-5" />, path: '/admin/users' },
        { name: 'Departments', icon: <MdCategory className="w-5 h-5" />, path: '/admin/departments' },
        { name: 'Courses', icon: <MdClass className="w-5 h-5" />, path: '/admin/courses' },
      ],
    },
    {
      section: 'MANAGEMENT',
      items: [
        { name: 'Concerns', icon: <MdAnnouncement className="w-5 h-5" />, path: '/admin/concerns' },
        { name: 'Schedule', icon: <MdGrade className="w-5 h-5" />, path: '/admin/schedule' },
        { name: 'Resources', icon: <MdLibraryBooks className="w-5 h-5" />, path: '/admin/resources' },
        { name: 'Announcements', icon: <MdCampaign className="w-5 h-5" />, path: '/admin/announcements' },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [
        { name: 'Profile', icon: <MdPerson className="w-5 h-5" />, path: '/admin/profile' },
        { name: 'Logout', icon: <MdLogout className="w-5 h-5" />, path: '#' },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-600">EduPortal</h1>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>
      
      <nav className="flex-1 mt-4 overflow-y-auto no-scrollbar">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-6">
            <div className="px-6 mb-2">
              <h2 className="text-xs font-semibold text-gray-500">{section.section}</h2>
            </div>
            {section.items.map((item, itemIndex) => (
              item.name === 'Logout' ? (
                <button
                  key={itemIndex}
                  onClick={handleLogout}
                  className={`flex w-full items-center px-6 py-2.5 text-sm text-gray-700 hover:bg-gray-50`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ) : (
                <Link
                  key={itemIndex}
                  to={item.path}
                  className={`flex items-center px-6 py-2.5 text-sm ${
                    isActive(item.path) ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default AdminSideBar;
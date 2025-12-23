import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import axios from '../../api/axiosInstance';
import { MdMenu } from 'react-icons/md';
import { RootState } from '../../redux/store';
import { HeaderProps, ProfileData } from '../../types/components/common';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

const Header: React.FC<HeaderProps> = ({ role, onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (user) {
          setProfileData({
            name: user.name,
            role: user.role || role,
            avatar: user.profileImage,
            email: user.email,
          });
        }

        const endpointMap: Record<string, string> = {
          admin: `/api/admins/${user?.id}`,
          teacher: `/api/teachers/${user?.id}`,
          student: `/api/students/${user?.id}`,
        };

        const endpoint = endpointMap[role] || `/api/admins/${user?.id}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data?.name) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [role, accessToken, user]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate(`/auth/${role}-login`);
  };

  const userName = profileData?.name || user?.username || 'User';
  const userRole = profileData?.role || user?.role || role || 'user';
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=0D8ABC&color=fff&size=256`;

  if (loading && !profileData) {
    return (
      <header className="flex justify-between items-center px-6 bg-white shadow-sm h-16">
        <div className="animate-pulse flex space-x-4 w-full">
          <div className="h-10 w-72 bg-gray-200 rounded-full" />
          <div className="h-10 w-10 bg-gray-200 rounded-full ml-auto" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 flex justify-between items-center px-6 bg-white shadow-sm h-16 z-30">
      {/* Left Section */}
      <div className="flex items-center">
        <button onClick={onMenuClick} className="lg:hidden mr-4 text-gray-500 hover:text-gray-700">
          <MdMenu size={24} />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-5">
        <NotificationBell
          unreadCount={unreadCount}
          role={role}
          onNavigate={navigate}
        />

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex flex-col items-end mr-2">
              <span className="font-semibold text-sm text-gray-700 capitalize">{displayRole}</span>
              <span className="text-xs text-gray-500">{userName}</span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
              <img
                src={profileData?.avatar || fallbackAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackAvatar;
                }}
              />
            </div>
          </div>

          <ProfileDropdown
            isOpen={showDropdown}
            onClose={() => setShowDropdown(false)}
            profileData={profileData}
            userName={userName}
            displayRole={displayRole}
            role={role}
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

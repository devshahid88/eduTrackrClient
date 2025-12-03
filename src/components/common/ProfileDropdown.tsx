import React from 'react';
import { MdPerson, MdDashboard, MdLogout } from 'react-icons/md';
import { ProfileDropdownProps } from '../../types/components/common';

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  profileData,
  userName,
  displayRole,
  role,
  onNavigate,
  onLogout
}) => {
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=0D8ABC&color=fff&size=256`;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-20">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 mr-3 shrink-0">
            <img
              src={profileData?.avatar || fallbackAvatar}
              alt="Profile"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackAvatar;
              }}
            />
          </div>
          <div className="truncate">
            <div className="font-medium text-sm text-gray-800 truncate">{userName}</div>
            <div className="text-xs text-gray-500 truncate">{profileData?.email}</div>
          </div>
        </div>
      </div>
      <div className="py-1">
        <button
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          onClick={() => onNavigate(`/${role}/profile`)}
        >
          <MdPerson className="mr-2" /> Profile
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          onClick={() => onNavigate(`/${role}/dashboard`)}
        >
          <MdDashboard className="mr-2" /> Dashboard
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
          onClick={onLogout}
        >
          <MdLogout className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;

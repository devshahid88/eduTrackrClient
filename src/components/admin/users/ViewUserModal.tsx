import React from 'react';
import { X, User, Mail, Shield, Calendar, BookOpen, Building, GraduationCap } from 'lucide-react';
import { useViewUser } from '../../../hooks/useViewUser';
import StatusBadge from '../StatusBadge';

interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: 'Student' | 'Teacher' | 'Admin';
  department?: string;
  class?: string;
  courses?: any[];
  isBlock: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

interface ViewUserModalProps {
  user: User | null;
  onClose: () => void;
  className?: string;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ 
  user, 
  onClose,
  className = '' 
}) => {
  const {
    loading,
    error,
    getProcessedCourses,
    getUserDepartment,
    getUserStatus,
    getUserInitials,
    getUserDisplayName
  } = useViewUser(user);

  if (!user) return null;

  const courses = getProcessedCourses();
  const userStatus = getUserStatus();
  const userDepartment = getUserDepartment();
  const userInitials = getUserInitials();
  const userDisplayName = getUserDisplayName();

  // Detail Item Component
  const DetailItem: React.FC<{ 
    label: string; 
    children: React.ReactNode; 
    icon?: React.ReactNode;
    className?: string;
  }> = ({ label, children, icon, className: itemClassName = '' }) => (
    <div className={`flex flex-col space-y-1 ${itemClassName}`}>
      <div className="flex items-center space-x-1">
        {icon}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-gray-900">{children}</div>
    </div>
  );

  // Render courses list
  const renderCourses = () => {
    if (courses.length === 0) {
      return (
        <div className="text-center py-4">
          <BookOpen className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No courses assigned</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {courses.map((course, index) => (
          <div key={course._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <BookOpen size={16} className="text-blue-600" />
              <span className="font-medium text-sm">{course.name}</span>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
              {course.code}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className={`relative max-w-2xl w-full bg-white rounded-lg shadow-xl ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <p className="text-sm text-gray-500">View user information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={userDisplayName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                      <span className="text-lg font-semibold text-blue-600">
                        {userInitials || <User size={24} />}
                      </span>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xl font-semibold text-gray-900 mb-1">
                    {userDisplayName}
                  </h4>
                  <p className="text-gray-600 mb-2">@{user.username}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <StatusBadge
                      status={user.role}
                      variant="info"
                      size="sm"
                    />
                    <StatusBadge
                      status={userStatus.status}
                      variant={userStatus.variant}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Contact Information
                  </h5>
                  
                  <DetailItem
                    label="Email Address"
                    icon={<Mail size={16} className="text-gray-500" />}
                  >
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {user.email}
                    </a>
                  </DetailItem>

                  <DetailItem
                    label="Username"
                    icon={<User size={16} className="text-gray-500" />}
                  >
                    {user.username}
                  </DetailItem>

                  {user.firstname && (
                    <DetailItem label="First Name">
                      {user.firstname}
                    </DetailItem>
                  )}

                  {user.lastname && (
                    <DetailItem label="Last Name">
                      {user.lastname}
                    </DetailItem>
                  )}
                </div>

                {/* Role & Status Information */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Account Information
                  </h5>

                  <DetailItem
                    label="Role"
                    icon={<Shield size={16} className="text-gray-500" />}
                  >
                    <StatusBadge
                      status={user.role}
                      variant="info"
                    />
                  </DetailItem>

                  <DetailItem
                    label="Account Status"
                    icon={<Shield size={16} className="text-gray-500" />}
                  >
                    <StatusBadge
                      status={userStatus.status}
                      variant={userStatus.variant}
                    />
                  </DetailItem>

                  {user.createdAt && (
                    <DetailItem
                      label="Member Since"
                      icon={<Calendar size={16} className="text-gray-500" />}
                    >
                      {formatDate(user.createdAt)}
                    </DetailItem>
                  )}

                  {user.lastLogin && (
                    <DetailItem
                      label="Last Login"
                      icon={<Calendar size={16} className="text-gray-500" />}
                    >
                      {formatDate(user.lastLogin)}
                    </DetailItem>
                  )}
                </div>
              </div>

              {/* Role-specific Information */}
              {(user.role === 'Student' || user.role === 'Teacher') && (
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    {user.role} Information
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem
                      label="Department"
                      icon={<Building size={16} className="text-gray-500" />}
                    >
                      {userDepartment}
                    </DetailItem>

                    {user.role === 'Student' && user.class && (
                      <DetailItem
                        label="Class/Semester"
                        icon={<GraduationCap size={16} className="text-gray-500" />}
                      >
                        {user.class}
                      </DetailItem>
                    )}
                  </div>

                  {/* Courses for Students */}
                  {user.role === 'Student' && (
                    <DetailItem
                      label="Enrolled Courses"
                      icon={<BookOpen size={16} className="text-gray-500" />}
                      className="md:col-span-2"
                    >
                      {renderCourses()}
                    </DetailItem>
                  )}
                </div>
              )}

              {/* Admin Information */}
              {user.role === 'Admin' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h5 className="font-medium text-purple-900">Administrator</h5>
                  </div>
                  <p className="text-sm text-purple-700">
                    This user has administrative privileges and full system access.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              User ID: {user._id || user.id || 'N/A'}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;

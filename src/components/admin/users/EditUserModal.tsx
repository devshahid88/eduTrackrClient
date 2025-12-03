import React from 'react';
import { X } from 'lucide-react';
import { useEditUser } from '../../../hooks/useEditUser';
import ProfileImageUpload from './ProfileImageUpload';
import CourseSelection from './CourseSelection';

interface User {
   _id?: string;
  id?: string;
  username: string;
  email: string;
   role: 'Student' | 'Teacher' | 'Admin'; 
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
  courses?: string[];
  isBlock?: boolean;
  profileImage?: string;
}


// interface User {
//   _id?: string;
//   id?: string;
//   username: string;
//   email: string;
//   firstname?: string;
//   lastname?: string;
//   role: 'Student' | 'Teacher' | 'Admin';
//   department?: string;
//   class?: string;
//   courses?: string[];
//   isBlock: boolean;
//   profileImage?: string;
// }
interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ 
  user, 
  onClose, 
  onSave 
}) => {
  const {
    formData,
    errors,
    loading,
    uploading,
    imagePreview,
    departments,
    filteredCourses,
    selectedCourses,
    availableClasses,
    handleInputChange,
    handleCourseSelection,
    handleImageChange,
    handleSave
  } = useEditUser(user, onSave);

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit User Details</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-500 hover:text-black p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={uploading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <form className="space-y-4 overflow-y-auto max-h-[70vh] px-1">
            {/* Profile Image Upload */}
            <ProfileImageUpload
              currentImage={imagePreview}
              onImageChange={handleImageChange}
              uploading={uploading}
            />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className={`border rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstname ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.firstname && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstname}</p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className={`border rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastname ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.lastname && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastname}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`border rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`border rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Student-specific fields */}
            {formData.role === 'Student' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">Student Information</h4>
                
                <div className="space-y-4">
                  {/* Department */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`border rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-xs text-red-500 mt-1">{errors.department}</p>
                    )}
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className={`border rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.class ? 'border-red-500' : 'border-gray-300'
                      } ${!formData.department ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={!formData.department}
                    >
                      <option value="">Select Semester</option>
                      {availableClasses.map((cls, index) => (
                        <option key={index} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                    {errors.class && (
                      <p className="text-xs text-red-500 mt-1">{errors.class}</p>
                    )}
                    {!formData.department && (
                      <p className="text-xs text-blue-600 mt-1">Please select a department first</p>
                    )}
                  </div>

                  {/* Courses */}
                  <CourseSelection
                    courses={filteredCourses}
                    selectedCourses={selectedCourses}
                    onCourseToggle={handleCourseSelection}
                    disabled={!formData.class}
                    error={errors.courses}
                    title="Courses"
                    subtitle="Select courses for this student"
                    required
                  />
                </div>
              </div>
            )}

            {/* Teacher-specific fields */}
            {formData.role === 'Teacher' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-3">Teacher Information</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-xs text-red-500 mt-1">{errors.department}</p>
                  )}
                </div>
              </div>
            )}

            {/* Admin info */}
            {formData.role === 'Admin' && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-3">Admin Information</h4>
                <p className="text-sm text-purple-700">
                  Admin users have full system access and can manage all users and settings.
                </p>
              </div>
            )}

            {/* Block/Unblock User */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBlock"
                  name="isBlock"
                  checked={formData.isBlock}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isBlock" className="text-sm font-medium text-gray-700">
                  Block User
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-1 ml-6">
                Blocked users cannot log in to the system
              </p>
            </div>

            {/* General Error Display */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={uploading}
                className={`bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  uploading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;

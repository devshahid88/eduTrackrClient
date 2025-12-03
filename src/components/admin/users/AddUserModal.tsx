import React from 'react';
import { X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AddUserModalProps } from '../../../types/components/user';
import { useAddUser } from '../../../hooks/useAddUser';
import ProfileImageUpload from './ProfileImageUpload';
import CourseSelection from './CourseSelection';
import UserFormField from './UserFormField';

const AddUserModal: React.FC<AddUserModalProps> = ({ 
  onClose, 
  onSave,
  loading: externalLoading = false,
  className = '' 
}) => {
  const {
    formData,
    errors,
    loading,
    uploading,
    serverError,
    imagePreview,
    departments,
    filteredCourses,
    selectedCourses,
    availableClasses,
    handleInputChange,
    handleCourseSelection,
    handleImageChange,
    handleSubmit
  } = useAddUser(onSave, onClose);

  // Prepare options for select fields
  const departmentOptions = [
    { value: '', label: 'Select Department' },
    ...departments.map(dept => ({
      value: dept._id,
      label: dept.name
    }))
  ];

  const classOptions = [
    { value: '', label: 'Select Semester' },
    ...availableClasses.map(cls => ({
      value: cls,
      label: cls
    }))
  ];

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Admin' }
  ];

  const isFormLoading = loading || externalLoading;

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative ${className}`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
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

          {/* Server Error Display */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {serverError}
            </div>
          )}

          {/* Loading State */}
          {isFormLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[70vh] px-1">
              {/* Profile Image Upload */}
              <ProfileImageUpload
                currentImage={imagePreview}
                onImageChange={handleImageChange}
                uploading={uploading}
              />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UserFormField
                  name="firstName"
                  label="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={errors.firstName}
                  required
                />
                <UserFormField
                  name="lastName"
                  label="Last Name"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={errors.lastName}
                  required
                />
              </div>

              <UserFormField
                name="username"
                label="Username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
                placeholder="Enter username (min 3 characters)"
                required
              />

              <UserFormField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="Enter email address"
                required
              />

              <UserFormField
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Enter password (min 6 characters)"
                required
              />

              <UserFormField
                name="role"
                label="Role"
                type="select"
                value={formData.role}
                onChange={handleInputChange}
                options={roleOptions}
                required
              />

              {/* Role-specific sections */}
              {formData.role === 'student' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Student Information</h4>
                  
                  <div className="space-y-4">
                    <UserFormField
                      name="department"
                      label="Department"
                      type="select"
                      value={formData.department}
                      onChange={handleInputChange}
                      options={departmentOptions}
                      error={errors.department}
                      required
                    />

                    <UserFormField
                      name="class"
                      label="Semester"
                      type="select"
                      value={formData.class}
                      onChange={handleInputChange}
                      options={classOptions}
                      error={errors.class}
                      disabled={!formData.department}
                      required
                    />

                    {!formData.department && (
                      <p className="text-xs text-blue-600">Please select a department first</p>
                    )}

                    <CourseSelection
                      courses={filteredCourses}
                      selectedCourses={selectedCourses}
                      onCourseToggle={handleCourseSelection}
                      disabled={!formData.class}
                      error={errors.courses}
                    />
                  </div>
                </div>
              )}

              {formData.role === 'teacher' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Teacher Information</h4>
                  
                  <UserFormField
                    name="department"
                    label="Department"
                    type="select"
                    value={formData.department}
                    onChange={handleInputChange}
                    options={departmentOptions}
                    error={errors.department}
                    required
                  />
                </div>
              )}

              {formData.role === 'admin' && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-3">Admin Information</h4>
                  <p className="text-sm text-purple-700">
                    Admin users have full system access and can manage all users and settings.
                  </p>
                </div>
              )}

              {/* User Status */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <UserFormField
                  name="isActive"
                  label="Active User"
                  type="checkbox"
                  value={formData.isActive}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Inactive users cannot log in to the system
                </p>
              </div>

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
                  type="submit"
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
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AddUserModal;

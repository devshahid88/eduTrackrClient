import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import Header from '../../components/teacher/common/Header';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { 
  MdMenu, 
  MdEdit, 
  MdSave, 
  MdCancel, 
  MdCameraAlt, 
  MdPerson, 
  MdEmail, 
  MdSchool, 
  MdAccountCircle,
  MdBadge,
  MdVerifiedUser
} from 'react-icons/md';
import { RootState } from '../../redux/store';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { user: teacher } = useSelector((state:RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editData, setEditData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    profileImage: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!teacher?.id) {
      navigate('/auth/teacher-login');
      return;
    }
    setEditData({
      username: teacher.username || '',
      firstname: teacher.firstname || '',
      lastname: teacher.lastname || '',
      email: teacher.email || '',
      profileImage: teacher.profileImage || '',
    });
    setLoading(false);
  }, [navigate, teacher]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setEditData(prev => ({
        ...prev,
        profileImage: URL.createObjectURL(file)
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      
      if (!teacher?.id) {
        toast.error('Teacher ID not found');
        return;
      }

      // Validate inputs
      if (!editData.firstname.trim() || !editData.lastname.trim()) {
        toast.error('First name and last name are required');
        return;
      }

      if (!editData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (!editData.username.trim()) {
        toast.error('Username is required');
        return;
      }

      let profileImageUrl = editData.profileImage;

      // If a new image is selected, upload it
      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        const imageRes = await axios.put(
          `http://localhost:3000/api/teachers/${teacher.id}/profile-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        profileImageUrl = imageRes.data?.data?.profileImage || profileImageUrl;
      }

      // Update the rest of the profile
      const updateData = {
        username: editData.username.trim(),
        firstname: editData.firstname.trim(),
        lastname: editData.lastname.trim(),
        email: editData.email.trim(),
        profileImage: profileImageUrl,
      };

      await axios.put(
        `http://localhost:3000/api/teachers/${teacher.id}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setImageFile(null);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: teacher?.username || '',
      firstname: teacher?.firstname || '',
      lastname: teacher?.lastname || '',
      email: teacher?.email || '',
      profileImage: teacher?.profileImage || '',
    });
    setImageFile(null);
    setIsEditing(false);
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher?.firstname || '')}+${encodeURIComponent(teacher?.lastname || '')}&background=35828C&color=fff&size=256`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgba(53,130,140,0.9)] mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Teacher Not Found</h2>
          <p className="text-gray-600">Please log in again to access your profile.</p>
          <button 
            onClick={() => navigate('/auth/teacher-login')}
            className="mt-4 bg-[rgba(53,130,140,0.9)] text-white px-6 py-2 rounded-lg hover:bg-[rgba(53,130,140,1)] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl`}
      >
        <TeacherSideBar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-white shadow-sm p-4 md:hidden border-b">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdMenu size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
          <div className="w-8"></div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-[rgba(53,130,140,0.8)] to-[rgba(53,130,140,1)] h-32 md:h-40 relative">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <img
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      src={editData.profileImage || fallbackAvatar}
                      alt="Teacher Profile"
                      onError={(e:any) => {
                        e.target.onerror = null;
                        e.target.src = fallbackAvatar;
                      }}
                    />
                    {isEditing && (
                      <label className="absolute bottom-2 right-2 bg-[rgba(53,130,140,0.9)] text-white p-2 rounded-full cursor-pointer hover:bg-[rgba(53,130,140,1)] transition-colors shadow-lg">
                        <MdCameraAlt size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-20 pb-6 px-6 text-center">
                <div className="flex justify-center mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <MdVerifiedUser className="mr-1" size={16} />
                    {teacher.role || 'Teacher'}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {editData.firstname} {editData.lastname}
                </h1>
                <p className="text-gray-600 mb-1">@{editData.username}</p>
                <p className="text-gray-600 mb-4">{editData.email}</p>
                
                {/* Action Buttons */}
                <div className="flex justify-center space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200"
                      >
                        <MdSave size={18} />
                        <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={updating}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200"
                      >
                        <MdCancel size={18} />
                        <span>Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-[rgba(53,130,140,0.9)] hover:bg-[rgba(53,130,140,1)] text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <MdEdit size={18} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <MdPerson className="mr-2 text-[rgba(53,130,140,0.9)]" />
                  Personal Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <MdAccountCircle className="mr-1" />
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(53,130,140,0.9)] focus:border-transparent transition-all"
                        placeholder="Enter username"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-800">@{editData.username}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.firstname}
                          onChange={(e) => setEditData(prev => ({ ...prev, firstname: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(53,130,140,0.9)] focus:border-transparent transition-all"
                          placeholder="Enter first name"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{editData.firstname}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.lastname}
                          onChange={(e) => setEditData(prev => ({ ...prev, lastname: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(53,130,140,0.9)] focus:border-transparent transition-all"
                          placeholder="Enter last name"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{editData.lastname}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <MdEmail className="mr-1" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(53,130,140,0.9)] focus:border-transparent transition-all"
                        placeholder="Enter email address"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{editData.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <MdSchool className="mr-2 text-[rgba(53,130,140,0.9)]" />
                  Professional Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <MdBadge className="mr-1" />
                      Role
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <MdVerifiedUser className="mr-1" size={16} />
                        {teacher.role || 'Teacher'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Department</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 font-medium">
                        {teacher.department || 'Not assigned'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Department is managed by administration
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Teaching Status</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-gray-800 font-medium">Active</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Profile last updated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
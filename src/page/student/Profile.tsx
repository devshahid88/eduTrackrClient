import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MdEdit, MdSave, MdCancel, MdCameraAlt, MdPerson, MdEmail, MdSchool, MdClass, MdBook } from 'react-icons/md';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user: student } = useSelector((state:any) => state.auth);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [editFirstname, setEditFirstname] = useState('');
  const [editLastname, setEditLastname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!student?.id) {
      navigate('/auth/student-login');
      return;
    }

    setEditFirstname(student.firstname || '');
    setEditLastname(student.lastname || '');
    setEditEmail(student.email || '');
    setEditProfileImage(student.profileImage || '');
    setLoading(false);
  }, [navigate, student]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setImageFile(file);
      setEditProfileImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      if (!student?.id) {
        toast.error('Student ID not found');
        return;
      }
      if (!editFirstname.trim() || !editLastname.trim()) {
        toast.error('First name and last name are required');
        return;
      }
      if (!editEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }
      const formData = new FormData();
      formData.append('firstname', editFirstname.trim());
      formData.append('lastname', editLastname.trim());
      formData.append('email', editEmail.trim());
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }
      if (imageFile) {
        const imageResponse = await axiosInstance.put(
          `/api/students/${student.id}/profile-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (imageResponse.data?.data?.profileImage) {
          setEditProfileImage(imageResponse.data.data.profileImage);
        }
      }
      const updateData = {
        firstname: editFirstname.trim(),
        lastname: editLastname.trim(),
        email: editEmail.trim(),
        profileImage: editProfileImage,
      };
      const response = await axiosInstance.put(
        `/api/students/${student.id}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setImageFile(null);
      }
    } catch (err:any) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditFirstname(student.firstname || '');
    setEditLastname(student.lastname || '');
    setEditEmail(student.email || '');
    setEditProfileImage(student.profileImage || '');
    setImageFile(null);
    setIsEditing(false);
  };

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

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600">Please log in again to access your profile.</p>
          <button 
            onClick={() => navigate('/auth/student-login')}
            className="mt-4 bg-[rgba(53,130,140,0.9)] text-white px-6 py-2 rounded-lg hover:bg-[rgba(53,130,140,1)] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-10 space-y-12 animate-in fade-in duration-700 pb-24">
      <Toaster position="top-right" />
      
      {/* Header Profile Section */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center p-12 relative">
          {/* Decorative background accent */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-[0.03]" />
          
          <div className="relative mb-8">
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-xl group">
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={editProfileImage || 'https://i.pravatar.cc/150'}
                alt="Student Profile"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <MdCameraAlt className="text-white w-8 h-8" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
              {editFirstname} {editLastname}
            </h1>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">
              Student Portal Profile
            </p>
          </div>

          <div className="mt-10 flex gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <MdSave className="w-4 h-4" />
                  {updating ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updating}
                  className="px-8 py-3 bg-white border border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2"
                >
                  <MdCancel className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-10 py-4 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 flex items-center gap-2"
              >
                <MdEdit className="w-4 h-4 text-blue-400" />
                Edit Account Settings
              </button>
            )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Personal Details */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-8">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <MdPerson className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Identity Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField label="First Name" value={editFirstname} isEditing={isEditing} onChange={setEditFirstname} />
                <ProfileField label="Last Name" value={editLastname} isEditing={isEditing} onChange={setEditLastname} />
            </div>
            <ProfileField label="Email Address" value={editEmail} isEditing={isEditing} onChange={setEditEmail} />
        </div>

        {/* Academic Details */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 space-y-8">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <MdSchool className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Academic Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Department</span>
                  <div className="px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border border-transparent italic">
                      {student.departmentName || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Curriculum Class</span>
                  <div className="px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border border-transparent italic">
                      {student.class || 'Level 1'}
                  </div>
                </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 px-1">Enrollment Modules</span>
              <div className="space-y-3">
                {student.courses && student.courses.length > 0 ? (
                    student.courses.map((course: any) => (
                      <div key={course.id} className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-2xl group hover:bg-white hover:border-blue-100 border border-transparent transition-all">
                        <span className="font-black text-gray-700 tracking-tight">{course.name}</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                          {course.code}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-center py-6 text-gray-400 font-bold text-sm bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    No active enrollments found.
                  </p>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, isEditing, onChange }: any) => (
  <div>
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
      {label}
    </label>
    {isEditing ? (
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-gray-700 outline-none shadow-inner"
      />
    ) : (
      <div className="px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border border-transparent shadow-inner">
        {value}
      </div>
    )}
  </div>
);

export default StudentProfile;
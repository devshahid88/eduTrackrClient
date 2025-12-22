import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MdEdit, MdSave, MdCancel, MdCameraAlt, MdPerson, MdEmail, MdAdminPanelSettings } from 'react-icons/md';

// Interface definitions
interface Admin {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  profileImage?: string;
  role: string;
}

interface RootState {
  auth: {
    user: Admin | null;
  };
}

interface EditData {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  profileImage: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const AdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: admin } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<EditData>({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    profileImage: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!admin?.id) {
      navigate('/auth/admin-login');
      return;
    }
    setEditData({
      username: admin.username || '',
      firstname: admin.firstname || '',
      lastname: admin.lastname || '',
      email: admin.email || '',
      profileImage: admin.profileImage || '',
    });
    setLoading(false);
  }, [navigate, admin]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
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
      setEditData((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleUpdate = async (): Promise<void> => {
    try {
      setUpdating(true);
      if (!admin?.id) {
        toast.error('Admin ID not found');
        return;
      }
      if (!editData.firstname.trim() || !editData.lastname.trim() || !editData.username.trim()) {
        toast.error('Username, first name, and last name are required');
        return;
      }
      if (!editData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      let profileImageUrl = editData.profileImage;
      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);
        const imageRes = await axios.put<ApiResponse<{ profileImage: string }>>(
          `http://localhost:3000/api/admins/${admin.id}/profile-image`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        profileImageUrl = imageRes.data?.data?.profileImage || profileImageUrl;
      }

      const updateData: EditData = {
        username: editData.username.trim(),
        firstname: editData.firstname.trim(),
        lastname: editData.lastname.trim(),
        email: editData.email.trim(),
        profileImage: profileImageUrl,
      };

      const response = await axios.put<ApiResponse<Admin>>(
        `http://localhost:3000/api/admins/${admin.id}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setImageFile(null);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = (): void => {
    setEditData({
      username: admin?.username || '',
      firstname: admin?.firstname || '',
      lastname: admin?.lastname || '',
      email: admin?.email || '',
      profileImage: admin?.profileImage || '',
    });
    setImageFile(null);
    setIsEditing(false);
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    admin?.firstname || ''
  )}+${encodeURIComponent(admin?.lastname || '')}&background=3B82F6&color=fff&size=256`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Not Found</h2>
          <p className="text-gray-600">Please log in again to access your profile.</p>
          <button
            onClick={() => navigate('/auth/admin-login')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 md:h-40 relative">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <img
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                    src={editData.profileImage || fallbackAvatar}
                    alt="Admin Profile"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackAvatar;
                    }}
                  />
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {editData.firstname} {editData.lastname}
              </h1>
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mb-4">
                <MdAdminPanelSettings className="mr-1" />
                {admin.role}
              </div>
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
                      onClick={handleCancelEdit}
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
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <MdEdit size={18} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <MdPerson className="mr-2 text-blue-600" />
              Admin Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['username', 'firstname', 'lastname', 'email'] as (keyof EditData)[]).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center">
                    {field === 'email' ? <MdEmail className="mr-1" /> : <MdPerson className="mr-1" />}
                    {field === 'firstname'
                      ? 'First Name'
                      : field === 'lastname'
                      ? 'Last Name'
                      : field === 'email'
                      ? 'Email Address'
                      : 'Username'}
                  </label>
                  {isEditing ? (
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={editData[field]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditData((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder={`Enter ${field}`}
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-800">{editData[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
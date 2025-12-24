import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MdEdit, MdSave, MdCancel, MdCameraAlt, MdPerson, MdEmail, MdAdminPanelSettings, MdShield } from 'react-icons/md';

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
        const imageRes = await axiosInstance.put<ApiResponse<{ profileImage: string }>>(
          `/api/admins/${admin.id}/profile-image`,
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

      const response = await axiosInstance.put<ApiResponse<Admin>>(
        `/api/admins/${admin.id}`,
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
      <div className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Branded Identity Shield Backdrop */}
          <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 h-64 md:h-80 group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
               <MdAdminPanelSettings size={300} className="text-white" />
            </div>
            
            <div className="relative pt-40 pb-12 px-10 text-center md:text-left flex flex-col md:flex-row items-end gap-8">
              <div className="relative mx-auto md:mx-0">
                <div className="p-2 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <img
                    className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] object-cover shadow-2xl"
                    src={editData.profileImage || fallbackAvatar}
                    alt="Admin Profile"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackAvatar;
                    }}
                  />
                  {isEditing && (
                    <label className="absolute -bottom-4 -right-4 bg-indigo-600 text-white p-4 rounded-2xl cursor-pointer hover:bg-gray-900 transition-all shadow-2xl hover:scale-110 active:scale-95 border-4 border-white">
                      <MdCameraAlt size={20} />
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex-grow space-y-4 pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-md text-indigo-200 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-400/30">
                  <MdShield className="w-3 h-3" />
                  System Administrator
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl">
                    {editData.firstname} <span className="text-indigo-400">{editData.lastname}</span>
                  </h1>
                  <p className="text-indigo-200/60 font-medium mt-2">Active session protocol authorized for registry control.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pb-4 w-full md:w-auto">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      disabled={updating}
                      className="flex items-center justify-center gap-3 bg-white text-indigo-950 hover:bg-indigo-50 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      <MdSave size={20} />
                      {updating ? 'Processing...' : 'Sync Profile'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updating}
                      className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/20 transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      <MdCancel size={20} />
                      Abort Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-3 bg-white text-indigo-950 hover:bg-indigo-50 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 border-b-4 border-indigo-200"
                  >
                    <MdEdit size={20} />
                    Modify Identity
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Identity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-8">
               <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                       <MdPerson size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-gray-900 tracking-tight">Personal Telemetry</h2>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Core Identity Parameters</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {(['firstname', 'lastname', 'username', 'email'] as (keyof EditData)[]).map((field) => (
                     <div key={field} className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                         {field.replace(/([A-Z])/g, ' $1').trim()}
                       </label>
                       {isEditing ? (
                         <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors">
                               {field === 'email' ? <MdEmail /> : <MdPerson />}
                            </div>
                            <input
                              type={field === 'email' ? 'email' : 'text'}
                              value={editData[field]}
                              onChange={(e) => setEditData((prev) => ({ ...prev, [field]: e.target.value }))}
                              className="w-full pl-12 pr-6 py-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                         </div>
                       ) : (
                         <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-50 text-gray-700 font-black text-sm">
                           {editData[field]}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             <div className="space-y-8">
                <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                   <div className="relative space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                         <MdShield size={32} className="text-indigo-400" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black tracking-tight">Security Protocol</h3>
                         <p className="text-indigo-200/40 text-xs font-medium mt-1">Platform authority level</p>
                      </div>
                      <div className="pt-6 border-t border-white/10 space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-300/60">
                            <span>Status</span>
                            <span className="text-emerald-400">Authenticated</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-300/60">
                            <span>Clearance</span>
                            <span>Level Alpha</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-300/60">
                            <span>Registry ID</span>
                            <span className="font-mono">{admin.id.slice(-8).toUpperCase()}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminProfile;
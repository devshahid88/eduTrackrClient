import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  MdEdit,
  MdSave,
  MdCancel,
  MdCameraAlt,
  MdPerson,
  MdEmail,
  MdSchool,
  MdAccountCircle,
  MdBadge,
  MdVerifiedUser,
  MdSecurity
} from "react-icons/md";
import { RootState } from "../../redux/store";

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { user: teacher } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [editData, setEditData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    profileImage: "",
  });

  useEffect(() => {
    if (!teacher?.id) {
      navigate("/teacher/login");
      return;
    }

    setEditData({
      username: teacher.username || "",
      firstname: teacher.firstname || "",
      lastname: teacher.lastname || "",
      email: teacher.email || "",
      profileImage: teacher.profileImage || "",
    });

    setLoading(false);
  }, [teacher, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid image file type");
      return;
    }

    setImageFile(file);
    setEditData(prev => ({
      ...prev,
      profileImage: URL.createObjectURL(file),
    }));
  };

  const handleUpdate = async () => {
    if (!teacher?.id) return;

    if (!editData.firstname || !editData.lastname || !editData.username) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setUpdating(true);

      let profileImageUrl = editData.profileImage;

      if (imageFile) {
        const fd = new FormData();
        fd.append("profileImage", imageFile);

        const imgRes = await axios.put(
          `http://localhost:3000/api/teachers/${teacher.id}/profile-image`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        profileImageUrl = imgRes.data?.data?.profileImage;
      }

      await axios.put(`http://localhost:3000/api/teachers/${teacher.id}`, {
        ...editData,
        profileImage: profileImageUrl,
      });

      toast.success("Profile updated successfully");
      setIsEditing(false);
      setImageFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Profile update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: teacher?.username || "",
      firstname: teacher?.firstname || "",
      lastname: teacher?.lastname || "",
      email: teacher?.email || "",
      profileImage: teacher?.profileImage || "",
    });
    setImageFile(null);
    setIsEditing(false);
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    teacher?.firstname || ""
  )}+${encodeURIComponent(teacher?.lastname || "")}&background=3b82f6&color=fff&size=256&bold=true`;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 animate-pulse font-medium text-sm">Accessing identity records...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="px-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Teacher Account</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your professional identity and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card & Bio */}
        <div className="lg:col-span-1 border-gray-100 h-fit space-y-8">
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group">
              <div className="h-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative">
                 <div className="absolute top-4 right-4 text-white/20 select-none">
                    <MdSecurity className="text-6xl" />
                 </div>
              </div>
              <div className="px-8 pb-10 flex flex-col items-center -mt-16 relative">
                 <div className="relative">
                    <img
                      src={editData.profileImage || fallbackAvatar}
                      className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-xl object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Profile"
                    />
                    {isEditing && (
                      <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-lg border-2 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all">
                        <MdCameraAlt />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                 </div>

                 <div className="mt-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3 border border-blue-100">
                      <MdVerifiedUser /> Verified Educator
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                       {editData.firstname} {editData.lastname}
                    </h2>
                    <p className="text-sm font-bold text-gray-400 mt-2">@{editData.username}</p>
                 </div>

                 <div className="w-full h-[1px] bg-gray-50 my-8"></div>

                 <div className="flex gap-4 w-full">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          disabled={updating}
                          className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                          <span className="flex items-center justify-center gap-2"><MdSave /> Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          <span className="flex items-center justify-center gap-2"><MdCancel /> Cancel</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-blue-600 text-white px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <span className="flex items-center justify-center gap-2"><MdEdit className="text-base" /> Edit Identity</span>
                      </button>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Detailed Form Section */}
        <div className="lg:col-span-2 space-y-10">
           {/* Section 1: Core Fields */}
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-sm">👤</div>
                 Identity Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                    <div className="relative">
                       <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         disabled={!isEditing}
                         value={editData.firstname}
                         onChange={(e) => setEditData({...editData, firstname: e.target.value})}
                         className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                    <div className="relative">
                       <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         disabled={!isEditing}
                         value={editData.lastname}
                         onChange={(e) => setEditData({...editData, lastname: e.target.value})}
                         className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unique Username</label>
                    <div className="relative">
                       <MdAccountCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         disabled={!isEditing}
                         value={editData.username}
                         onChange={(e) => setEditData({...editData, username: e.target.value})}
                         className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Faculty Email</label>
                    <div className="relative">
                       <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         disabled
                         value={editData.email}
                         className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl font-bold text-gray-400 cursor-not-allowed"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 2: Organizational Info */}
           <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 p-10">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm">🏢</div>
                 Faculty Placement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-5">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
                        <MdBadge />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Role</p>
                        <p className="font-black text-gray-900">{teacher?.role || "Faculty Member"}</p>
                     </div>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-5">
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
                        <MdSchool />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Department</p>
                        <p className="font-black text-gray-900">{teacher?.department || teacher?.departmentName || "Science & Arts"}</p>
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

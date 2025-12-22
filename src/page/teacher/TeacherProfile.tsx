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
      navigate("/auth/teacher-login");
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
      toast.error("Invalid image file");
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
      toast.error("All fields are required");
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

      toast.success("Profile updated");
      setIsEditing(false);
      setImageFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
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
  )}+${encodeURIComponent(teacher?.lastname || "")}&background=35828C&color=fff&size=256`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 relative">
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="relative">
              <img
                src={editData.profileImage || fallbackAvatar}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
                alt="Profile"
              />
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
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
          </div>
        </div>

        <div className="pt-20 pb-6 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 mb-3">
            <MdVerifiedUser className="mr-1" /> Teacher
          </span>

          <h1 className="text-2xl font-bold">
            {editData.firstname} {editData.lastname}
          </h1>
          <p className="text-gray-600">@{editData.username}</p>
          <p className="text-gray-600">{editData.email}</p>

          <div className="mt-4 flex justify-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="bg-green-600 text-white px-5 py-2 rounded-full flex items-center gap-2"
                >
                  <MdSave /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-5 py-2 rounded-full flex items-center gap-2"
                >
                  <MdCancel /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
              >
                <MdEdit /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <MdPerson className="mr-2" /> Personal Info
          </h2>
          <p><MdAccountCircle className="inline mr-1" /> {editData.username}</p>
          <p><MdEmail className="inline mr-1" /> {editData.email}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <MdSchool className="mr-2" /> Professional Info
          </h2>
          <p><MdBadge className="inline mr-1" /> {teacher?.role || "Teacher"}</p>
          <p>Department: {teacher?.department || "Not assigned"}</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;

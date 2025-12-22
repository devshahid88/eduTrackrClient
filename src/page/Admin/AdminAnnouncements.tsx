import React, { useState, useEffect } from 'react';
import { announcementApi } from '../../api/announcementApi';
import { 
  MdAdd, 
  MdDelete,
  MdEdit, 
  MdCampaign,
  MdPeople,
  MdSchool,
  MdAdminPanelSettings
} from 'react-icons/md';
import { toast } from 'react-toastify';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  targetRoles: ('Teacher' | 'Student' | 'Admin')[];
  createdAt: string;
}

const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement>>({
    targetRoles: ['Student']
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementApi.getAllAnnouncements();
      if (response.success) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentAnnouncement._id) {
        await announcementApi.updateAnnouncement(currentAnnouncement._id, currentAnnouncement);
        toast.success('Announcement updated successfully');
      } else {
        await announcementApi.createAnnouncement(currentAnnouncement);
        toast.success('Announcement posted successfully');
      }
      setIsModalOpen(false);
      setCurrentAnnouncement({ targetRoles: ['Student'] });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementApi.deleteAnnouncement(id);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Failed to delete announcement');
      }
    }
  };

  const toggleRole = (role: 'Teacher' | 'Student' | 'Admin') => {
    const roles = currentAnnouncement.targetRoles || [];
    if (roles.includes(role)) {
      setCurrentAnnouncement({
        ...currentAnnouncement,
        targetRoles: roles.filter(r => r !== role)
      });
    } else {
      setCurrentAnnouncement({
        ...currentAnnouncement,
        targetRoles: [...roles, role]
      });
    }
  };

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setCurrentAnnouncement(announcement);
    } else {
      setCurrentAnnouncement({ targetRoles: ['Student'] });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-sm text-gray-500">Broadcast messages to students, teachers, or admins</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <MdAdd className="w-5 h-5 mr-2" />
          Make Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <div key={announcement._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="p-3 bg-purple-50 rounded-lg h-fit">
                  <MdCampaign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{announcement.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">{announcement.message}</p>
                  
                  <div className="flex gap-2">
                    {announcement.targetRoles.map(role => (
                      <span key={role} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                        {role === 'Student' && <MdSchool className="w-3 h-3 mr-1" />}
                        {role === 'Teacher' && <MdPeople className="w-3 h-3 mr-1" />}
                        {role === 'Admin' && <MdAdminPanelSettings className="w-3 h-3 mr-1" />}
                        {role}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400 self-center ml-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openModal(announcement)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <MdEdit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(announcement._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{currentAnnouncement._id ? 'Edit Announcement' : 'New Announcement'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={currentAnnouncement.title || ''}
                  onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  value={currentAnnouncement.message || ''}
                  onChange={(e) => setCurrentAnnouncement({...currentAnnouncement, message: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="flex gap-3">
                  {['Student', 'Teacher', 'Admin'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                        currentAnnouncement.targetRoles?.includes(role as any)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                {(!currentAnnouncement.targetRoles || currentAnnouncement.targetRoles.length === 0) && (
                  <p className="text-xs text-red-500 mt-1">Select at least one target audience</p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!currentAnnouncement.targetRoles?.length}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;

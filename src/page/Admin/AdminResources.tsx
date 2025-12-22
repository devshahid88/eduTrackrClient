import React, { useState, useEffect } from 'react';
import { resourceApi } from '../../api/resourceApi';
import { 
  MdAdd, 
  MdDelete, // Using MdDelete instead of MdDeleteOutline based on previous usage
  MdEdit, 
  MdSearch, 
  MdFilterList,
  MdDownload,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdLink
} from 'react-icons/md';
// Using basic alerts/confirms instead of external libraries for simplicity if not already integrated extensively?
// Actually package.json showed sweetalert2, let's use standard window.confirm for now or simple UI state to keep it robust
import { toast } from 'react-toastify';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
  role: 'Teacher' | 'Student' | 'Admin';
  createdAt: string;
}

const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({ type: 'pdf', role: 'Student' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourceApi.getAllResources();
      if (response.success) {
        setResources(response.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentResource._id) {
        await resourceApi.updateResource(currentResource._id, currentResource);
        toast.success('Resource updated successfully');
      } else {
        await resourceApi.createResource(currentResource);
        toast.success('Resource created successfully');
      }
      setIsModalOpen(false);
      setCurrentResource({ type: 'pdf', role: 'Student' });
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceApi.deleteResource(id);
        toast.success('Resource deleted successfully');
        fetchResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('Failed to delete resource');
      }
    }
  };

  const openModal = (resource?: Resource) => {
    if (resource) {
      setCurrentResource(resource);
    } else {
      setCurrentResource({ type: 'pdf', role: 'Student' });
    }
    setIsModalOpen(true);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Learning Resources</h1>
          <p className="text-sm text-gray-500">Manage educational materials for students and teachers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <MdAdd className="w-5 h-5 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-400 w-5 h-5" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="video">Videos</option>
            <option value="link">External Links</option>
          </select>
        </div>
      </div>

      {/* Resource List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                {resource.type === 'pdf' && <MdPictureAsPdf className="w-6 h-6 text-red-500" />}
                {resource.type === 'video' && <MdVideoLibrary className="w-6 h-6 text-blue-500" />}
                {resource.type === 'link' && <MdLink className="w-6 h-6 text-green-500" />}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal(resource)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <MdEdit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(resource._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">{resource.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{resource.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
              <span className="bg-gray-100 px-2 py-1 rounded capitalize">{resource.role}</span>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:underline"
              >
                Open <MdDownload className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{currentResource._id ? 'Edit Resource' : 'Add New Resource'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={currentResource.title || ''}
                  onChange={(e) => setCurrentResource({...currentResource, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={currentResource.description || ''}
                  onChange={(e) => setCurrentResource({...currentResource, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={currentResource.type}
                    onChange={(e) => setCurrentResource({...currentResource, type: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={currentResource.role}
                    onChange={(e) => setCurrentResource({...currentResource, role: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  required
                  value={currentResource.url || ''}
                  onChange={(e) => setCurrentResource({...currentResource, url: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;

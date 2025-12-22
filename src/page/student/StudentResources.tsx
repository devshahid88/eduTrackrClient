import React, { useState, useEffect } from 'react';
import { resourceApi } from '../../api/resourceApi';
import { 
  MdSearch, 
  MdFilterList,
  MdDownload,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdLink
} from 'react-icons/md';
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

const StudentResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const response = await resourceApi.getAllResources();
      if (response.success) {
        setResources(response.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-sm text-gray-500">Access educational materials and study guides</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-400 w-5 h-5" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="video">Videos</option>
            <option value="link">External Links</option>
          </select>
        </div>
      </div>

      {/* Resource List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  {resource.type === 'pdf' && <MdPictureAsPdf className="w-6 h-6 text-red-500" />}
                  {resource.type === 'video' && <MdVideoLibrary className="w-6 h-6 text-blue-500" />}
                  {resource.type === 'link' && <MdLink className="w-6 h-6 text-green-500" />}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">{resource.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{resource.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">Study Material</span>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
                >
                  Download / View <MdDownload className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
          <MdLibraryBooks className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No resources available</h3>
          <p className="text-gray-500">Check back later for new study materials</p>
        </div>
      )}
    </div>
  );
};

const MdLibraryBooks = (props: any) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="none" d="M0 0h24v24H0V0z"></path><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"></path>
  </svg>
);

export default StudentResources;

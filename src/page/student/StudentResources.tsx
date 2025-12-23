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
    <div className="container mx-auto px-4 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Learning Hub</h1>
          <p className="text-gray-500 font-medium mt-1">Curated educational materials and resources.</p>
        </div>
      </div>

      {/* Modern Search & Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm items-center">
        <div className="lg:col-span-3 relative group">
          <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-6 h-6 transition-colors" />
          <input
            type="text"
            placeholder="Search for study material, videos, or links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 rounded-2xl transition-all font-bold text-gray-700 outline-none"
          />
        </div>
        <div className="relative group">
          <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest text-gray-700 outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Material</option>
            <option value="pdf">PDF Docs</option>
            <option value="video">Videos</option>
            <option value="link">Web Links</option>
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white h-64 rounded-[2.5rem] border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
          {filteredResources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                <div className={`h-2 ${
                    resource.type === 'pdf' ? 'bg-rose-500' : 
                    resource.type === 'video' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`} />
                
                <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${
                            resource.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 
                            resource.type === 'video' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
                        } transition-colors group-hover:bg-opacity-80`}>
                            {resource.type === 'pdf' && <MdPictureAsPdf className="w-8 h-8" />}
                            {resource.type === 'video' && <MdVideoLibrary className="w-8 h-8" />}
                            {resource.type === 'link' && <MdLink className="w-8 h-8" />}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{resource.type}</span>
                    </div>

                    <h3 className="text-xl font-black text-gray-800 tracking-tight leading-tight mb-3 line-clamp-2">
                        {resource.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 line-clamp-3 leading-relaxed mb-8 italic">
                        "{resource.description || 'No description provided.'}"
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-lg tracking-widest">
                            Academic
                        </span>
                        <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-800 transition-colors group/btn"
                        >
                            Access <MdDownload className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">
            📂
          </div>
          <h2 className="text-2xl font-black text-gray-900">No Resources Found</h2>
          <p className="text-gray-500 max-w-sm font-medium">
            We couldn't find any materials matching "{searchTerm}". Try broadening your search or checking other categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentResources;

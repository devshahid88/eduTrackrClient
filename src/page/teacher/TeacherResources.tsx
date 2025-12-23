import React, { useState, useEffect } from 'react';
import { resourceApi } from '../../api/resourceApi';
import { 
  MdSearch, 
  MdFilterList,
  MdDownload,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdLink,
  MdInfo
} from 'react-icons/md';
import { toast } from 'react-hot-toast';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
  role: 'Teacher' | 'Student' | 'Admin';
  createdAt: string;
}

const TeacherResources: React.FC = () => {
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
      toast.error('Failed to load educational resources');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 animate-pulse font-medium text-sm">Organizing knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Institutional Resources</h1>
          <p className="text-gray-500 font-medium mt-1">Curated academic materials and administrative guides.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total</span>
           <span className="text-xl font-black text-blue-600 leading-none">{resources.length}</span>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 bg-white/50 backdrop-blur-md p-5 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-32 z-10 mx-2">
        <div className="flex-1 relative group">
          <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-2xl group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-50 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-gray-700 placeholder:text-gray-300"
          />
        </div>
        <div className="flex items-center gap-3 min-w-[200px]">
           <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
              <MdFilterList className="text-xl" />
           </div>
           <select
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             className="flex-1 bg-white border border-gray-50 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm"
           >
             <option value="all">Catalog All</option>
             <option value="pdf">PDF Docs</option>
             <option value="video">Interactive Video</option>
             <option value="link">Cross Links</option>
           </select>
        </div>
      </div>

      {/* Results Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2 pt-4">
          {filteredResources.map((resource) => (
            <div key={resource._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl transition-colors ${
                  resource.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 
                  resource.type === 'video' ? 'bg-blue-50 text-blue-500' : 
                  'bg-emerald-50 text-emerald-500'
                }`}>
                  {resource.type === 'pdf' && <MdPictureAsPdf className="text-3xl" />}
                  {resource.type === 'video' && <MdVideoLibrary className="text-3xl" />}
                  {resource.type === 'link' && <MdLink className="text-3xl" />}
                </div>
                <div className="flex items-center gap-2">
                   {resource.role === 'Teacher' && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-tighter">Pro</span>}
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(resource.createdAt).getFullYear()}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">{resource.title}</h3>
              <p className="text-sm font-medium text-gray-500 mb-8 line-clamp-3 leading-relaxed italic border-l-2 border-gray-50 pl-4 py-1">{resource.description}</p>
              
              <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-6">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{resource.role} Only</span>
                 </div>
                 <a 
                   href={resource.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
                 >
                    Access <MdDownload className="text-sm" />
                 </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 px-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200 mx-2">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-black text-gray-900">Resource Library Empty</h2>
          <p className="text-gray-500 max-w-sm font-medium">No materials match your current filter settings. Try expanding your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherResources;

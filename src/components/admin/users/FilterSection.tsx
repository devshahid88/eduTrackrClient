import React from 'react';
import { MdSearch, MdFilterList, MdLayers, MdPersonSearch } from 'react-icons/md';

interface FilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClass?: string;
  setSelectedClass?: (cls: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  classOptions?: string[];
  roleOptions?: string[];
  className?: string;
}

const Filter: React.FC<FilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedClass,
  setSelectedClass,
  selectedRole,
  setSelectedRole,
  classOptions = ['All'],
  roleOptions = ['All'],
  className = '',
}) => {
  return (
    <div className={`flex flex-col xl:flex-row gap-6 items-stretch xl:items-center bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 shadow-sm w-full relative overflow-hidden group ${className}`}>
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
      
      {/* Search Input */}
      <div className="flex-1 relative group/search">
        <MdPersonSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-hover/search:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Locate Personnel by Identity or Access Credentials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border-gray-100 rounded-3xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-inner"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Class Filter */}
        {selectedClass !== undefined && setSelectedClass && (
          <div className="relative group/select">
            <MdLayers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover/select:text-indigo-500 transition-colors pointer-events-none" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-14 pr-10 py-5 bg-gray-50/50 border-gray-100 rounded-3xl text-xs font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none transition-all cursor-pointer min-w-[180px]"
            >
              <option value="All">All Operations</option>
              {classOptions.filter(c => c !== 'All').map((className, idx) => (
                <option key={idx} value={className}>{className}</option>
              ))}
            </select>
          </div>
        )}

        {/* Role Filter */}
        {selectedRole !== undefined && setSelectedRole && (
          <div className="relative group/role">
            <MdFilterList className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover/role:text-blue-500 transition-colors pointer-events-none" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pl-14 pr-10 py-5 bg-gray-50/50 border-gray-100 rounded-3xl text-xs font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none transition-all cursor-pointer min-w-[180px]"
            >
              <option value="All">All Entities</option>
              {roleOptions.filter(r => r !== 'All').map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;

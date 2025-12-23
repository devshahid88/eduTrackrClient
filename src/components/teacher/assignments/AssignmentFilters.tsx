import React from 'react';
import { 
  MdFilterList, 
  MdClose, 
  MdCheckCircle, 
  MdAccessTime, 
  MdWarning, 
  MdTrendingUp,
  MdLayers,
  MdSettingsBackupRestore
} from 'react-icons/md';

interface FilterProps {
  filters: {
    course: string;
    department: string;
    status: string;
    sortBy: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  courses: { _id: string; name: string }[];
  departments: { _id: string; name: string }[];
}

const AssignmentFilters: React.FC<FilterProps> = ({ filters, setFilters, courses, departments }) => {
  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      course: 'all',
      department: 'all',
      status: 'all',
      sortBy: 'dueDate',
    });
  };

  const hasActiveFilters = filters.course !== 'all' || filters.department !== 'all' || filters.status !== 'all';

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2.5 bg-gray-900 rounded-xl text-blue-400 shadow-lg shadow-blue-900/10">
              <MdFilterList className="text-lg" />
           </div>
           <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Intelligent Filters</h3>
              <p className="text-[10px] font-bold text-gray-400">Refine your curriculum overview.</p>
           </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
          >
            <MdSettingsBackupRestore className="text-sm" />
            Reset Architecture
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Course Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Knowledge Domain</label>
          <div className="relative group">
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="w-full bg-gray-50/50 border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Modules</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-blue-500 transition-colors">
               <MdLayers />
            </div>
          </div>
        </div>

        {/* Department Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Faculty / Department</label>
          <div className="relative group">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full bg-gray-50/50 border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Global Reach</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-emerald-500 transition-colors">
               <MdCheckCircle />
            </div>
          </div>
        </div>

        {/* Status Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Lifecycle Status</label>
          <div className="relative group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-gray-50/50 border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All States</option>
              <option value="active">Active Resonance</option>
              <option value="expired">Terminated</option>
              <option value="due-soon">Critical Window</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-amber-500 transition-colors">
               <MdAccessTime />
            </div>
          </div>
        </div>

        {/* Sort Select */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Chronological Order</label>
          <div className="relative group">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full bg-gray-50/50 border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="dueDate">Terminator (Due Date)</option>
              <option value="createdAt">Genesis (Created)</option>
              <option value="title">Alphabetical Sync</option>
              <option value="submissions">Highest Engagement</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover:text-indigo-500 transition-colors">
               <MdTrendingUp />
            </div>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-50">
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest self-center mr-2">Active Protocols:</span>
           {filters.course !== 'all' && (
             <Tag label={`Domain: ${courses.find(c => c._id === filters.course)?.name}`} onRemove={() => handleFilterChange('course', 'all')} color="blue" />
           )}
           {filters.department !== 'all' && (
             <Tag label={`Dept: ${departments.find(d => d._id === filters.department)?.name}`} onRemove={() => handleFilterChange('department', 'all')} color="emerald" />
           )}
           {filters.status !== 'all' && (
             <Tag label={`Status: ${filters.status}`} onRemove={() => handleFilterChange('status', 'all')} color="amber" />
           )}
        </div>
      )}
    </div>
  );
};

const Tag = ({ label, onRemove, color }: { label: string, onRemove: () => void, color: 'blue' | 'emerald' | 'amber' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${colors[color]} animate-in zoom-in-95 duration-200`}>
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      <button onClick={onRemove} className="hover:scale-125 transition-transform"><MdClose className="text-xs" /></button>
    </div>
  );
};

export default AssignmentFilters;
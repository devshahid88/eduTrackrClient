import React from 'react';

interface FilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClass?: string;
  setSelectedClass?: (cls: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  classOptions?: string[];
  roleOptions?: string[];
  className?: string; // ✅ add this
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
  className = '', // ✅ default to empty string
}) => {
  return (
    <div className={`flex gap-4 items-center bg-white p-4 rounded-lg shadow-md w-full max-w-lg ${className}`}>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Class Filter */}
      {selectedClass !== undefined && setSelectedClass && (
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Classes</option>
          {classOptions.filter(c => c !== 'All').map((className, idx) => (
            <option key={idx} value={className}>
              {className}
            </option>
          ))}
        </select>
      )}

      {/* Role Filter */}
      {selectedRole !== undefined && setSelectedRole && (
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Roles</option>
          {roleOptions.filter(r => r !== 'All').map((role, idx) => (
            <option key={idx} value={role}>
              {role}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default Filter;

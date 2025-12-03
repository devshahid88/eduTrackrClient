import React from 'react';

interface FilterOption {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

interface FilterSectionProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterOptions?: FilterOption[];
  className?: string;
  placeholder?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchTerm,
  setSearchTerm,
  filterOptions = [],
  className = '',
  placeholder = 'Search...',
}) => {
  return (
    <div className={`flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-md w-full ${className}`}>
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filterOptions.map((filter, index) => (
        <div key={index} className="min-w-[150px]">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterSection;

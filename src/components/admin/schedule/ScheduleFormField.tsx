import React from 'react';
import { ScheduleFormFieldProps } from '../../../types/components/admin';

const ScheduleFormField: React.FC<ScheduleFormFieldProps> = ({
  name,
  label,
  type,
  icon: Icon,
  options = [],
  disabled = false,
  required = false,
  error,
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={18} className="text-gray-400" />
        </div>
        {type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`pl-10 block w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option 
                key={option.value}  // ✅ Added unique key prop
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`pl-10 block w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          />
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center mt-1">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default ScheduleFormField;

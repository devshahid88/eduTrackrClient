import React from 'react';
import { AddUserFormFieldProps } from '../../../types/components/user';

const UserFormField: React.FC<AddUserFormFieldProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  options = [],
  placeholder,
  className = ''
}) => {
  const baseInputClasses = `border rounded-md w-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? 'border-red-500' : 'border-gray-300'
  } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value as string}
            onChange={onChange}
            className={baseInputClasses}
            disabled={disabled}
            required={required}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={name}
              checked={value as boolean}
              onChange={onChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={disabled}
            />
            <label className="text-sm font-medium text-gray-700">{label}</label>
          </div>
        );
      
      default:
        return (
          <input
            type={type}
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            className={baseInputClasses}
            disabled={disabled}
            required={required}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={className}>
        {renderField()}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default UserFormField;

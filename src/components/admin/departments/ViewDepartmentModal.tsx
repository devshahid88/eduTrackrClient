import React from 'react';
import { ViewDepartmentModalProps } from '../../../types/components/admin';
import StatusBadge from '../StatusBadge';

const ViewDepartmentModal: React.FC<ViewDepartmentModalProps> = ({ department, onClose }) => {
  if (!department) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const departmentFields = [
    { label: 'Department Name', value: department.name },
    { label: 'Department Code', value: department.code },
    { label: 'Established Date', value: formatDate(department.establishedDate) },
    { label: 'Head of Department', value: department.headOfDepartment },
    { label: 'Department Email', value: department.departmentEmail, type: 'email' },
    { label: 'Department Phone', value: department.departmentPhone, type: 'tel' },
    { label: 'Created At', value: new Date(department.createdAt).toLocaleString() },
    { label: 'Last Updated', value: new Date(department.updatedAt).toLocaleString() },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Department Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded"
            aria-label="Close modal"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        <div className="space-y-4">
          {departmentFields.map(({ label, value, type }) => (
            <div key={label} className="border-b border-gray-100 pb-3">
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              {type === 'email' ? (
                <a 
                  href={`mailto:${value}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {value}
                </a>
              ) : type === 'tel' ? (
                <a 
                  href={`tel:${value}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {value}
                </a>
              ) : (
                <p className="font-medium text-gray-900">{value}</p>
              )}
            </div>
          ))}
          
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <StatusBadge 
              status={department.active ? 'active' : 'inactive'} 
              variant="user" 
              size="md" 
            />
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDepartmentModal;

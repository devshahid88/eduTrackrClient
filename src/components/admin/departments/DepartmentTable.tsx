import React from 'react';
import { DepartmentTableProps } from '../../../types/components/admin';
import ActionButtons from './ActionButtons';
import StatusBadge from '../StatusBadge';
const DepartmentTable: React.FC<DepartmentTableProps> = ({ 
  departments, 
  onEdit, 
  onDelete, 
  onView,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Code', 'Head of Department', 'Email', 'Phone', 'Status', 'Actions'].map(header => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!departments || departments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center">
                    <i className="ti ti-building text-3xl text-gray-300 mb-2" />
                    <p>No departments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr key={department._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{department.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {department.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {department.headOfDepartment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a 
                      href={`mailto:${department.departmentEmail}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {department.departmentEmail}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a 
                      href={`tel:${department.departmentPhone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {department.departmentPhone}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge 
                      status={department.active ? 'active' : 'inactive'} 
                      variant="user" 
                      size="sm" 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionButtons 
                      item={department}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentTable;

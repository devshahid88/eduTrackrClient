// src/components/admin/StatusBadge.tsx
import React from 'react';
import { StatusBadgeProps } from '../../types/components/admin';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'concern', className = '' }) => {
  const getStatusClass = (status: string): string => {
    if (variant === 'concern') {
      switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        case 'Solved': return 'bg-green-100 text-green-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(status)} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

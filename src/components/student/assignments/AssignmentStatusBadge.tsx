import React from 'react';
import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { AssignmentStatusBadgeProps } from '../../../types/components/student';
import { getAssignmentStatus } from '../../../utils/assignmentUtils';

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({
  assignment,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const status = getAssignmentStatus(assignment);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };
  
  const variantClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  const icons = {
    submitted: CheckCircle,
    overdue: AlertCircle,
    'due-soon': Clock,
    pending: FileText
  };
  
  const IconComponent = icons[status.status];
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium border ${variantClasses[status.variant]} ${sizeClasses[size]} ${className}`}
      title={status.text}
    >
      {showIcon && IconComponent && (
        <IconComponent className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${showIcon ? 'mr-1' : ''}`} />
      )}
      {status.text}
    </span>
  );
};

export default AssignmentStatusBadge;

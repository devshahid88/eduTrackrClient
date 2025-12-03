import React, { useState, useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  ScheduleTableProps,
   
} from '../../../types/components/admin';

import { ScheduleFilters as IScheduleFilters } from '../../../types/features/schedule-management';
import { useScheduleManagement } from '../../../hooks/useScheduleManagement';
import ScheduleFilters from './ScheduleFilters';
import EditScheduleModal from './EditScheduleModal';

const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
  className = '' 
}) => {
  // Use our custom hook for all schedule management
  const {
    schedules,
    departments,
    loading,
    error,
    deleteSchedule,
    filterSchedules
  } = useScheduleManagement();

  // Local state - using the correct interface
  const [filters, setFilters] = useState<IScheduleFilters>({
    searchTerm: '',
    department: '',
    day: undefined
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter schedules using our custom hook
  const filteredSchedules = useMemo(() => {
    return filterSchedules(filters);
  }, [filterSchedules, filters]);

  // Derive semesters from schedules
  const semesters = useMemo(() => {
    const uniqueSemesters = [
      ...new Set(
        schedules
          .map(schedule => 
            typeof schedule.courseId === 'string' 
              ? null 
              : schedule.courseId?.semester
          )
          .filter(Boolean)
      )
    ].sort();
    
    return uniqueSemesters.length > 0 
      ? uniqueSemesters 
      : ['1', '2', '3', '4', '5', '6', '7', '8'];
  }, [schedules]);

  // Handle schedule deletion
  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(id);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setIsEditModalOpen(true);
  };

  // Handle modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingSchedule(null);
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    handleEditModalClose();
    toast.success('Schedule updated successfully');
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: IScheduleFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      department: '',
      day: undefined
    });
  };

  // Get display value for schedule properties
  const getScheduleDisplayValue = (schedule: any, field: string) => {
    switch (field) {
      case 'course':
        return typeof schedule.courseId === 'string' 
          ? 'N/A' 
          : schedule.courseId?.name || 'N/A';
      
      case 'department':
        return typeof schedule.departmentId === 'string'
          ? departments.find(d => d._id === schedule.departmentId)?.name || 'N/A'
          : schedule.departmentId?.name || 'N/A';
      
      case 'teacher':
        if (typeof schedule.teacherId === 'string') {
          return 'N/A';
        }
        return schedule.teacherId?.firstname && schedule.teacherId?.lastname
          ? `${schedule.teacherId.firstname} ${schedule.teacherId.lastname}`
          : 'N/A';
      
      case 'semester':
        return typeof schedule.courseId === 'string'
          ? 'N/A'
          : schedule.courseId?.semester || 'N/A';
      
      case 'timeRange':
        return `${schedule.startTime} - ${schedule.endTime}`;
      
      default:
        return 'N/A';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Error loading schedules
        </div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md ${className}`}>
        {/* Header with Title and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Class Schedules</h2>
            <div className="text-sm text-gray-500">
              {filteredSchedules.length} of {schedules.length} schedules
            </div>
          </div>

          {/* Filters Component */}
          <ScheduleFilters
            filters={filters}
            departments={departments}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Course',
                  'Department', 
                  'Teacher',
                  'Day',
                  'Time',
                  'Semester',
                  'Actions'
                ].map((header) => (
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
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-lg font-medium">No schedules found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {filters.searchTerm || filters.department || filters.day
                          ? 'Try adjusting your filters'
                          : 'Schedules will appear here once they are created'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {getScheduleDisplayValue(schedule, 'course')}
                        </div>
                        {typeof schedule.courseId !== 'string' && schedule.courseId?.code && (
                          <div className="text-xs text-gray-500">
                            {schedule.courseId.code}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getScheduleDisplayValue(schedule, 'department')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getScheduleDisplayValue(schedule, 'teacher')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {schedule.day}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getScheduleDisplayValue(schedule, 'timeRange')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getScheduleDisplayValue(schedule, 'semester')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          title="Edit Schedule"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule._id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          title="Delete Schedule"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        {filteredSchedules.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Showing {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''}
                {filters.searchTerm || filters.department || filters.day ? ' (filtered)' : ''}
              </span>
              <span>
                Total: {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Schedule Modal */}
      {isEditModalOpen && editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSuccess={handleEditSuccess}
          departments={departments}
          semesters={semesters}
        />
      )}
    </>
  );
};

export default ScheduleTable;

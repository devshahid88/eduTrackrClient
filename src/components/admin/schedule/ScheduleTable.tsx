import React, { useState, useMemo } from 'react';
import { 
  MdEdit, 
  MdDeleteForever, 
  MdDateRange, 
  MdAccessTime, 
  MdSchool, 
  MdLayers,
  MdPerson,
  MdCircle
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { ScheduleTableProps } from '../../../types/components/admin';
import { ScheduleFilters as IScheduleFilters } from '../../../types/features/schedule-management';
import { useScheduleManagement } from '../../../hooks/useScheduleManagement';
import ScheduleFilters from './ScheduleFilters';
import EditScheduleModal from './EditScheduleModal';

const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
  className = '' 
}) => {
  const {
    schedules,
    departments,
    loading,
    error,
    deleteSchedule,
    filterSchedules
  } = useScheduleManagement();

  const [filters, setFilters] = useState<IScheduleFilters>({
    searchTerm: '',
    department: '',
    day: undefined
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredSchedules = useMemo(() => {
    return filterSchedules(filters);
  }, [filterSchedules, filters]);

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

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Terminate this temporal allocation? This action is irreversible.')) {
      try {
        await deleteSchedule(id);
        toast.success('Allocation purged from matrix');
      } catch (error) {
        toast.error('Purge failure detected');
      }
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingSchedule(null);
  };

  const handleEditSuccess = () => {
    handleEditModalClose();
  };

  const handleFilterChange = (newFilters: IScheduleFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      department: '',
      day: undefined
    });
  };

  const getScheduleDisplayValue = (schedule: any, field: string) => {
    switch (field) {
      case 'course':
      case 'course':
        return schedule.courseName || schedule.courseCode || 
               (typeof schedule.courseId !== 'string' ? schedule.courseId?.name : 'N/A');
      case 'department':
        return schedule.departmentName ||
               (typeof schedule.departmentId === 'string'
                  ? departments.find(d => d._id === schedule.departmentId)?.name || 'N/A'
                  : schedule.departmentId?.name || 'N/A');
      case 'teacher':
        if (schedule.teacherName) return schedule.teacherName;
        if (typeof schedule.teacherId === 'string') return 'N/A';
        return schedule.teacherId?.firstname && schedule.teacherId?.lastname
          ? `${schedule.teacherId.firstname} ${schedule.teacherId.lastname}`
          : schedule.teacherId?.username || 'N/A';
      case 'semester':
         return schedule.semester || 
                (typeof schedule.courseId !== 'string' ? schedule.courseId?.semester : 'N/A');
      case 'timeRange':
        return `${schedule.startTime} - ${schedule.endTime}`;
      default:
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] p-24 flex flex-col items-center justify-center gap-6 shadow-sm border border-gray-100">
         <div className="animate-spin h-16 w-16 border-[5px] border-indigo-600/10 border-t-indigo-600 rounded-full" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Syncing Temporal Data...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
        {/* Advanced Filters Backdrop */}
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <ScheduleFilters
             filters={filters}
             departments={departments}
             onFilterChange={handleFilterChange}
             onClearFilters={handleClearFilters}
             isOpen={isFilterOpen}
             onToggle={() => setIsFilterOpen(!isFilterOpen)}
           />
        </div>

        {/* Branded Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Course Module</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Node</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Instructional Lead</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Slot</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center opacity-25">
                       <MdDateRange size={64} className="mx-auto mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest text-gray-500">No Temporal Entities Detected</p>
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule._id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shadow-inner">
                              <MdSchool size={24} />
                           </div>
                           <div>
                              <div className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{getScheduleDisplayValue(schedule, 'course')}</div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Level {getScheduleDisplayValue(schedule, 'semester')} Module</div>
                           </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-8 whitespace-nowrap">
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest">
                            <MdLayers className="text-indigo-400" />
                            {getScheduleDisplayValue(schedule, 'department')}
                         </div>
                      </td>
                      
                      <td className="px-8 py-8 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black italic">
                               {getScheduleDisplayValue(schedule, 'teacher').charAt(0)}
                            </div>
                            <span className="text-xs font-black text-gray-700">{getScheduleDisplayValue(schedule, 'teacher')}</span>
                         </div>
                      </td>
                      
                      <td className="px-8 py-8 whitespace-nowrap">
                         <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                               <MdCircle size={8} className="animate-pulse" />
                               {schedule.day}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                               <MdAccessTime size={14} />
                               {getScheduleDisplayValue(schedule, 'timeRange')}
                            </div>
                         </div>
                      </td>
                      
                      <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button
                             onClick={() => handleEditSchedule(schedule)}
                             className="p-2.5 text-blue-500 hover:text-white hover:bg-blue-600 bg-blue-50/50 rounded-xl transition-all duration-300 hover:rotate-6 shadow-sm border border-blue-100/50"
                           >
                             <MdEdit size={18} />
                           </button>
                           <button
                             onClick={() => handleDeleteSchedule(schedule._id)}
                             className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-600 bg-rose-50/50 rounded-xl transition-all duration-300 hover:-rotate-6 shadow-sm border border-rose-100/50"
                           >
                             <MdDeleteForever size={18} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
    </div>
  );
};

export default ScheduleTable;

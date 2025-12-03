import React from 'react';
import { Clock, Calendar, BookOpen, Users, Building } from 'lucide-react';
import { ScheduleFormProps} from '../../../types/components/admin';
import { DayOfWeek } from '../../../types/features/schedule-management';
import { useScheduleForm } from '../../../hooks/useScheduleForm';
import ScheduleFormField from './ScheduleFormField';



const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData,
  className = '' 
}) => {
  const {
    formData,
    errors,
    isLoading,
    isSubmitting,
    departments,
    courses,
    teachers,
    handleChange,
    handleSubmit,
    resetForm
  } = useScheduleForm(onSuccess);

  // Handle form field changes with proper typing
  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof typeof formData, value);
  };

  // Prepare options for select fields
  const departmentOptions = departments.map(dept => ({
    value: dept._id,
    label: dept.name
  }));

  const courseOptions = courses.map(course => ({
    value: course._id,
    label: `${course.code} - ${course.name} (${course.semester})`
  }));

 // In ScheduleForm.tsx, update the teacher options mapping:

const teacherOptions = teachers.map(teacher => {
  // ✅ Use both _id and id, prioritizing _id
  const teacherId = teacher._id || teacher.id || '';
  return {
    value: teacherId,
    label: `${teacher.firstname} ${teacher.lastname} (${teacher.username})`
  };
}).filter(option => option.value); // ✅ Filter out empty values


  const dayOptions = DAYS_OF_WEEK.map(day => ({
    value: day,
    label: day
  }));

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Schedule</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Department Selection */}
          <ScheduleFormField
            name="department"
            label="Department"
            type="select"
            icon={Building}
            options={departmentOptions}
            value={formData.department}
            onChange={handleFieldChange}
            error={errors.department}
            disabled={isLoading}
            required
          />

          {/* Course Selection */}
          <ScheduleFormField
            name="course"
            label="Course"
            type="select"
            icon={BookOpen}
            options={courseOptions}
            value={formData.course}
            onChange={handleFieldChange}
            error={errors.course}
            disabled={!formData.department || isLoading}
            required
          />

          {/* Teacher Selection */}
          <ScheduleFormField
            name="teacher"
            label="Teacher"
            type="select"
            icon={Users}
            options={teacherOptions}
            value={formData.teacher}
            onChange={handleFieldChange}
            error={errors.teacher}
            disabled={!formData.department || isLoading}
            required
          />

          {/* Day Selection */}
          <ScheduleFormField
            name="day"
            label="Day"
            type="select"
            icon={Calendar}
            options={dayOptions}
            value={formData.day}
            onChange={handleFieldChange}
            error={errors.day}
            disabled={isLoading}
            required
          />

          {/* Start Time */}
          <ScheduleFormField
            name="startTime"
            label="Start Time"
            type="time"
            icon={Clock}
            value={formData.startTime}
            onChange={handleFieldChange}
            error={errors.startTime}
            disabled={isLoading}
            required
          />

          {/* End Time */}
          <ScheduleFormField
            name="endTime"
            label="End Time"
            type="time"
            icon={Clock}
            value={formData.endTime}
            onChange={handleFieldChange}
            error={errors.endTime}
            disabled={isLoading}
            required
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading || isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              'Create Schedule'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;

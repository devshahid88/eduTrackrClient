import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateExistingSchedule } from '../../../redux/slices/scheduleSlice';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { AppDispatch } from '../../../redux/store';
import { EditScheduleModalProps } from '../../../types/components/admin';
import { Department, Course, Teacher } from '../../../types/features/schedule-management';

// ✅ Form data interface
interface EditScheduleFormData {
  courseId: string;
  teacherId: string;
  departmentId: string;
  day: string;
  startTime: string;
  endTime: string;
  semester: string;
  room: string;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ 
  schedule, 
  isOpen, 
  onClose, 
  onSuccess, 
  departments,
  semesters,
  loading: externalLoading = false 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [formData, setFormData] = useState<EditScheduleFormData>({
    courseId: '',
    teacherId: '',
    departmentId: '',
    day: '',
    startTime: '',
    endTime: '',
    semester: '',
    room: ''
  });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // ✅ Helper functions to safely extract IDs
  const getCourseId = (courseId: string | Course | undefined): string => {
    if (!courseId) return '';
    if (typeof courseId === 'string') return courseId;
    return courseId._id || '';
  };

  const getTeacherId = (teacherId: string | Teacher | undefined): string => {
    if (!teacherId) return '';
    if (typeof teacherId === 'string') return teacherId;
    return teacherId._id || teacherId.id || '';
  };

  const getDepartmentId = (departmentId: string | Department | undefined): string => {
    if (!departmentId) return '';
    if (typeof departmentId === 'string') return departmentId;
    return departmentId._id || '';
  };

  const getSemester = (courseId: string | Course | undefined): string => {
    if (!courseId) return '';
    if (typeof courseId === 'string') return '';
    return courseId.semester || '';
  };

  const getRoom = (room: string | undefined): string => {
    return room || '';
  };

  // Initialize form data when schedule changes
  useEffect(() => {
    if (schedule) {
      console.log('Schedule data received:', schedule);
      setFormData({
        courseId: getCourseId(schedule.courseId),
        teacherId: getTeacherId(schedule.teacherId),
        departmentId: getDepartmentId(schedule.departmentId),
        day: schedule.day || '',
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        semester: schedule.semester || getSemester(schedule.courseId),
        room: getRoom(schedule.room)
      });
    }
  }, [schedule]);

  // Fetch courses and teachers when department changes
  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (!formData.departmentId) {
        setCourses([]);
        setTeachers([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          axiosInstance.get('/api/courses'),
          axiosInstance.get('/api/teachers')
        ]);
        
        console.log('Courses API Response:', coursesRes.data);
        console.log('Teachers API Response:', teachersRes.data);
        
        // Handle courses data
        if (coursesRes.data.success && Array.isArray(coursesRes.data.data)) {
          const departmentCourses = coursesRes.data.data.filter((course: Course) => 
            course.departmentId === formData.departmentId
          );
          setCourses(departmentCourses);
        } else {
          setCourses([]);
        }

        // Handle teachers data
        if (teachersRes.data.success && Array.isArray(teachersRes.data.data)) {
          // ✅ Map teachers to ensure consistent ID format
          const mappedTeachers = teachersRes.data.data.map((teacher: any) => ({
            ...teacher,
            _id: teacher._id || teacher.id,
            id: teacher.id || teacher._id
          }));
          setTeachers(mappedTeachers);
        } else {
          setTeachers([]);
        }
      } catch (error) {
        console.error('Error loading department data:', error);
        toast.error('Failed to load courses and teachers');
        setCourses([]);
        setTeachers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, [formData.departmentId]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset course and teacher when department changes
      ...(name === 'departmentId' && { courseId: '', teacherId: '' }),
      // ✅ Auto-set semester when course is selected - fix type safety
      ...(name === 'courseId' && { 
        semester: (() => {
          const selectedCourse = courses.find(c => c._id === value);
          return selectedCourse?.semester || prev.semester;
        })()
      })
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Check if schedule ID exists with proper type checking
    const scheduleId = schedule?._id || (schedule as any)?.id;
    if (!scheduleId) {
      console.error('Schedule ID is missing:', schedule);
      toast.error('Schedule ID is missing. Cannot update schedule.');
      return;
    }

    // Validate required fields
    const requiredFields: (keyof EditScheduleFormData)[] = [
      'courseId', 'teacherId', 'departmentId', 'day', 'startTime', 'endTime', 'semester'
    ];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate time format
    if (formData.startTime >= formData.endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    // ✅ More flexible teacher ID validation
    if (formData.teacherId) {
      const teacherExists = teachers.some(t => {
        const teacherId = t._id || t.id;
        return teacherId === formData.teacherId;
      });
      if (!teacherExists) {
        toast.error('Please select a valid teacher');
        return;
      }
    }

    console.log('Submitting update for schedule ID:', scheduleId);
    console.log('Form data:', formData);

    setIsSubmitting(true);
    try {
      const result = await dispatch(updateExistingSchedule({
        scheduleId: scheduleId,
        scheduleData: {
          ...formData,
          day: formData.day as import("../../../types/features/schedule-management").DayOfWeek
        }
      })).unwrap();
      
      console.log('Update result:', result);
      toast.success('Schedule updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to update schedule';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
                disabled={!formData.departmentId || isLoading || isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                disabled={!formData.departmentId || isLoading || isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => {
                  const teacherId = teacher._id || teacher.id;
                  return (
                    <option key={teacherId} value={teacherId}>
                      {teacher.firstname} {teacher.lastname}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day <span className="text-red-500">*</span>
              </label>
              <select
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select Day</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="">Select Semester</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room
              </label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleInputChange}
                placeholder="Enter room number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <Loader size={16} className="animate-spin mr-2 text-blue-600" />
                <span className="text-sm text-blue-700">Loading courses and teachers...</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || externalLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;

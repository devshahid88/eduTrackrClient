import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { createNewSchedule, clearScheduleError } from '../redux/slices/scheduleSlice';
import { 
  ScheduleFormData, 
  ScheduleFormErrors, 
  Department, 
  Course, 
  Teacher, 
  CreateSchedulePayload,
  DayOfWeek} from '../types/features/schedule-management';
import { RootState } from '../redux/store';

const initialFormData: ScheduleFormData = {
    department: '',      // ✅ Changed from 'departmentId' 
    course: '',         // ✅ Changed from 'courseId'
    teacher: '',        // ✅ Changed from 'teacherId'
  departmentId: '',      // ✅ Changed from 'department'
  courseId: '',          // ✅ Changed from 'course'
  teacherId: '',         // ✅ Changed from 'teacher'
  semester: '',          // ✅ Added semester field
  day: '' as DayOfWeek,
  startTime: '',
  endTime: '',
};

export const useScheduleForm = (onSuccess?: (schedule: any) => void) => {
  const dispatch = useDispatch();
  const { loading: reduxLoading, error: reduxError } = useSelector(
    (state: RootState) => state.schedule
  );

  // Form state
  const [formData, setFormData] = useState<ScheduleFormData>(initialFormData);
  const [errors, setErrors] = useState<ScheduleFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // MongoDB ID validation
  const MONGODB_ID_REGEX = /^[0-9a-fA-F]{24}$/;

  // Load initial departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/api/departments');
        if (response.data.success && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        } else {
          setDepartments([]);
          toast.error('Failed to load departments');
        }
      } catch (error: any) {
        console.error('Error loading departments:', error);
        toast.error(error.message || 'Failed to load departments');
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Load courses and teachers when department changes
  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (!formData.department) {
        setCourses([]);
        setTeachers([]);
        return;
      }

      if (!MONGODB_ID_REGEX.test(formData.department)) {
        setErrors(prev => ({ ...prev, department: 'Invalid department ID format' }));
        setCourses([]);
        setTeachers([]);
        return;
      }

      setIsLoading(true);
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          axiosInstance.get('/api/courses'),
          axiosInstance.get('/api/teachers'),
        ]);

        // Handle courses
        if (coursesRes.data.success && Array.isArray(coursesRes.data.data)) {
          const departmentCourses = coursesRes.data.data.filter(
            (course: Course) => course.departmentId === formData.department
          );
          setCourses(departmentCourses);
        } else {
          setCourses([]);
        }

        // Handle teachers
        if (teachersRes.data.success && Array.isArray(teachersRes.data.data)) {
          // For now, show all teachers. You might want to filter by department later
          setTeachers(teachersRes.data.data);
        } else {
          setTeachers([]);
        }
      } catch (error: any) {
        console.error('Error loading department data:', error);
        toast.error('Failed to load department data');
        setCourses([]);
        setTeachers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, [formData.department]);

  // Form validation
 // In useScheduleForm.ts, update the teacher validation:

const validateForm = useCallback((): boolean => {
  const newErrors: ScheduleFormErrors = {};

  // Required field validation
  if (!formData.department) newErrors.department = 'Department is required';
  if (!formData.course) newErrors.course = 'Course is required';
  if (!formData.teacher) newErrors.teacher = 'Teacher is required';
  if (!formData.day) newErrors.day = 'Day is required';
  if (!formData.startTime) newErrors.startTime = 'Start time is required';
  if (!formData.endTime) newErrors.endTime = 'End time is required';

  // ID format validation
  if (formData.department && !MONGODB_ID_REGEX.test(formData.department)) {
    newErrors.department = 'Invalid department ID format';
  }
  if (formData.course && !MONGODB_ID_REGEX.test(formData.course)) {
    newErrors.course = 'Invalid course ID format';
  }
  
  // ✅ More flexible teacher validation
  if (formData.teacher) {
    // Check if teacher exists in the list rather than just ID format
    const teacherExists = teachers.some(teacher => {
      const teacherId = teacher._id || teacher.id;
      return teacherId === formData.teacher;
    });
    
    if (!teacherExists) {
      newErrors.teacher = 'Please select a valid teacher';
    }
    // Only validate MongoDB format if it looks like a MongoDB ID
    else if (formData.teacher.length === 24 && !MONGODB_ID_REGEX.test(formData.teacher)) {
      newErrors.teacher = 'Invalid teacher ID format';
    }
  }

  // Time validation
  if (formData.startTime && formData.endTime) {
    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);
    
    if (start >= end) {
      newErrors.endTime = 'End time must be after start time';
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [formData, teachers]);


  // Handle form field changes
  const handleChange = useCallback((name: keyof ScheduleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent fields when department changes
      ...(name === 'department' && { course: '', teacher: '' })
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // Clear Redux error
    if (reduxError) {
      dispatch(clearScheduleError());
    }
  }, [errors, reduxError, dispatch]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCourse = courses.find(course => course._id === formData.course);
      
      const scheduleData: CreateSchedulePayload = {
        departmentId: formData.department,
        courseId: formData.course,
        teacherId: formData.teacher,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        semester: selectedCourse?.semester || 'Spring 2025',
      };

      const result = await dispatch(createNewSchedule(scheduleData) as any).unwrap();

      if (result.success) {
        setFormData(initialFormData);
        setErrors({});
        toast.success('Schedule created successfully');
        onSuccess?.(result.data);
      } else {
        toast.error(result.message || 'Failed to create schedule');
      }
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      const errorMessage = error.message || 'Failed to create schedule';
      toast.error(errorMessage);
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, courses, validateForm, dispatch, onSuccess]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    dispatch(clearScheduleError());
  }, [dispatch]);

  return {
    // Form state
    formData,
    errors: { ...errors, ...(reduxError && { general: reduxError }) },
    isLoading: isLoading || reduxLoading,
    isSubmitting,

    // Data
    departments,
    courses,
    teachers,

    // Actions
    handleChange,
    handleSubmit,
    resetForm,
    validateForm
  };
};

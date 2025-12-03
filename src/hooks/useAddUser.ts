import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { DashboardUser } from '../types/features/user-management';
import { Department, Course } from '../types/features/schedule-management';

// ✅ Form data interface matching existing DashboardUser
interface AddUserFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  department: string;
  class: string;
  courses: string[];
  profileImage: string;
}

interface AddUserFormErrors {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
  class?: string;
  courses?: string;
  general?: string;
}

const AVAILABLE_CLASSES = [
  'First Sem', 'Second Sem', 'Third Sem', 'Fourth Sem', 'Fifth Sem', 'Sixth Sem'
] as const;

const initialFormData: AddUserFormData = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'student',
  isActive: true,
  department: '',
  class: '',
  courses: [],
  profileImage: ''
};

export const useAddUser = (onSave: (user: DashboardUser) => void, onClose: () => void) => {
  // Form state
  const [formData, setFormData] = useState<AddUserFormData>(initialFormData);
  const [errors, setErrors] = useState<AddUserFormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Fetch departments and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [departmentsResponse, coursesResponse] = await Promise.all([
          axiosInstance.get('/api/departments'),
          axiosInstance.get('/api/courses')
        ]);

        setDepartments(departmentsResponse.data.data);
        setCourses(coursesResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load departments and courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get semester number
  const getSemesterNumber = useCallback((semesterName: string): number => {
    const semesterMap: Record<string, number> = {
      'First Sem': 1, 'Second Sem': 2, 'Third Sem': 3,
      'Fourth Sem': 4, 'Fifth Sem': 5, 'Sixth Sem': 6
    };
    return semesterMap[semesterName] || 1;
  }, []);

  // Filter courses based on department and semester
  const filteredCourses = useMemo(() => {
    if (!formData.department || !formData.class) {
      return [];
    }
    
    const semesterNumber = getSemesterNumber(formData.class);
    return courses.filter(
      course => 
        course.departmentId === formData.department && 
        Number(course.semester) === semesterNumber
    );
  }, [formData.department, formData.class, courses, getSemesterNumber]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const validationErrors: AddUserFormErrors = {};
    setServerError('');

    if (!formData.firstName.trim()) {
      validationErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      validationErrors.lastName = 'Last name is required';
    }
    if (!formData.username.trim()) {
      validationErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      validationErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Email is invalid';
    }
    if (!formData.password.trim()) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.role === 'student') {
      if (!formData.department) {
        validationErrors.department = 'Department is required';
      }
      if (!formData.class) {
        validationErrors.class = 'Semester is required';
      }
      if (selectedCourses.length === 0) {
        validationErrors.courses = 'At least one course must be selected';
      }
    } else if (formData.role === 'teacher' && !formData.department) {
      validationErrors.department = 'Department is required for teachers';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, selectedCourses]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value as 'student' | 'teacher' | 'admin',
        department: '',
        class: '',
        courses: []
      }));
      setSelectedCourses([]);
    } else if (name === 'department') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        class: '',
        courses: []
      }));
      setSelectedCourses([]);
    } else if (name === 'class') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        courses: []
      }));
      setSelectedCourses([]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error for the field being changed
    if (errors[name as keyof AddUserFormErrors]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name as keyof AddUserFormErrors];
        return updated;
      });
    }
  }, [errors]);

  // Handle course selection
  const handleCourseSelection = useCallback((courseId: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });

    // Clear course error
    if (errors.courses) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.courses;
        return updated;
      });
    }
  }, [errors.courses]);

  // Handle image change
  const handleImageChange = useCallback((file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should not exceed 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  // Get API endpoint based on role
  const getApiEndpoint = useCallback((role: 'student' | 'teacher' | 'admin'): string => {
    switch (role) {
      case 'student': return '/api/students/create';
      case 'teacher': return '/api/teachers/create';
      case 'admin': return '/api/admins/create';
      default: throw new Error('Invalid role selected');
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    console.log("Form submission triggered");
    
    setServerError('');
    
    if (!validateForm()) {
      console.log("Form validation failed");
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setUploading(true);
    
      const submitFormData = new FormData();
      
      // Add user data - match API field expectations
      submitFormData.append('username', formData.username);
      submitFormData.append('email', formData.email);
      submitFormData.append('role', formData.role);
      submitFormData.append('password', formData.password);
      submitFormData.append('firstname', formData.firstName);  // API expects 'firstname'
      submitFormData.append('lastname', formData.lastName);    // API expects 'lastname'
      submitFormData.append('isActive', formData.isActive.toString());
      
      if (formData.role === 'student') {
        submitFormData.append('department', formData.department);
        submitFormData.append('class', formData.class);
        submitFormData.append('courses', JSON.stringify(selectedCourses));
      } else if (formData.role === 'teacher') {
        submitFormData.append('department', formData.department);
      }
      
      if (imageFile) {
        submitFormData.append('profileImage', imageFile);
      }
      
      const endpoint = getApiEndpoint(formData.role);
      const response = await axiosInstance.post(endpoint, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.success) {
        toast.success('User added successfully!');
        console.log('adding user', response.data.data);
        onSave(response.data.data);
        onClose();
      } else {
        const errorMsg = response.data?.message || 'Failed to add user';
        setServerError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
   
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'An error occurred';
        
        console.log('Error details:', error.response.data);
        
        if (status === 409 || errorMessage.includes('already exists') || 
            errorMessage.includes('duplicate') || errorMessage.includes('taken')) {
          // Handle duplicate entries
          if (errorMessage.includes('email')) {
            setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
            toast.error('This email is already registered');
          } else if (errorMessage.includes('username')) {
            setErrors(prev => ({ ...prev, username: 'This username is already taken' }));
            toast.error('This username is already taken');
          } else {
            setServerError(errorMessage);
            toast.error(errorMessage);
          }
        } else if (status === 400) {
          setServerError(errorMessage);
          toast.error(errorMessage);
        } else if (status === 500) {
          setServerError('Server error. Please try again later.');
          toast.error('Server error. Please try again later.');
        } else {
          setServerError(errorMessage);
          toast.error(errorMessage);
        }
      } else if (error.request) {
        setServerError('Network error. Please check your connection.');
        toast.error('Network error. Please check your connection.');
      } else {
        setServerError(error.message || 'An unexpected error occurred');
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setUploading(false);
    }
  }, [validateForm, formData, selectedCourses, imageFile, getApiEndpoint, onSave, onClose]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setServerError('');
    setSelectedCourses([]);
    setImageFile(null);
    setImagePreview('');
  }, []);

  return {
    // Form state
    formData,
    errors,
    loading,
    uploading,
    serverError,
    
    // Image state
    imageFile,
    imagePreview,
    
    // Data
    departments,
    courses,
    filteredCourses,
    selectedCourses,
    availableClasses: AVAILABLE_CLASSES,
    
    // Actions
    handleInputChange,
    handleCourseSelection,
    handleImageChange,
    handleSubmit,
    resetForm,
    setImagePreview
  };
};

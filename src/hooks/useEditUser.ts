import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { Department, Course } from '../types/features/schedule-management';

// ✅ Form data interface matching your actual field names
interface EditUserFormData {
  username: string;
  email: string;
  firstname: string;        // ✅ lowercase to match your API
  lastname: string;         // ✅ lowercase to match your API
  role: 'Student' | 'Teacher' | 'Admin';  // ✅ Capitalized to match your values
  department: string;
  class: string;
  courses: string[];
  isBlock?: boolean;         // ✅ Using isBlock instead of status
  profileImage: string;
}

interface EditUserFormErrors {
  username?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  department?: string;
  class?: string;
  courses?: string;
  general?: string;
}

// ✅ User interface matching your actual data structure
interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: 'Student' | 'Teacher' | 'Admin';
  department?: string;
  class?: string;
  courses?: string[];
  isBlock?: boolean;
  profileImage?: string;
}

const AVAILABLE_CLASSES = [
  'First Sem', 'Second Sem', 'Third Sem', 'Fourth Sem', 'Fifth Sem', 'Sixth Sem'
] as const;

const initialFormData: EditUserFormData = {
  username: '',
  email: '',
  firstname: '',
  lastname: '',
  role: 'Student',
  department: '',
  class: '',
  courses: [],
  isBlock: false,
  profileImage: ''
};

export const useEditUser = (user: User | null, onSave: (user: User) => void) => {
  // Form state
  const [formData, setFormData] = useState<EditUserFormData>(initialFormData);
  const [errors, setErrors] = useState<EditUserFormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // ✅ Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        role: user.role,
        department: user.department || '',
        class: user.class || '',
        courses: user.courses || [],
        isBlock: user.isBlock,
        profileImage: user.profileImage || ''
      });
      setSelectedCourses(user.courses || []);
      setImagePreview(user.profileImage || '');
    }
  }, [user]);

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
    const validationErrors: EditUserFormErrors = {};
    
    if (!formData.username.trim()) {
      validationErrors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Email is invalid';
    }
    if (!formData.firstname.trim()) {
      validationErrors.firstname = 'First name is required';
    }
    if (!formData.lastname.trim()) {
      validationErrors.lastname = 'Last name is required';
    }
    
    if (formData.role === 'Student') {
      if (!formData.department) {
        validationErrors.department = 'Department is required';
      }
      if (!formData.class) {
        validationErrors.class = 'Semester is required';
      }
      if (selectedCourses.length === 0) {
        validationErrors.courses = 'At least one course must be selected';
      }
    } else if (formData.role === 'Teacher' && !formData.department) {
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
        [name]: value as 'Student' | 'Teacher' | 'Admin',
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

    // Clear errors
    if (errors[name as keyof EditUserFormErrors]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name as keyof EditUserFormErrors];
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

  // Get API URL based on role
  const getApiUrl = useCallback((role: 'Student' | 'Teacher' | 'Admin'): string => {
    switch (role) {
      case 'Student': return '/api/students';
      case 'Teacher': return '/api/teachers';
      case 'Admin': return '/api/admins';
      default: return '/api/users';
    }
  }, []);

  // Handle save
  const handleSave = useCallback(async (): Promise<void> => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!user) {
      toast.error('User data is missing');
      return;
    }
    
    try {
      setUploading(true);
      
      const userId = user._id || user.id;
      const apiUrl = getApiUrl(formData.role);
      let profileImageUrl = formData.profileImage;
      
      // Upload image if there's a new one
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', imageFile);
        
        try {
          const imageResponse = await axiosInstance.put(
            `${apiUrl}/${userId}/profile-image`, 
            imageFormData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          if (imageResponse.data?.success) {
            profileImageUrl = imageResponse.data.data?.profileImage || imageResponse.data.profileImage;
            toast.success('Profile image updated successfully');
          }
        } catch (imageError) {
          console.error('Failed to update profile image:', imageError);
          toast.error('Failed to update profile image');
        }
      }
      
      // Update user data
      const updatedUserData = {
        ...formData,
        profileImage: profileImageUrl,
        courses: selectedCourses
      };
      
      const updateResponse = await axiosInstance.put(
        `${apiUrl}/${userId}`, 
        updatedUserData
      );
      
      if (updateResponse.data) {
        toast.success('User details updated successfully');
        console.log('edit user', updateResponse.data);
        onSave(updateResponse.data.data);
      } else {
        toast.error('Failed to update user details');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'An error occurred';
        
        if (status === 400) {
          toast.error(errorMessage);
        } else if (status === 409 || errorMessage.includes('already exists')) {
          toast.error(errorMessage);
        } else if (status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setUploading(false);
    }
  }, [validateForm, user, formData, selectedCourses, imageFile, getApiUrl, onSave]);

  return {
    // Form state
    formData,
    errors,
    loading,
    uploading,
    
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
    handleSave,
    setImagePreview
  };
};

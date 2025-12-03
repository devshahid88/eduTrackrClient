import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance'; // ✅ Using proper axios instance

// Use the centralized types instead of local interfaces
import { 
  DepartmentFormData, 
  DepartmentFormErrors, 
  CreateDepartmentRequest 
} from '../../../types/features/department-management';

interface AddDepartmentModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({ onClose, onSave }) => {
  // ✅ Using proper form data structure (all strings)
  const [department, setDepartment] = useState<DepartmentFormData>({
    name: '',
    code: '',
    establishedDate: '',
    headOfDepartment: '',
    departmentEmail: '',
    departmentPhone: '',
    active: true, // ✅ This won't be used in form inputs
  });

  const [errors, setErrors] = useState<DepartmentFormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = (): boolean => {
    const validationErrors: DepartmentFormErrors = {};
    setServerError('');

    // Required field validations
    if (!department.name.trim()) {
      validationErrors.name = 'Department name is required';
    }
    if (!department.code.trim()) {
      validationErrors.code = 'Department code is required';
    }
    if (!department.establishedDate) {
      validationErrors.establishedDate = 'Established date is required';
    }
    if (!department.headOfDepartment.trim()) {
      validationErrors.headOfDepartment = 'Head of department is required';
    }

    // Email validation
    if (!department.departmentEmail.trim()) {
      validationErrors.departmentEmail = 'Department email is required';
    } else if (!/\S+@\S+\.\S+/.test(department.departmentEmail)) {
      validationErrors.departmentEmail = 'Invalid email format';
    }

    // Phone validation
    if (!department.departmentPhone.trim()) {
      validationErrors.departmentPhone = 'Department phone is required';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setUploading(true);
      
      // ✅ Using axiosInstance with proper endpoint
      const response = await axiosInstance.post('/api/departments/create', department);
      
      if (response.data?.success) {
        toast.success('Department added successfully!');
        onSave(response.data.data);
        onClose();
      } else {
        const message = response.data?.message || 'Failed to add department';
        setServerError(message);
        toast.error(message);
      }
    } catch (error: any) {
      console.error('Error adding department:', error);

      // Handle specific error cases
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || 'An error occurred';

      if (status === 409 || errorMessage.includes('already exists')) {
        if (errorMessage.includes('name')) {
          setErrors(prev => ({ ...prev, name: 'This department name already exists' }));
          toast.error('This department name already exists');
        } else if (errorMessage.includes('code')) {
          setErrors(prev => ({ ...prev, code: 'This department code already exists' }));
          toast.error('This department code already exists');
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
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear field-specific error when user starts typing
    if (errors[name as keyof DepartmentFormErrors]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name as keyof DepartmentFormErrors];
        return updated;
      });
    }

    // Clear server error when user makes changes
    if (serverError) {
      setServerError('');
    }

    setDepartment(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Form fields with proper typing
  const formFields = [
    { label: 'Department Name*', name: 'name' as keyof DepartmentFormData, type: 'text' as const },
    { label: 'Department Code*', name: 'code' as keyof DepartmentFormData, type: 'text' as const },
    { label: 'Established Date*', name: 'establishedDate' as keyof DepartmentFormData, type: 'date' as const },
    { label: 'Head of Department*', name: 'headOfDepartment' as keyof DepartmentFormData, type: 'text' as const },
    { label: 'Department Email*', name: 'departmentEmail' as keyof DepartmentFormData, type: 'email' as const },
    { label: 'Department Phone*', name: 'departmentPhone' as keyof DepartmentFormData, type: 'tel' as const },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Department</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded"
              disabled={uploading}
              aria-label="Close modal"
            >
              <i className="ti ti-x text-lg" />
            </button>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
              <div className="flex items-center">
                <i className="ti ti-alert-circle mr-2" />
                {serverError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields.map(({ label, name, type }) => (
              <div key={name}>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={department[name] as string} // ✅ Explicit cast to string
                  onChange={handleChange}
                  className={`
                    w-full px-3 py-2 border rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    transition-colors
                    ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
                  `.trim()}
                  required
                  disabled={uploading}
                />
                {errors[name] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <i className="ti ti-alert-circle mr-1" />
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className={`
                  px-6 py-2 bg-blue-600 text-white rounded-md font-medium 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${!uploading ? 'hover:bg-blue-700' : ''}
                `.trim()}
              >
                {uploading ? (
                  <>
                    <i className="ti ti-loader animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Department'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDepartmentModal;

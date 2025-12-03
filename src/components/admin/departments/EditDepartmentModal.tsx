import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import axios from '../../../api/axiosInstance'; // Adjust the import path as necessary

// Define interfaces
interface Department {
  _id: string;
  name?: string;
  code?: string;
  establishedDate?: string;
  headOfDepartment?: string;
  departmentEmail?: string;
  departmentPhone?: string;
  active?: boolean;
}

interface Errors {
  name?: string;
  code?: string;
  establishedDate?: string;
  headOfDepartment?: string;
  departmentEmail?: string;
  departmentPhone?: string;
}

interface EditDepartmentModalProps {
  department: Department;
  onClose: () => void;
  onSave: (updatedDepartment: Department) => void;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({ department, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    establishedDate: '',
    headOfDepartment: '',
    departmentEmail: '',
    departmentPhone: '',
    active: true,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        establishedDate: department.establishedDate
          ? new Date(department.establishedDate).toISOString().split('T')[0]
          : '',
        headOfDepartment: department.headOfDepartment || '',
        departmentEmail: department.departmentEmail || '',
        departmentPhone: department.departmentPhone || '',
        active: department.active ?? true,
      });
    }
  }, [department]);

  const validateForm = () => {
    const validationErrors: Errors = {};
    setServerError('');

    if (!formData.name.trim()) {
      validationErrors.name = 'Department name is required';
    }
    if (!formData.code.trim()) {
      validationErrors.code = 'Department code is required';
    }
    if (!formData.establishedDate) {
      validationErrors.establishedDate = 'Established date is required';
    }
    if (!formData.headOfDepartment.trim()) {
      validationErrors.headOfDepartment = 'Head of department is required';
    }
    if (!formData.departmentEmail.trim()) {
      validationErrors.departmentEmail = 'Department email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.departmentEmail)) {
      validationErrors.departmentEmail = 'Invalid email format';
    }
    if (!formData.departmentPhone.trim()) {
      validationErrors.departmentPhone = 'Department phone is required';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setUploading(true);

      const response = await axios.put(
        `/api/departments/${department._id}`, // Use relative path to match axiosInstance baseURL
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, // Use token from localStorage
        }
      );

      setUploading(false);

      if (response.data?.success) {
        toast.success('Department updated successfully!');
        onSave(response.data.data);
        onClose();
      } else {
        setServerError(response.data?.message || 'Failed to update department');
        toast.error(response.data?.message || 'Failed to update department');
      }
    } catch (error: any) {
      setUploading(false);
      console.error('Error updating department:', error.message || error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'An error occurred';

        if (status === 409 || errorMessage.includes('already exists')) {
          if (errorMessage.includes('name')) {
            setErrors((prev) => ({ ...prev, name: 'This department name already exists' }));
            toast.error('This department name already exists');
          } else if (errorMessage.includes('code')) {
            setErrors((prev) => ({ ...prev, code: 'This department code already exists' }));
            toast.error('This department code already exists');
          } else {
            setServerError(errorMessage);
            toast.error(errorMessage);
          }
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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (errors[name as keyof Errors]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof Errors];
        return updated;
      });
    }

    if (serverError) {
      setServerError('');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Edit Department</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black">
              ✖
            </button>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Department Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.name ? 'border-red-500' : ''}`}
                required
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Department Code*</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.code ? 'border-red-500' : ''}`}
                required
              />
              {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Established Date*</label>
              <input
                type="date"
                name="establishedDate"
                value={formData.establishedDate}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.establishedDate ? 'border-red-500' : ''}`}
                required
              />
              {errors.establishedDate && <p className="text-xs text-red-500">{errors.establishedDate}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Head of Department*</label>
              <input
                type="text"
                name="headOfDepartment"
                value={formData.headOfDepartment}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.headOfDepartment ? 'border-red-500' : ''}`}
                required
              />
              {errors.headOfDepartment && <p className="text-xs text-red-500">{errors.headOfDepartment}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Department Email*</label>
              <input
                type="email"
                name="departmentEmail"
                value={formData.departmentEmail}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.departmentEmail ? 'border-red-500' : ''}`}
                required
              />
              {errors.departmentEmail && <p className="text-xs text-red-500">{errors.departmentEmail}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Department Phone*</label>
              <input
                type="tel"
                name="departmentPhone"
                value={formData.departmentPhone}
                onChange={handleChange}
                className={`border rounded-md w-full p-2 ${errors.departmentPhone ? 'border-red-500' : ''}`}
                required
              />
              {errors.departmentPhone && <p className="text-xs text-red-500">{errors.departmentPhone}</p>}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={uploading}
                className={`bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition ${
                  uploading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditDepartmentModal;
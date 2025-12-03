import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentResponse,
  DepartmentsResponse
} from '../types/features/department-management';

export const useDepartmentManagement = () => {
  const [loading, setLoading] = useState(false);

  const createDepartment = useCallback(async (data: CreateDepartmentRequest): Promise<Department> => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/departments/create', data);
      
      if (response.data?.success) {
        toast.success('Department created successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to create department');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create department';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, data: UpdateDepartmentRequest): Promise<Department> => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/api/departments/${id}`, data);
      
      if (response.data?.success) {
        toast.success('Department updated successfully!');
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to update department');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update department';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/departments/${id}`);
      
      if (response.data?.success) {
        toast.success('Department deleted successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to delete department');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete department';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment
  };
};

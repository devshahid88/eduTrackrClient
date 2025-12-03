import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import Modal from '../../common/Modal';

const EditCourseModal = ({ course, departments, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({
    code: '',
    name: '',
    departmentId: '',
    semester: '',
    active: true,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        _id: course._id,
        code: course.code || '',
        name: course.name || '',
        departmentId: course.departmentId || '',
        semester: course.semester || '',
        active: course.active ?? true,
      });
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal title="Edit Course" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6 text-lg"> {/* Increase spacing & font size */}
  <div>
    <label className="block font-medium text-gray-700">Course Code</label>
    <input
      type="text"
      name="code"
      value={formData.code}
      onChange={handleChange}
      required
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      placeholder="e.g., CS101"
    />
  </div>

  <div>
    <label className="block font-medium text-gray-700">Course Name</label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      required
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      placeholder="e.g., Introduction to Computer Science"
    />
  </div>

  <div>
    <label className="block font-medium text-gray-700">Department</label>
    <select
      name="departmentId"
      value={formData.departmentId}
      onChange={handleChange}
      required
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">Select Department</option>
      {departments.map(dept => (
        <option key={dept._id} value={dept._id}>
          {dept.name}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label className="block font-medium text-gray-700">Semester</label>
    <select
      name="semester"
      value={formData.semester}
      onChange={handleChange}
      required
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">Select Semester</option>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
        <option key={sem} value={sem}>
          Semester {sem}
        </option>
      ))}
    </select>
  </div>

  <div className="flex items-center">
    <input
      type="checkbox"
      name="active"
      checked={formData.active}
      onChange={handleChange}
      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <label className="ml-3 block text-gray-700">Active</label>
  </div>

  <div className="flex justify-end space-x-4 pt-6">
    <button
      type="button"
      onClick={onClose}
      className="rounded-md border border-gray-300 bg-white px-5 py-2 text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="rounded-md border border-transparent bg-blue-600 px-5 py-2 text-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Save Changes
    </button>
  </div>
</form>

    </Modal>
  );
};

export default EditCourseModal; 
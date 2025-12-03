import React from 'react';
import Modal from '../../common/Modal';

const ViewCourseModal = ({ course, onClose }) => {
  return (
    <Modal title="Course Details" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Information</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Course Code</dt>
              <dd className="mt-1 text-sm text-gray-900">{course.code}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Course Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{course.name}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{course.departmentName || 'N/A'}</dd>
              </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Semester</dt>
              <dd className="mt-1 text-sm text-gray-900">{course.semester}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(course.createdAt).toLocaleDateString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(course.updatedAt).toLocaleDateString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  course.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {course.active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewCourseModal; 

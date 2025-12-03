import React from 'react';

interface User {
  _id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
}

interface Concern {
  _id: string;
  title: string;
  description: string;
  type: 'Academic' | 'Administrative';
  createdBy: User; // Now populated with user object
  createdByRole: 'student' | 'teacher' | 'admin';
  status: 'Pending' | 'In Progress' | 'Solved' | 'Rejected';
  feedback?: string;
  createdAt: string;
}

interface ConcernTableProps {
  concerns: Concern[];
  onEdit: (concern: Concern) => void;
  onView: (concern: Concern) => void;
}

const ConcernTable: React.FC<ConcernTableProps> = ({ concerns, onEdit, onView }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th> */}
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
            {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Raised By</th> */}
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {concerns.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-4 text-center text-gray-500">No concerns found.</td>
            </tr>
          ) : (
            concerns.map((concern) => (
              <tr key={concern._id}>
                <td className="px-4 py-2 whitespace-nowrap">{concern.title}</td>
                {/* <td className="px-4 py-2 whitespace-nowrap">{concern.type}</td> */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    concern.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    concern.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    concern.status === 'Solved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {concern.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{concern.feedback || '-'}</td>
                {/* <td className="px-4 py-2 whitespace-nowrap">
                  {concern.createdBy?.role || 'Unknown'}
                </td> */}
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    concern.createdBy?.role === 'student' ? 'bg-blue-100 text-blue-800' :
                    concern.createdBy?.role === 'teacher' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {concern.createdBy?.role || concern.createdByRole || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    onClick={() => onEdit(concern)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs"
                    onClick={() => onView(concern)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConcernTable;
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { MdAssignment } from 'react-icons/md';
import { AssignmentItem } from '../../../types/features/dashboard';

interface UpcomingAssignmentsProps {
  onView: (assignment: AssignmentItem) => void;
}

const UpcomingAssignments: React.FC<UpcomingAssignmentsProps> = ({ onView }) => {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = useSelector((state: any) => state.auth);
  const studentId = auth.user.id as string;
  const token = auth.accessToken as string;

  useEffect(() => {
    const fetch = async () => {
      if (!studentId || !token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      try {
        const { data: stuRes } = await axiosInstance.get<{ success: boolean; data: { departmentId: string; departmentName: string } }>(
          `/api/students/${studentId}`, { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!stuRes.success) throw new Error('Failed to load student');
        const { departmentId, departmentName } = stuRes.data;

        const { data: asRes } = await axiosInstance.get<{ success: boolean; data: AssignmentItem[] }>(
          `/api/assignments/department/${departmentId}`, { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!asRes.success) throw new Error('Failed to load assignments');

        const items = asRes.data
          .map(item => {
            let status: 'Submitted' | 'Overdue' | 'Pending';
            if (item.submissions?.some(s => s.studentId === studentId)) {
              status = 'Submitted';
            } else if (new Date(item.dueDate) < new Date()) {
              status = 'Overdue';
            } else {
              status = 'Pending';
            }
            return {
              ...item,
              courseName: item.courseName || 'N/A',
              departmentName,
              submissions: item.submissions?.filter(s => s.studentId === studentId) || [],
              status,
              grade: item.submissions?.find(s => s.studentId === studentId)?.grade,
            };
          })
          .filter(a => a.status !== 'Submitted')
          .slice(0, 5);
        setAssignments(items);
      } catch (err: any) {
        setError(err.message || 'Failed to load assignments');
        toast.error(error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [studentId, token, error]);

  const formatDate = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return diff === 0
      ? 'Due Today'
      : diff === 1
      ? 'Due Tomorrow'
      : diff < 0
      ? 'Overdue'
      : `Due in ${diff} days`;
  };

  const getStatusColor = (st: string) => ({
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
  }[st] || 'bg-gray-100 text-gray-800');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Upcoming Assignments</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Upcoming Assignments</h2>
        </div>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Upcoming Assignments</h2>
        <a href="/student/assignments" className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </a>
      </div>
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No upcoming assignments</div>
        ) : (
          assignments.map(a => (
            <div key={a._id} className="flex items-start p-4 rounded-lg border hover:border-blue-200">
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">{a.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(a.status)}`}>
                    {a.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap text-sm text-gray-500 gap-4">
                  <span className="flex items-center">
                    <MdAssignment className="mr-1" /> {a.courseName}
                  </span>
                  <span>📅 {formatDate(a.dueDate)}</span>
                  {a.grade != null && <span>📊 Grade: {a.grade}</span>}
                </div>
                {a.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{a.description}</p>
                )}
              </div>
              <button
                className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => onView(a)}
              >
                View
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignments;

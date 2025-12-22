import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';

const Grade = () => {
  const authState = useSelector((state:RootState) => state.auth);
  const [grades, setGrades] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  const studentId = authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchGrades = async () => {
      if (!studentId || !accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get('/api/grades/student', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.data.success) {
          setGrades(response.data.data);
        } else {
          toast.error('Failed to load grades');
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        toast.error('Failed to load grades');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, [studentId, accessToken]);

  return (
    <>
      <div className="container mx-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Grades</h1>
              <p className="text-gray-600">View your assignment grades</p>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-lg text-gray-600">Loading grades...</p>
          </div>
        ) : grades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Grades Yet</h3>
            <p className="text-gray-600">Your teachers haven't graded any assignments yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade: any) => (
                  <tr key={grade._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {grade.assignmentId?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {grade.grade} / {grade.assignmentId?.maxMarks || 100}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {grade.feedback || 'No feedback'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Grade; 
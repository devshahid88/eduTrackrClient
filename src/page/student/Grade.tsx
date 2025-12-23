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

  const performanceStats = React.useMemo(() => {
    if (!grades.length) return { average: 0, highest: 0, completed: 0 };
    const completed = grades.length;
    const scores = grades.map((g: any) => g.grade);
    const average = (scores.reduce((a: number, b: number) => a + b, 0) / completed).toFixed(1);
    const highest = Math.max(...scores);
    return { average, highest, completed };
  }, [grades]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 font-bold animate-pulse">Calculating results...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Academic Grades</h1>
          <p className="text-gray-500 font-medium mt-1">Official performance records and feedback.</p>
        </div>
      </div>

      {grades.length > 0 ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <GradeStatCard label="Average Score" value={performanceStats.average} icon="📈" color="blue" />
            <GradeStatCard label="Highest Score" value={performanceStats.highest} icon="🏆" color="emerald" />
            <GradeStatCard label="Graded Tasks" value={performanceStats.completed} icon="📝" color="amber" />
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Assignment</th>
                    <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                    <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Feedback</th>
                    <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {grades.map((grade: any) => (
                    <tr key={grade._id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 pl-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 tracking-tight">{grade.assignmentId?.title || 'Unknown Assignment'}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                            {grade.assignmentId?.courseName || 'General Course'}
                          </span>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-gray-900">{grade.grade}</span>
                          <span className="text-xs font-bold text-gray-400">/ {grade.assignmentId?.maxMarks || 100}</span>
                        </div>
                      </td>
                      <td className="py-6 max-w-xs">
                        <p className="text-xs font-medium text-gray-500 leading-relaxed italic">
                          "{grade.feedback || 'No feedback provided yet.'}"
                        </p>
                      </td>
                      <td className="py-6 text-right pr-4">
                        <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-full tracking-tighter">
                          Graded
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-4">
            🎓
          </div>
          <h2 className="text-2xl font-black text-gray-900">No Grades Posted</h2>
          <p className="text-gray-500 max-w-sm font-medium">
            Your teachers haven't posted any grades for your assignments yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
};

const GradeStatCard = ({ label, value, icon, color }: any) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className={`p-8 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all duration-300`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${colors[color as keyof typeof colors]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-3xl font-black text-gray-900 leading-none">{value}</h4>
      </div>
    </div>
  );
};

export default Grade; 
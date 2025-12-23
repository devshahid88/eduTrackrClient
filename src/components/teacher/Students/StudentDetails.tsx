import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  MdPerson, 
  MdEmail, 
  MdSchool, 
  MdClass, 
  MdAssignment, 
  MdCheckCircle, 
  MdTrendingUp, 
  MdAccessTime,
  MdInfo
} from 'react-icons/md';
import axios from '../../../api/axiosInstance';
import { RootState } from '../../../redux/store';

const StudentDetails = ({ studentId, accessToken }) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any>([]);
  const [courses, setCourses] = useState<any>([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    submittedAssignments: 0,
    gradedAssignments: 0,
    totalMarks: 0,
    totalGrade: 0,
    averageGrade: 0
  });

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const studentData = response.data.data || response.data;
        setStudent(studentData);

        const courseIds = new Set();
        if (studentData.departmentId) {
          try {
            const schedulesResponse = await axios.get(
              `/api/schedules/department/${studentData.departmentId}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (schedulesResponse.data.success) {
              const schedules = schedulesResponse.data.data;
              const uniqueCourses: any = [];
              schedules.forEach((schedule) => {
                if (schedule.courseId?._id && !courseIds.has(schedule.courseId._id)) {
                  courseIds.add(schedule.courseId._id);
                  uniqueCourses.push({
                    _id: schedule.courseId._id,
                    code: schedule.courseId.code,
                    name: schedule.courseId.name || 'Unknown Course',
                    teacher: schedule.teacherId?.username || 'TBA',
                    time: `${schedule.startTime} - ${schedule.endTime}`,
                    room: schedule.room,
                  });
                }
              });
              setCourses(uniqueCourses);
            }
          } catch (error) {
            console.error('Error fetching schedules:', error);
          }
        }

        try {
          const assignmentsResponse = await axios.get('/api/assignments', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const allAssignments = assignmentsResponse.data.data || [];
          const filteredAssignments = allAssignments.filter((assignment) => {
            if (!assignment.departmentId || !assignment.courseId) return false;
            const cid = typeof assignment.courseId === 'object' ? assignment.courseId._id : assignment.courseId;
            return (
              assignment.departmentId === studentData.departmentId &&
              courseIds.has(cid)
            );
          });

          const processedAssignments = filteredAssignments.map((assignment) => {
            const sub = assignment.submissions?.find((s) => s.studentId === studentId);
            return {
              _id: assignment._id,
              title: assignment.title,
              course: assignment.courseName || 'N/A',
              status: sub ? 'Submitted' : 'Pending',
              grade: sub?.grade || null,
              feedback: sub?.feedback || null,
              dueDate: assignment.dueDate,
              totalMarks: assignment.maxMarks || 0,
            };
          });

          setAssignments(processedAssignments);

          const s = {
            totalAssignments: processedAssignments.length,
            submittedAssignments: processedAssignments.filter((a) => a.status === 'Submitted').length,
            gradedAssignments: processedAssignments.filter((a) => a.grade !== null).length,
            totalMarks: processedAssignments.reduce((acc, curr) => acc + (curr.totalMarks || 0), 0),
            totalGrade: processedAssignments.reduce((acc, curr) => acc + (curr.grade || 0), 0),
            averageGrade: 0,
          };
          if (s.totalMarks > 0) s.averageGrade = Math.round((s.totalGrade / s.totalMarks) * 100);
          setStats(s);
        } catch (error) {
          console.error('Error fetching assignments:', error);
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId, accessToken]);

  const [isLoading, setIsLoading] = useState(false);

  if (loading || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-black text-gray-400 uppercase tracking-widest">Compiling Records...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
      {/* Profile Sidebar */}
      <div className="xl:col-span-1 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="relative group">
            <img
              className="h-32 w-32 rounded-[2.5rem] object-cover ring-4 ring-blue-50 shadow-lg group-hover:scale-105 transition-transform duration-500"
              src={student?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.firstname + ' ' + student?.lastname)}&background=f1f5f9&color=3b82f6&size=256&bold=true`}
              alt="Profile"
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
               <MdPerson className="text-xl" />
            </div>
          </div>
          
          <h2 className="mt-6 text-2xl font-black text-gray-900 tracking-tight leading-none">{student?.firstname} {student?.lastname}</h2>
          <p className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">ID: {student?.username || 'N/A'}</p>

          <div className="w-full mt-10 space-y-4">
             <InfoRow icon={<MdEmail className="text-blue-500" />} label="Digital Node" value={student?.email || 'N/A'} />
             <InfoRow icon={<MdSchool className="text-emerald-500" />} label="Faculty" value={student?.departmentId?.name || student?.departmentName || 'N/A'} />
             <InfoRow icon={<MdClass className="text-indigo-500" />} label="Academic Level" value={`Grade ${student?.class || 'N/A'}`} />
          </div>
        </div>

        {/* Academic GPA Card */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-900/10 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <MdTrendingUp className="text-7xl rotate-12" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Academic Index</p>
           <h3 className="text-4xl font-black leading-none">{stats.averageGrade}%</h3>
           <p className="mt-4 text-xs font-medium text-gray-400 leading-relaxed">Based on {stats.gradedAssignments} graded submissions out of {stats.totalAssignments} total tasks.</p>
        </div>
      </div>

      {/* Main Insights Area */}
      <div className="xl:col-span-3 space-y-10">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           <DashStat label="Tasks" value={stats.totalAssignments} color="blue" />
           <DashStat label="Submitted" value={stats.submittedAssignments} color="emerald" />
           <DashStat label="Graded" value={stats.gradedAssignments} color="indigo" />
           <DashStat label="Points" value={`${stats.totalGrade}/${stats.totalMarks}`} color="amber" />
        </div>

        {/* Courses Grid */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-sm">📚</div>
                 Enrolled Domains
              </h3>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{courses.length} Modules</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-gray-900 tracking-tight leading-snug">{course.name}</h4>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">{course.code}</span>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                         <MdPerson className="text-blue-500" />
                         <span className="text-gray-600">Lead: {course.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                         <MdAccessTime className="text-emerald-500" />
                         <span className="text-gray-600">{course.time || "Scheduled"}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Assignment Timeline */}
        <div className="space-y-6">
           <h3 className="text-xl font-black text-gray-900 tracking-tight px-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm italic">H</div>
              Academic History
           </h3>
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-50">
                    <thead>
                       <tr className="bg-gray-50/50">
                          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assignment</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Score</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deadline</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 italic font-medium">
                       {assignments.map((a) => (
                         <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-6">
                               <div className="text-sm font-black text-gray-900 not-italic tracking-tight leading-none">{a.title}</div>
                               <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2">{a.course}</div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                 a.status === 'Submitted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                               }`}>
                                  {a.status}
                               </span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="text-sm font-black text-gray-900 not-italic">
                                  {a.grade !== null ? `${a.grade}/${a.totalMarks}` : '--'}
                               </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                               <span className="text-xs text-gray-400 font-bold not-italic">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</span>
                            </td>
                         </tr>
                       ))}
                       {assignments.length === 0 && (
                          <tr>
                             <td colSpan={4} className="px-8 py-20 text-center text-gray-300 opacity-40">
                                <MdInfo className="text-4xl mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Records Found</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helpers --- */

const DashStat = ({ label, value, color }: any) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    amber: 'text-amber-600 bg-amber-50'
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{label}</span>
       <span className={`text-xl font-black ${colors[color as keyof typeof colors]} px-4 py-1 rounded-xl`}>{value}</span>
    </div>
  );
};

const InfoRow = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4 text-left">
     <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
        {icon}
     </div>
     <div className="overflow-hidden">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-bold text-gray-700 truncate">{value}</p>
     </div>
  </div>
);

export default StudentDetails;
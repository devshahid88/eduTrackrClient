import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  MdSchool, 
  MdPeople, 
  MdAssignment, 
  MdCalendarToday, 
  MdNotifications, 
  MdCheckCircle,
  MdPendingActions,
  MdAdd,
  MdTrendingUp,
  MdAutoAwesome
} from 'react-icons/md';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const authState = useSelector((state: RootState) => state.auth);
  const teacherId = authState?.user?.id;
  const accessToken = authState?.accessToken;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!teacherId || !accessToken) return;

      try {
        setIsLoading(true);
        const [teacherRes, scheduleRes, assignmentsRes, notificationsRes] = await Promise.all([
          axios.get(`/api/teachers/${teacherId}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          axios.get(`/api/schedules/teacher/${teacherId}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          axios.get(`/api/assignments/teacher/${teacherId}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          axios.get(`/api/notifications`, { headers: { Authorization: `Bearer ${accessToken}` } })
        ]);

        const tInfo = teacherRes.data.data;
        setTeacherInfo(tInfo);
        setSchedules(scheduleRes.data.data || []);
        setAssignments(assignmentsRes.data.data || []);
        setNotifications(notificationsRes.data.data || []);

        const deptName = tInfo?.departmentId?.name || tInfo?.departmentName;
        if (deptName) {
          const studentsRes = await axios.get("/api/students", { headers: { Authorization: `Bearer ${accessToken}` } });
          const count = studentsRes.data.data.filter((s: any) => s.departmentName?.toLowerCase() === deptName.toLowerCase()).length;
          setStudentCount(count);
        }
      } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacherId, accessToken]);

  /* ---------------- DATA AGGREGATION ---------------- */

  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const ungradedSubmissions = assignments.reduce((acc, curr) => {
      return acc + (curr.submissions?.filter((s: any) => s.grade === undefined || s.grade === null).length || 0);
    }, 0);

    const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayClasses = schedules.filter((s: any) => s.day === todayDay).length;

    return { totalAssignments, ungradedSubmissions, todayClasses };
  }, [assignments, schedules]);

  const recentActivity = useMemo(() => {
    const activities: any[] = [];
    
    // Submissions as activities
    assignments.forEach(a => {
      a.submissions?.forEach((s: any) => {
        activities.push({
          id: `sub-${s.studentId}-${s.submittedAt}`,
          type: 'submission',
          title: 'New Submission',
          description: `${s.studentName} submitted ${a.title}`,
          time: new Date(s.submittedAt),
          icon: <MdAssignment className="text-blue-500" />
        });
      });
    });

    // Notifications as activities
    notifications.slice(0, 10).forEach(n => {
      activities.push({
        id: `notif-${n._id}`,
        type: 'notification',
        title: n.title,
        description: n.message,
        time: new Date(n.createdAt),
        icon: <MdNotifications className="text-amber-500" />
      });
    });

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);
  }, [assignments, notifications]);

  const chartData = useMemo(() => {
    return assignments.slice(0, 6).map(a => ({
      name: a.title.length > 10 ? a.title.substring(0, 8) + '...' : a.title,
      submissions: a.submissions?.length || 0,
      graded: a.submissions?.filter((s: any) => s.grade !== undefined && s.grade !== null).length || 0
    }));
  }, [assignments]);

  /* ---------------- UI ---------------- */

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 animate-pulse font-medium text-sm">Synchronizing your teaching hub...</p>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, {teacherInfo?.firstname || 'Professor'}! 👋
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage your courses and student progress with ease.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <MdCalendarToday className="text-blue-600" />
            <span className="text-sm font-bold text-gray-700">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <button 
            onClick={() => navigate('/teacher/ai')}
            className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:scale-110 transition-transform active:scale-95"
            title="Ask AI Assistant"
          >
            <MdAutoAwesome className="text-xl" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<MdPeople className="text-blue-600" />} 
          label="Active Students" 
          value={studentCount} 
          trend="Department pool"
          color="blue"
        />
        <StatCard 
          icon={<MdAssignment className="text-indigo-600" />} 
          label="Total Assignments" 
          value={stats.totalAssignments} 
          trend="Curriculum overview"
          color="indigo"
        />
        <StatCard 
          icon={<MdPendingActions className="text-amber-600" />} 
          label="Pending Grades" 
          value={stats.ungradedSubmissions} 
          trend="Needs your attention"
          color="amber"
          highlight={stats.ungradedSubmissions > 0}
        />
        <StatCard 
          icon={<MdSchool className="text-emerald-600" />} 
          label="Classes Today" 
          value={stats.todayClasses} 
          trend="Lecture schedule"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Performance Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900">Engagement Overview</h3>
                <p className="text-sm text-gray-500 font-medium">Submissions and grading progress</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl">
                <MdTrendingUp className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                    />
                    <Bar dataKey="submissions" name="Submissions" radius={[6, 6, 0, 0]} barSize={32}>
                       {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                      ))}
                    </Bar>
                    <Bar dataKey="graded" name="Graded" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-100 rounded-[2rem]">
                   <MdAssignment className="text-4xl opacity-20" />
                   <p className="text-sm font-medium">Create assignments to track engagement</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Quick Actions Hub */}
             <div className="bg-gray-900 p-8 rounded-[2rem] shadow-xl text-white">
                <h3 className="text-xl font-black mb-6">Teacher Hub</h3>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => navigate('/teacher/assignments')}
                     className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                   >
                      <MdAdd className="text-2xl mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">New Task</span>
                   </button>
                   <button 
                     onClick={() => navigate('/teacher/students')}
                     className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                   >
                      <MdPeople className="text-2xl mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">Students</span>
                   </button>
                   <button 
                     onClick={() => navigate('/teacher/classes')}
                     className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                   >
                      <MdSchool className="text-2xl mb-2 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">Classes</span>
                   </button>
                   <button 
                     onClick={() => navigate('/teacher/resources')}
                     className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                   >
                      <MdTrendingUp className="text-2xl mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">Resources</span>
                   </button>
                </div>
             </div>

             {/* Today's Classes List */}
             <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                   <MdSchool className="text-blue-50 text-6xl rotate-12" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-6 relative z-10">Today's List</h3>
                <div className="space-y-4 relative z-10 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                   {schedules
                    .filter((s:any) => s.day === new Date().toLocaleDateString("en-US", { weekday: "long" }))
                    .sort((a,b) => a.startTime.localeCompare(b.startTime))
                    .map((s:any) => (
                      <div key={s._id} className="flex flex-col p-3 bg-emerald-50/50 rounded-xl border border-emerald-50/50">
                         <span className="text-xs font-black text-emerald-900">{s.courseId?.name}</span>
                         <span className="text-[10px] font-bold text-emerald-500 mt-1">{s.startTime} - {s.endTime}</span>
                      </div>
                   ))}
                   {schedules.filter((s:any) => s.day === new Date().toLocaleDateString("en-US", { weekday: "long" })).length === 0 && (
                     <p className="text-sm text-gray-400 italic">No classes scheduled for today.</p>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-[640px] flex flex-col">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Activities</h3>
              <div className="flex-1 overflow-y-auto pr-3 space-y-8 custom-scrollbar">
                 {recentActivity.map((activity) => (
                   <div key={activity.id} className="relative pl-12 group">
                      <div className="absolute left-0 top-0 w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                         {activity.icon}
                      </div>
                      <div className="absolute left-5 top-10 w-[1px] h-10 bg-gray-100 group-last:hidden"></div>
                      <div>
                         <p className="text-sm font-black text-gray-800 tracking-tight leading-none">{activity.title}</p>
                         <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{activity.description}</p>
                         <p className="text-[10px] font-bold text-blue-400 mt-3 uppercase tracking-widest">
                           {formatTime(activity.time)}
                         </p>
                      </div>
                   </div>
                 ))}
                 {recentActivity.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                      <MdNotifications className="text-5xl mb-4" />
                      <p className="text-base font-bold">Stay updated with student activity</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color, highlight = false }: any) => {
  const bgColors = {
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50'
  };

  return (
    <div className={`p-6 rounded-[2rem] bg-white border-2 transition-all hover:-translate-y-1 ${highlight ? 'border-amber-200' : 'border-gray-50'}`}>
      <div className={`w-14 h-14 ${bgColors[color as keyof typeof bgColors]} rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm`}>
        {icon}
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
      <div className="flex items-baseline gap-2 mt-2">
        <h4 className="text-4xl font-black text-gray-900 leading-none">{value}</h4>
        <span className={`text-[10px] font-bold ${highlight ? 'text-amber-500' : 'text-gray-400'}`}>{trend}</span>
      </div>
    </div>
  );
};

export default TeacherDashboard;

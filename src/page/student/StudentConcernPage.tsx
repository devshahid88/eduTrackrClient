import React, { useState, useEffect, FormEvent } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  _id: string;
  id?: string;
  role: 'student' | 'teacher' | 'admin';
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

interface Concern {
  _id: string;
  title: string;
  description: string;
  createdBy: User | string;
  createdByRole: 'Student' | 'Teacher' | 'Admin';
  status: 'pending' | 'in_progress' | 'solved' | 'rejected';
  feedback?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const StudentConcernPage: React.FC = () => {
  const authState = useSelector((state: { auth: AuthState }) => state.auth);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newConcern, setNewConcern] = useState<{ title: string; description: string }>({ title: '', description: '' });

  useEffect(() => {
    const fetchConcerns = async () => {
      const userId = authState?.user?._id || authState?.user?.id;
      const accessToken = authState?.accessToken;

      if (!userId || !accessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse<Concern[]>>(`/api/concerns/user/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success) {
          setConcerns(response.data.data || []);
        } else {
          toast.error('Failed to load concerns.');
        }
      } catch (error: any) {
        console.error('Error fetching concerns:', error.response?.data || error.message);
        toast.error(`Failed to load concerns: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcerns();
  }, [authState]);

  const handleRaiseConcern = async (e: FormEvent) => {
    e.preventDefault();
    const userId = authState?.user?._id || authState?.user?.id;
    const accessToken = authState?.accessToken;

    if (!newConcern.title || !newConcern.description) {
      toast.error('Please fill in both title and description.');
      return;
    }

    try {
      const response = await axios.post<ApiResponse<Concern>>(
        '/api/concerns',
        { 
          title: newConcern.title, 
          description: newConcern.description, 
          createdBy: userId, 
          createdByRole: 'Student' 
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response.data.success) {
        toast.success('Concern raised successfully.');
        setConcerns(prev => [...prev, response.data.data]);
        setNewConcern({ title: '', description: '' });
      } else {
        toast.error('Failed to raise concern.');
      }
    } catch (error: any) {
      console.error('Error raising concern:', error.response?.data || error.message);
      toast.error(`Failed to raise concern: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'solved': return 'Solved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <Toaster position="top-right" />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Support & Concerns</h1>
          <p className="text-gray-500 font-medium mt-1">Raise academic or administrative issues.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Raise Concern Form */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 sticky top-32">
                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-sm">✍️</div>
                    New Request
                </h2>
                <form onSubmit={handleRaiseConcern} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Subject Title</label>
                        <input
                            type="text"
                            value={newConcern.title}
                            onChange={(e) => setNewConcern({ ...newConcern, title: e.target.value })}
                            className="w-full h-12 px-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-gray-700 outline-none shadow-inner"
                            placeholder="e.g. Schedule Conflict"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Detailed Description</label>
                        <textarea
                            value={newConcern.description}
                            onChange={(e) => setNewConcern({ ...newConcern, description: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all font-bold text-gray-700 outline-none shadow-inner min-h-[150px]"
                            placeholder="Describe your concern in detail..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                        Submit Concern
                    </button>
                </form>
            </div>
        </div>

        {/* Existing Concerns List */}
        <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight px-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm">📋</div>
                Resolution History
            </h2>

            {isLoading ? (
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white h-40 rounded-[2.5rem] border border-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : concerns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-4xl mb-2">
                        🛡️
                    </div>
                    <h3 className="text-xl font-black text-gray-900">No Concerns Filed</h3>
                    <p className="text-gray-500 max-w-sm font-medium">Your support history is clear. If you have any issues, use the form to get started.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {concerns.map((concern) => {
                        const styleMap: any = {
                            'solved': 'bg-emerald-50 border-emerald-100 text-emerald-600',
                            'pending': 'bg-amber-50 border-amber-100 text-amber-600',
                            'in_progress': 'bg-blue-50 border-blue-100 text-blue-600',
                            'rejected': 'bg-rose-50 border-rose-100 text-rose-600'
                        };
                        const statusColor = styleMap[concern.status] || 'bg-gray-50 border-gray-100 text-gray-500';

                        return (
                            <div key={concern._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col gap-6 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${statusColor}`}>
                                                {getStatusLabel(concern.status)}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                ID: {concern._id ? concern._id.slice(-6) : 'NEW'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                            {concern.title}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        🗓️ {concern.createdAt ? new Date(concern.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                                    </span>
                                </div>

                                <p className="text-sm font-medium text-gray-500 leading-relaxed italic border-l-4 border-gray-50 pl-6 py-2">
                                    "{concern.description}"
                                </p>

                                {concern.feedback && (
                                    <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-50 flex items-start gap-4">
                                        <div className="text-blue-400 text-lg">💡</div>
                                        <div>
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Admin Feedback</span>
                                            <p className="text-xs font-bold text-blue-900 leading-relaxed">
                                                {concern.feedback}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentConcernPage;

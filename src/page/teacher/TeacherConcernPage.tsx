import React, { useState, useEffect, FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { MdMenu } from 'react-icons/md';
import Header from '../../components/common/Header';
import TeacherSideBar from '../../components/teacher/common/Sidebar';
import axios from '../../api/axiosInstance';
import toast from 'react-hot-toast';

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
  raisedBy: User;
  role: 'student' | 'teacher';
  status: 'Pending' | 'In Progress' | 'Solved' | 'Rejected';
  feedback?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const TeacherConcernPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const authState = useSelector((state: { auth: AuthState }) => state.auth);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newConcern, setNewConcern] = useState<{ title: string; description: string }>({ title: '', description: '' });

  useEffect(() => {
    const fetchConcerns = async () => {
      const userId = authState?.user?._id || authState?.user?.id;
      const accessToken = authState?.accessToken;

      if (!userId || !accessToken) {
        console.log('Missing auth data:', { userId, hasToken: !!accessToken });
        toast.error('Please log in to view concerns.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse<Concern[]>>(`/api/concerns/user/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Teacher Concerns:', response.data.data);
        if (response.data.success) {
          setConcerns(response.data.data);
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
        { title: newConcern.title, description: newConcern.description, raisedBy: userId, role: 'teacher' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response.data.success) {
        toast.success('Concern raised successfully.');
        setConcerns([...concerns, response.data.data]);
        setNewConcern({ title: '', description: '' });
      } else {
        toast.error('Failed to raise concern.');
      }
    } catch (error: any) {
      console.error('Error raising concern:', error.response?.data || error.message);
      toast.error(`Failed to raise concern: ${error.response?.data?.message || error.message}`);
    }
  };

  // Function to determine card background color based on status
  const getStatusStyles = (status: Concern['status']) => {
    switch (status) {
      case 'Solved':
        return 'border-l-green-500 bg-green-50';
      case 'Pending':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'In Progress':
        return 'border-l-blue-500 bg-blue-50';
      case 'Rejected':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <TeacherSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-white shadow-md p-4 md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MdMenu size={30} className="text-gray-700" />
          </button>
          <Header role="teacher" />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header role="teacher" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">My Concerns</h1>
              <p className="text-gray-600">Manage and track your concerns here.</p>
            </div>

            {/* Raise Concern Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Raise a New Concern</h2>
              <form onSubmit={handleRaiseConcern}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newConcern.title}
                    onChange={(e) => setNewConcern({ ...newConcern, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    placeholder="Enter concern title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-smってお

System: font-medium text-gray-700">Description</label>
                  <textarea
                    value={newConcern.description}
                    onChange={(e) => setNewConcern({ ...newConcern, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    rows={4}
                    placeholder="Describe your concern"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Raise Concern
                </button>
              </form>
            </div>

            {/* Concerns List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-lg text-gray-600">Loading concerns...</p>
              </div>
            ) : concerns.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Concerns Raised</h3>
                <p className="text-gray-600">You haven't raised any concerns yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold之前的

System: font-semibold text-gray-900 mb-4">Your Concerns</h2>
                <div className="space-y-4">
                  {concerns.map((concern) => (
                    <div
                      key={concern._id}
                      className={`border-l-4 p-4 rounded-r-lg ${getStatusStyles(concern.status)}`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{concern.title}</h3>
                      <p className="text-gray-600 mt-1">{concern.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Status: <span className="font-medium">{concern.status}</span>
                          </p>
                          {concern.feedback && (
                            <p className="text-sm text-gray-700">
                              Feedback: <span className="font-medium">{concern.feedback}</span>
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Raised on: {new Date(concern.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherConcernPage;
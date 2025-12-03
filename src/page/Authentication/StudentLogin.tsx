import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "../../api/axiosInstance";
import { toast } from 'react-hot-toast'; // Import toast
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email');
      toast.error('Please enter a valid email');
      return;
    }
  
    try {
      setError('');
      setLoading(true);
  
      const response = await axios.post('/auth/loginStudent', formData,{
  withCredentials: true,
});
      console.log(response)
      const { accessToken, student } = response.data.data;
    
  
      // Save to localStorage
      localStorage.setItem('accessToken', accessToken);
      
  
      // Update Redux store
      dispatch(loginSuccess({
        accessToken,
        user: student,
      }));
  
      // Navigate to dashboard
      const from = location.state?.from?.pathname || '/student/dashboard';
      console.log(from)
      toast.success('Login successful! Redirecting...');
      navigate(from, { replace: true });
  
  } catch (err:any) {
  console.log("Caught error:", err);
  setLoading(false);
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || 'Login failed';
    if (status === 401) {
      toast.error(message);
    } else if (status === 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
  } else if (err.request) {
    toast.error('No response from server. Please try again.');
  } else {
    toast.error(err.message || 'Something went wrong.');
  }
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Gradient Background */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <h2 className="text-white text-4xl font-bold mb-4">Welcome to EduTrackr</h2>
            <p className="text-purple-100 text-lg">Student Portal - Your Learning Journey</p>
            <div className="mt-8 flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-purple-200"></div>
              <div className="w-2 h-2 rounded-full bg-purple-300"></div>
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-12 sm:p-16">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Login</h1>
              <p className="text-gray-600">Welcome back, learner!</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email ID
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/auth/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Logging in...' : 'Login as Student'}
              </button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign in as</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Link
                    to="/auth/admin-login"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Admin
                  </Link>
                  <Link
                    to="/auth/teacher-login"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Teacher
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;

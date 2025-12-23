import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "../../api/axiosInstance";
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.post('/auth/loginStudent', formData, {
        withCredentials: true,
      });
      
      const { accessToken, student } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      
      dispatch(loginSuccess({
        accessToken,
        user: student,
      }));
  
      const from = location.state?.from?.pathname || '/student/dashboard';
      toast.success('Access Granted. Welcome back!');
      navigate(from, { replace: true });
  
    } catch (err: any) {
      setLoading(false);
      const message = err.response?.data?.message || 'Authentication failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl px-4"
      >
        {/* Glass Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 mb-6 shadow-lg shadow-purple-500/20"
            >
              <span className="text-white text-3xl font-bold">E</span>
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Student Access</h1>
            <p className="text-gray-400 text-lg">Knowledge is power. Access yours now.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Protocol</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiMail className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="name@institution.edu"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Secure Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${formData.rememberMe ? 'bg-purple-600' : 'bg-gray-700'}`} />
                  <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${formData.rememberMe ? 'translate-x-5' : ''}`} />
                </div>
                <span className="ml-3 text-gray-400 group-hover:text-gray-300 transition-colors">Persistent Link</span>
              </label>
              <Link to="/auth/forgot-password" title="Recover Secure Key" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Lost Key?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full group relative flex items-center justify-center py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl text-white font-semibold shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="relative flex items-center">
                {loading ? 'Decrypting Access...' : 'Initialize Session'}
                {!loading && <HiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </motion.button>

            {/* Role Switcher */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-sm text-gray-500 mb-4">Switch Terminal Protocol</p>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/auth/teacher-login"
                  className="flex items-center justify-center py-3 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm"
                >
                  Faculty Portal
                </Link>
                <Link
                  to="/auth/admin-login"
                  className="flex items-center justify-center py-3 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm"
                >
                  Admin HQ
                </Link>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;

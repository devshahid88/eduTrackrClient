import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "../../api/axiosInstance";
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiLightningBolt } from 'react-icons/hi';
import { motion } from 'framer-motion';

const TeacherLogin = () => {
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
      toast.error('Credentials Required');
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.post('/auth/loginTeacher', formData, {
        withCredentials: true,
      });
      const { accessToken, teacher } = response.data.data;

      dispatch(loginSuccess({
        accessToken,
        user: { ...teacher, role: 'teacher' }
      }));
      
      toast.success('Faculty Access Verified');
      const from = location.state?.from?.pathname || '/teacher/dashboard';
      navigate(from, { replace: true });
  
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Access Denied');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#022c22]">
      {/* Bioluminescent Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl px-4"
      >
        {/* Faculty Glass Card */}
        <div className="backdrop-blur-3xl bg-emerald-950/20 border border-emerald-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12">
          {/* Branded Header */}
          <div className="text-center mb-10">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mb-6 shadow-lg shadow-emerald-500/20"
            >
              <HiLightningBolt className="text-white text-3xl" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Faculty Terminal</h1>
            <p className="text-emerald-400/80 text-lg font-medium">Orchestrate the Learning Experience.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-emerald-100/60 ml-1">Staff Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiMail className="h-5 w-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl text-white placeholder-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  placeholder="faculty@edutrackr.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-emerald-100/60 ml-1">Secure Passkey</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-12 py-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl text-white placeholder-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-500/50 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

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
                  <div className={`w-10 h-5 rounded-full transition-colors ${formData.rememberMe ? 'bg-emerald-500' : 'bg-emerald-900/40'}`} />
                  <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${formData.rememberMe ? 'translate-x-5' : ''}`} />
                </div>
                <span className="ml-3 text-emerald-100/60 group-hover:text-emerald-100 transition-colors">Remember Protocol</span>
              </label>
              <Link to="/auth/forgot-password" title="Recover Staff Access" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Recover Key
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full group relative flex items-center justify-center py-4 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl text-white font-bold shadow-xl shadow-emerald-900/40 hover:shadow-emerald-500/20 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="relative flex items-center">
                {loading ? 'Verifying Faculty...' : 'Authorize Session'}
              </span>
            </motion.button>

            <div className="mt-8 pt-8 border-t border-emerald-500/10">
              <p className="text-center text-xs font-bold text-emerald-500/40 mb-4 tracking-[0.2em] uppercase">Jump Stream</p>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/auth/student-login"
                  className="flex items-center justify-center py-3 bg-emerald-950/40 border border-emerald-500/10 rounded-xl text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all text-sm font-medium"
                >
                  Student Hub
                </Link>
                <Link
                  to="/auth/admin-login"
                  className="flex items-center justify-center py-3 bg-emerald-950/40 border border-emerald-500/10 rounded-xl text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all text-sm font-medium"
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

export default TeacherLogin;

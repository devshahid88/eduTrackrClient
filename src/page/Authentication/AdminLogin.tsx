import React, { useState } from 'react';
import axios from "../../api/axiosInstance";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { loginSuccess } from '../../redux/slices/authSlice';
import { HiShieldCheck, HiFingerPrint, HiLockClosed, HiTerminal } from 'react-icons/hi';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      toast.error('Authentication Credentials Required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('auth/loginAdmin', formData, {
        withCredentials: true,
      });
      const { accessToken, admin } = response.data.data;

      if (formData.rememberMe) {
        localStorage.setItem('accessToken', accessToken);
      }

      dispatch(loginSuccess({ accessToken, user: admin }));
      toast.success('Security Protocol Verified');
      
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1000); 

    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Access Denied: Level 1 Security Failure');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black font-mono">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-1" />

      {/* Pulsing Shield Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        <div className="bg-black/80 backdrop-blur-3xl border-2 border-blue-900/50 rounded-[2rem] p-10 shadow-[0_0_50px_rgba(30,58,138,0.3)]">
          {/* Admin Sigil */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-blue-500 rounded-full opacity-20" />
                <div className="relative bg-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-500/40">
                  <HiShieldCheck className="text-white text-4xl" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-[0.3em] mb-2">Command Center</h1>
            <div className="flex items-center justify-center gap-2 text-blue-500 text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              AUTHENTICATION REQUIRED
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Administrator ID</label>
                <HiFingerPrint className="text-blue-900" />
              </div>
              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-blue-950/20 border border-blue-900/50 rounded-xl px-5 py-4 text-blue-100 placeholder-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                  placeholder="admin.terminal@edutrackr.sys"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Secret Protocol</label>
                <HiLockClosed className="text-blue-900" />
              </div>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-blue-950/20 border border-blue-900/50 rounded-xl px-5 py-4 text-blue-100 placeholder-blue-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                placeholder="••••••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center group cursor-pointer">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${formData.rememberMe ? 'bg-blue-600 border-blue-600' : 'border-blue-900 group-hover:border-blue-500'}`}>
                  {formData.rememberMe && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="ml-3 text-[10px] font-black text-blue-900 group-hover:text-blue-500 transition-colors uppercase tracking-widest">Latching Persistent</span>
              </label>
              <Link to="/auth/forgot-password font-sans" className="text-[10px] font-black text-blue-600 hover:text-blue-400 uppercase tracking-widest">
                Override Key
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden py-5 bg-blue-600 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? 'INITIALIZING...' : 'Login As Sovereign'}
                <HiTerminal className="text-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </button>

            <div className="mt-8 pt-8 border-t border-blue-900/30">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/auth/teacher-login"
                  className="py-3 border border-blue-900/30 rounded-lg text-center text-[10px] text-blue-800 hover:text-blue-400 hover:border-blue-500 transition-all font-black uppercase tracking-widest"
                >
                  Faculty Node
                </Link>
                <Link
                  to="/auth/student-login"
                  className="py-3 border border-blue-900/30 rounded-lg text-center text-[10px] text-blue-800 hover:text-blue-400 hover:border-blue-500 transition-all font-black uppercase tracking-widest"
                >
                  Scholar Node
                </Link>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

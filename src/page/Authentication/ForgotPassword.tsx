import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "../../api/axiosInstance";


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        '/auth/forgotPassword',
        { email }
      );

      if (data.success) {
        // assume your backend returns a reset token:
        setResetToken(data.token);
        setIsSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err:any) {
      setError(
        err.response?.data?.message ||
        'Server error. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side Gradient Panel */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <h2 className="text-white text-4xl font-bold mb-4">Password Recovery</h2>
            <p className="text-indigo-100 text-lg">
              Don’t worry, we’ll help you get back into your account
            </p>
            <div className="mt-8 flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-200"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-1/2 p-12 sm:p-16">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
              <p className="text-gray-600">Enter your email to receive a reset link</p>
            </div>

            {isSubmitted ? (
              <div className="rounded-lg bg-green-50 p-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-green-800">Check your email!</h3>
                <p className="mt-2 text-sm text-green-600">
                  We've sent a reset link to <strong>{email}</strong>.
                </p>
                {resetToken && (
                  <button
                    onClick={() => navigate(`/auth/reset-password/${resetToken}`)}
                    className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Reset Password Now
                  </button>
                )}
                <div className="mt-4">
                  <Link
                    to="/auth/student-login"
                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    ← Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                >
                  {loading ? 'Processing...' : 'Send Reset Link'}
                </button>

                <div className="text-center">
                  <Link
                    to="/auth/student-login"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    ← Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

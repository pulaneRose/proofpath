import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(fullName, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-display font-black text-3xl tracking-tight text-slate-900 group-hover:text-purple-700 transition-colors">
              ProofPath
            </span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-slate-900">Create Private Account</h2>
          <p className="text-sm text-slate-500 mt-1 font-normal">Preserve your evidence securely with cryptographic integrity</p>
        </div>

        {/* Card */}
        <div className="cyber-card p-8 sm:p-10 shadow-2xl">
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-base transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-500 mt-6 font-normal">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-700 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

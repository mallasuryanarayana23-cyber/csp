import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { apiClient } from '../../services/api/client';
import { BrainCircuit, Lock, Mail, User, GraduationCap, Shield, Heart, Eye, ArrowRight } from 'lucide-react';
import ParticleNetwork from '../../components/ParticleNetwork';

interface LoginPageProps {
  onToggleRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onToggleRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore(state => state.login);

  const handleLogin = async (e: React.FormEvent, customCredentials?: { email: string; pass: string }) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const targetEmail = customCredentials ? customCredentials.email : email;
    const targetPassword = customCredentials ? customCredentials.pass : password;

    try {
      const res = await apiClient.post('/api/auth/login', { email: targetEmail, password: targetPassword });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'student' | 'teacher' | 'parent' | 'admin') => {
    const creds = {
      student: { email: 'student@neurolearn.com', pass: 'password123' },
      teacher: { email: 'teacher@neurolearn.com', pass: 'password123' },
      parent: { email: 'parent@neurolearn.com', pass: 'password123' },
      admin: { email: 'admin@neurolearn.com', pass: 'password123' },
    };
    const target = creds[role];
    setEmail(target.email);
    setPassword(target.pass);
    
    // Auto submit
    setTimeout(() => {
      handleLogin(null as any, target);
    }, 100);
  };

  return (
    <div className="flex min-h-screen bg-[#050816] text-slate-100 font-sans overflow-hidden">
      {/* Left Column: Interactive Telemetry Visualization Visual Split */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-indigo-500/10">
        <div className="absolute inset-0 z-0">
          <ParticleNetwork />
        </div>
        
        {/* Subtle decorative radial gradient orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-200 bg-clip-text text-transparent tracking-wide">
            NEUROLEARN
          </span>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-lg my-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
              <span>Enterprise AI Screening Protocol</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-display font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Empowering Neurodiverse Minds.
            </h1>
            <p className="text-slate-400 leading-relaxed text-base">
              A premium, deep-learning platform that screens for reading difficulties using multi-modal telemetry—voice hesitations, keystroke rhythm, and visual eye-gaze tracking.
            </p>
          </div>

          <div className="space-y-4">
            {/* Feature 1 */}
            <div className="flex items-start space-x-3 bg-slate-900/40 border border-slate-800/40 p-3.5 rounded-xl backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                <Eye className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Gaze Deviation Metrics</h4>
                <p className="text-xs text-slate-400 mt-0.5">Real-time webcam tracking measures focal shifts and tracking skips.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-3 bg-slate-900/40 border border-slate-800/40 p-3.5 rounded-xl backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                <BrainCircuit className="w-4.5 h-4.5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Whisper Voice Phonetics</h4>
                <p className="text-xs text-slate-400 mt-0.5">PyTorch models highlight exact grapheme-phoneme hesitation intervals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer metadata */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>© 2026 NeuroLearn Systems, Inc.</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Core Cluster Online</span>
          </span>
        </div>
      </div>

      {/* Right Column: Premium Auth Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 relative">
        {/* Glow behind card for gorgeous visual balance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

        {/* Small mobile branding header */}
        <div className="lg:hidden flex items-center space-x-2 absolute top-8 left-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg bg-gradient-to-r from-indigo-200 to-slate-100 bg-clip-text text-transparent">
            NEUROLEARN
          </span>
        </div>

        <div className="w-full max-w-[440px] space-y-8 relative z-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="text-slate-400 text-sm">
              Sign in to manage student screening pipelines and access cognitive dashboards.
            </p>
          </div>

          {/* Quick Demo Login Pill Roster */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
              Quick Sandbox Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('student')}
                disabled={loading}
                className="flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-2.5 rounded-xl text-left text-xs font-medium text-slate-300 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 transition-colors flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">Leo Sterling</div>
                  <div className="text-[10px] text-slate-500">Student Demo</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin('teacher')}
                disabled={loading}
                className="flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-900 border border-slate-800 hover:border-violet-500/40 p-2.5 rounded-xl text-left text-xs font-medium text-slate-300 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 flex items-center justify-center text-violet-400 transition-colors flex-shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">Prof. Vance</div>
                  <div className="text-[10px] text-slate-500">Educator Demo</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin('parent')}
                disabled={loading}
                className="flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-xl text-left text-xs font-medium text-slate-300 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors flex-shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">Helen Sterling</div>
                  <div className="text-[10px] text-slate-500">Parent Demo</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-2.5 rounded-xl text-left text-xs font-medium text-slate-300 transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 flex items-center justify-center text-cyan-400 transition-colors flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">Dr. Carter</div>
                  <div className="text-[10px] text-slate-500">Admin Demo</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-slate-800" />
            <span className="mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Or Use Form
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm leading-snug animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                  placeholder="teacher@school.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/10 cursor-pointer flex items-center justify-center space-x-2 group mt-6"
            >
              {loading ? (
                <span>Authenticating Profile...</span>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400 pt-2">
            Don't have an account?{' '}
            <button
              onClick={onToggleRegister}
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

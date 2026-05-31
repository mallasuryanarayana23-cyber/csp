import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { apiClient } from '../../services/api/client';
import { BrainCircuit, Lock, Mail, User, Shield, GraduationCap, Heart, ArrowRight, ArrowLeft, Check, Sparkles, Eye } from 'lucide-react';
import ParticleNetwork from '../../components/ParticleNetwork';

interface RegisterPageProps {
  onToggleLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onToggleLogin }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT'>('STUDENT');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('4th Grade');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useStore(state => state.login);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', score: 0, color: 'bg-slate-800' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', score, color: 'bg-red-500' };
    if (score <= 3) return { label: 'Medium', score, color: 'bg-yellow-500' };
    return { label: 'Strong', score, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!name || !email || !password) {
        setError('Please fill in all basic fields.');
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      // Backend strength check matching regular expression
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        setError('Password must contain at least one uppercase letter and one numeric digit.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        role, 
        schoolName: schoolName || undefined,
        grade: role === 'STUDENT' ? grade : undefined
      });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
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
              Start Your Journey.
            </h1>
            <p className="text-slate-400 leading-relaxed text-base">
              Join thousands of educators, parents, and students leveraging deep sensory models to detect learning difficulties early and unlock matching accommodations.
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

      {/* Right Column: Premium Onboarding Registration Card */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 relative overflow-y-auto py-12">
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

        <div className="w-full max-w-[440px] space-y-6 relative z-10">
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between px-2 mb-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center flex-grow last:flex-grow-0">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step === num 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-110'
                      : step > num
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 3 && (
                  <div 
                    className={`h-[2px] flex-grow mx-2 transition-colors ${
                      step > num ? 'bg-emerald-500/30' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              {step === 1 && 'Basic Account Info'}
              {step === 2 && 'Choose Your Journey'}
              {step === 3 && 'Educational Context'}
            </h2>
            <p className="text-slate-400 text-xs">
              {step === 1 && 'Step 1 of 3: Provide secure login credentials'}
              {step === 2 && 'Step 2 of 3: Select your primary NeuroLearn role'}
              {step === 3 && 'Step 3 of 3: Align your institution profile'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center leading-normal animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                      placeholder="Marcus Sterling"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                      placeholder="marcus@academy.org"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Password Strength</span>
                        <span className={strength.score >= 4 ? 'text-emerald-400' : strength.score >= 2 ? 'text-yellow-400' : 'text-red-400'}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full rounded bg-slate-950 overflow-hidden">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div 
                            key={i} 
                            className={`h-full rounded transition-all ${
                              strength.score >= i ? strength.color : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-500 block leading-tight">Must be at least 6 characters and contain an uppercase letter and a digit.</span>
                    </div>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/10 cursor-pointer flex items-center justify-center space-x-2 group"
                >
                  <span>Continue Setup</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* STEP 2: Role Selection Card Mapping */}
            {step === 2 && (
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block text-center mb-1">
                  Select Your Onboarding Role
                </span>
                
                <div className="space-y-3">
                  {/* Student Card */}
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'STUDENT'
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/5'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      role === 'STUDENT' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-slate-200">I am a Student</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Take screening exercises and trace metrics.</p>
                    </div>
                    {role === 'STUDENT' && (
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                    )}
                  </button>

                  {/* Teacher Card */}
                  <button
                    type="button"
                    onClick={() => setRole('TEACHER')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'TEACHER'
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/5'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      role === 'TEACHER' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-900 text-slate-500'
                    }`}>
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-slate-200">I am an Educator</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Monitor classrooms and generate PDF reports.</p>
                    </div>
                    {role === 'TEACHER' && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                    )}
                  </button>

                  {/* Parent Card */}
                  <button
                    type="button"
                    onClick={() => setRole('PARENT')}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'PARENT'
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      role === 'PARENT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'
                    }`}>
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-slate-200">I am a Parent</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Link profiles and access parent-friendly summaries.</p>
                    </div>
                    {role === 'PARENT' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                    )}
                  </button>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center justify-center space-x-2 border border-slate-800 hover:bg-slate-900 text-slate-400 py-3.5 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="flex-grow flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 px-5 rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/10 cursor-pointer group"
                  >
                    <span>Verify Profile Role</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Educational Context */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    School / Institution Name
                  </label>
                  <input 
                    type="text" 
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                    placeholder="e.g. Oakridge Academy"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    Providing your school helps bundle diagnostic reports by region.
                  </span>
                </div>

                {role === 'STUDENT' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Current Grade
                    </label>
                    <div className="relative">
                      <select 
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-indigo-500 outline-none appearance-none text-slate-200"
                      >
                        <option value="1st Grade">1st Grade</option>
                        <option value="2nd Grade">2nd Grade</option>
                        <option value="3rd Grade">3rd Grade</option>
                        <option value="4th Grade">4th Grade</option>
                        <option value="5th Grade">5th Grade</option>
                        <option value="6th Grade">6th Grade</option>
                        <option value="7th Grade">7th Grade</option>
                        <option value="8th Grade">8th Grade</option>
                        <option value="High School">High School</option>
                      </select>
                      <div className="absolute right-4 top-3.5 pointer-events-none w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-500" />
                    </div>
                  </div>
                )}

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-2.5 pt-2">
                  <input 
                    type="checkbox" 
                    required
                    id="terms"
                    className="mt-1 w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <label htmlFor="terms" className="text-xs text-slate-400 leading-snug">
                    I consent to anonymous telemetry storage of typing speeds, audio frequencies, and webcam gaze deviation bounds under strictly secure HIPAA parameters.
                  </label>
                </div>

                <div className="flex space-x-3 pt-3">
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center justify-center space-x-2 border border-slate-800 hover:bg-slate-900 text-slate-400 py-3.5 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-grow flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-3.5 px-5 rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/10 cursor-pointer group"
                  >
                    <Sparkles className="w-4.5 h-4.5 text-indigo-300 animate-pulse" />
                    <span>{loading ? 'Creating Account...' : 'Complete Register'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center text-sm text-slate-400 pt-2">
            Already have an account?{' '}
            <button 
              onClick={onToggleLogin} 
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

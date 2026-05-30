import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Eye, 
  Accessibility, 
  Bell, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Award, 
  Sliders, 
  Layers, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeRole, setRole, logout, accessibility, toggleAccessibility, setFontScale, notifications, markNotificationRead } = useStore();
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
      
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3 cursor-pointer group">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
            NL
          </div>
          <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-emerald-300 font-sans">
            NEURO<span className="text-emerald-400 font-light">LEARN</span>
          </h1>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-rajdhani leading-tight">
            Cognitive Diagnostics & Support
          </span>
        </div>
      </div>

      {/* Center Dynamic Role Switcher Menu */}
      <div className="hidden md:flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
        {(['student', 'teacher', 'parent', 'admin'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeRole === r 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Right Controls Actions */}
      <div className="flex items-center space-x-4">
        
        {/* Mobile Role Switch Trigger */}
        <div className="relative md:hidden">
          <button 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="p-2.5 rounded-xl bg-slate-900/60 text-slate-300 border border-white/5 hover:text-white transition-colors"
            title="Switch User Role"
          >
            <Layers className="w-4 h-4" />
          </button>
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel p-2 shadow-2xl z-50 border border-white/10">
              <span className="text-[10px] text-slate-500 block px-3 py-1 font-semibold uppercase">Toggle Portal Role</span>
              {(['student', 'teacher', 'parent', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors ${
                    activeRole === r 
                      ? 'bg-indigo-600/20 text-indigo-400 font-semibold' 
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {r} Portal
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accessibility Button */}
        <div className="relative">
          <button 
            onClick={() => setShowAccessDropdown(!showAccessDropdown)}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${
              showAccessDropdown || Object.values(accessibility).some(v => v === true)
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20 ' 
                : 'bg-slate-900/60 text-slate-300 border-white/5 hover:text-white'
            }`}
            title="Accessibility Controls"
          >
            <Accessibility className="w-5 h-5" />
          </button>
          
          {showAccessDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-4 shadow-2xl z-50 border border-white/10 font-sans">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="font-bold text-sm tracking-wide text-slate-200">Accessibility Cockpit</span>
                <Sliders className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="space-y-3.5">
                {/* Dyslexia Font Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block">Dyslexia-Friendly Font</label>
                    <span className="text-[10px] text-slate-500">Enable high-legibility letters</span>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('dyslexiaFont')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${accessibility.dyslexiaFont ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${accessibility.dyslexiaFont ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* High Contrast Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block">High Contrast Mode</label>
                    <span className="text-[10px] text-slate-500">Pure monochrome colors</span>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('highContrast')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${accessibility.highContrast ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${accessibility.highContrast ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Gaze/Reading Line Tracker Ruler */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block">Reading Guide Line</label>
                    <span className="text-[10px] text-slate-500">Horizontal tracker line guide</span>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('readingRuler')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${accessibility.readingRuler ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${accessibility.readingRuler ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Screen Voice Navigation Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block">Voice Synthesizer Guide</label>
                    <span className="text-[10px] text-slate-500">Text-to-speech visual reading</span>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('voiceNavigation')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${accessibility.voiceNavigation ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${accessibility.voiceNavigation ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Font Scaling Buttons */}
                <div className="pt-2 border-t border-white/5">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Text Size Scaling</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 1.15, 1.3] as const).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setFontScale(scale)}
                        className={`py-1 text-xs font-medium rounded-lg transition-colors ${
                          accessibility.fontSizeScale === scale 
                            ? 'bg-indigo-600 text-white font-bold' 
                            : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {scale === 1 ? '100%' : scale === 1.15 ? '115%' : '130%'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Indicator Popover */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifyDropdown(!showNotifyDropdown)}
            className="p-2.5 rounded-xl bg-slate-900/60 text-slate-300 border border-white/5 hover:text-white transition-colors relative"
            title="Notifications Feed"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border border-[#030712] rounded-full animate-bounce"></span>
            )}
          </button>
          
          {showNotifyDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-4 shadow-2xl z-50 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="font-bold text-sm tracking-wide text-slate-200">Activity Telemetry Logs</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No recent activity logs.</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                        n.read ? 'border-white/5 bg-transparent' : 'border-indigo-500/20 bg-indigo-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${
                          n.type === 'warning' ? 'text-amber-400 font-bold' : n.type === 'success' ? 'text-emerald-400' : 'text-indigo-400'
                        }`}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{n.message}</p>
                      <span className="text-[9px] text-slate-500 block mt-1">{n.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card Portal Tag */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-xs">
            {user ? user.name[0] : 'S'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-semibold text-slate-200 block truncate max-w-[120px]">{user ? user.name : ' Sophia Alvarez'}</span>
            <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-rajdhani font-bold leading-none block">{activeRole} Role</span>
          </div>
        </div>

      </div>
    </nav>
  );
};
export default Navbar;

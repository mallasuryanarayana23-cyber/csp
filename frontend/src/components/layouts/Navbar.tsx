import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Eye, 
  Accessibility, 
  Bell, 
  User, 
  LogOut, 
  Award, 
  Sliders, 
  Layers, 
  CheckCircle,
  HelpCircle,
  X,
  Volume2,
  BookOpen,
  Sparkles,
  ChevronRight,
  Info,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    user, 
    activeRole, 
    setRole, 
    logout, 
    accessibility, 
    toggleAccessibility, 
    setFontScale, 
    notifications, 
    markNotificationRead 
  } = useStore();

  const [isAccessDrawerOpen, setIsAccessDrawerOpen] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  return (
    <nav className="sticky top-0 z-40 bg-[#050816]/80 backdrop-blur-xl border-b border-indigo-500/10 px-6 py-4 flex items-center justify-between transition-all duration-300">
      
      {/* Brand Logo & Wordmark with Circuit Accent */}
      <div className="flex items-center space-x-3 cursor-pointer group">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300 border border-indigo-400/20">
            NL
          </div>
          <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none"></div>
        </div>
        <div>
          <h1 className="text-lg font-display font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-cyan-200">
            NEURO<span className="text-indigo-400 font-light font-sans">LEARN</span>
          </h1>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-medium leading-none mt-0.5">
            Cognitive Diagnostics Suite
          </span>
        </div>
      </div>

      {/* Center Dynamic Role Switcher with Underline Sliding Indicator */}
      <div className="hidden md:flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-indigo-500/10 relative">
        {(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'] as const).map((r) => {
          const isActive = activeRole === r;
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer relative z-10 ${
                isActive 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls Actions */}
      <div className="flex items-center space-x-3.5">
        
        {/* Mobile Role Switch Trigger */}
        <div className="relative md:hidden">
          <button 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="p-2.5 rounded-xl bg-slate-900/60 text-slate-300 border border-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Switch User Role"
          >
            <Layers className="w-4.5 h-4.5" />
          </button>
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0d1526] p-2 shadow-2xl z-50 border border-indigo-500/15 backdrop-blur-xl">
              <span className="text-[9px] text-slate-500 block px-3 py-1.5 font-bold uppercase tracking-widest">Portal Navigation</span>
              {(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeRole === r 
                      ? 'bg-indigo-500/10 text-indigo-400 font-semibold' 
                      : 'text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  {r} Portal
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accessibility drawer trigger */}
        <button 
          onClick={() => setIsAccessDrawerOpen(true)}
          className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
            Object.values(accessibility).some(v => v === true || v > 1)
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/5' 
              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:text-white'
          }`}
          title="Accessibility Cockpit Drawer"
        >
          <Accessibility className="w-5 h-5 animate-pulse" />
        </button>

        {/* Notifications Indicator Popover */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifyDropdown(!showNotifyDropdown)}
            className="p-2.5 rounded-xl bg-slate-900/60 text-slate-300 border border-slate-800 hover:text-white transition-colors relative cursor-pointer"
            title="Telemetry Audit Feed"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-[#050816] rounded-full animate-bounce"></span>
            )}
          </button>
          
          {showNotifyDropdown && (
            <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-[#0d1526] p-4 shadow-2xl z-50 border border-indigo-500/15 backdrop-blur-xl font-sans text-left">
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2 mb-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">System Telemetry Logs</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full">{unreadCount} Active</span>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <p className="text-[11px]">No active telemetry alerts found.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isWarning = n.type === 'warning';
                    const isSuccess = n.type === 'success';
                    return (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                          n.read 
                            ? 'border-slate-800/60 bg-slate-900/10 opacity-60' 
                            : isWarning 
                              ? 'border-amber-500/20 bg-amber-500/5'
                              : isSuccess
                                ? 'border-emerald-500/20 bg-emerald-500/5'
                                : 'border-indigo-500/20 bg-indigo-500/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className={`text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
                            isWarning ? 'text-amber-400' : isSuccess ? 'text-emerald-400' : 'text-indigo-400'
                          }`}>
                            {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
                            {isSuccess && <CheckCircle className="w-3.5 h-3.5" />}
                            {!isWarning && !isSuccess && <Info className="w-3.5 h-3.5" />}
                            <span>{n.title}</span>
                          </span>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-400 mt-0.5 flex-shrink-0 animate-ping" />}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">{n.message}</p>
                        <span className="text-[9px] text-slate-500 block mt-1.5">{n.date}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card Tag & Logout */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-indigo-500/15">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/15 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
            {user?.name ? String(user.name).charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-[11px] font-bold text-slate-200 block truncate max-w-[120px]">
              {user?.name ? user.name : 'Leo Sterling'}
            </span>
            <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold leading-none block mt-0.5">
              {activeRole} Portal
            </span>
          </div>
          
          <button 
            onClick={logout}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer ml-1"
            title="Secure Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Sliding Accessibility Drawer Cockpit */}
      {isAccessDrawerOpen && (
        <>
          {/* Drawer Backdrop */}
          <div 
            onClick={() => setIsAccessDrawerOpen(false)}
            className="fixed inset-0 bg-[#03050c]/80 backdrop-blur-sm z-50 transition-opacity cursor-pointer"
          />

          {/* Drawer Sidebar */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0d1526] border-l border-indigo-500/15 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between font-sans text-left">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Accessibility className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-slate-100 text-base">Accessibility Cockpit</h3>
                    <span className="text-[10px] text-slate-400">Real-time visual diagnostic modifiers</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAccessDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Control Set List */}
              <div className="space-y-4.5">
                
                {/* 1. Dyslexia-Friendly Font (OpenDyslexic) */}
                <div className="flex items-start justify-between p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-indigo-500/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <label className="text-xs font-bold text-slate-200 block">Dyslexic Reading Font</label>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5 max-w-[200px]">
                        Swaps font families to OpenDyslexic with high-legibility weighted letters.
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('dyslexiaFont')}
                    className={`w-11 h-6.5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                      accessibility.dyslexiaFont ? 'bg-indigo-500' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      accessibility.dyslexiaFont ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. Reading Guide Ruler Overlay */}
                <div className="flex items-start justify-between p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-indigo-500/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Sliders className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <label className="text-xs font-bold text-slate-200 block">Reading Guide Line</label>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5 max-w-[200px]">
                        Renders a horizontal cyan tracking line following your cursor to assist tracking.
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('readingRuler')}
                    className={`w-11 h-6.5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                      accessibility.readingRuler ? 'bg-indigo-500' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      accessibility.readingRuler ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 3. Screen Voice Synthesizer Navigation */}
                <div className="flex items-start justify-between p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-indigo-500/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Volume2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <label className="text-xs font-bold text-slate-200 block">Voice Synthesizer Guide</label>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5 max-w-[200px]">
                        Toggles sound segmenting synthesized cues during test calibrations.
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('voiceNavigation')}
                    className={`w-11 h-6.5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                      accessibility.voiceNavigation ? 'bg-indigo-500' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      accessibility.voiceNavigation ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 4. High Contrast Mode (pure dark layout) */}
                <div className="flex items-start justify-between p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-indigo-500/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Eye className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <label className="text-xs font-bold text-slate-200 block">High Contrast Mode</label>
                      <span className="text-[10px] text-slate-500 leading-normal block mt-0.5 max-w-[200px]">
                        Forces high-contrast backgrounds and monochromatic tags for clear vision.
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleAccessibility('highContrast')}
                    className={`w-11 h-6.5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                      accessibility.highContrast ? 'bg-indigo-500' : 'bg-slate-800'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      accessibility.highContrast ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 5. Font Scaling Slider */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span>Text Size Scaling</span>
                    <span className="text-indigo-400">
                      {Math.round(accessibility.fontSizeScale * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">A</span>
                    <input 
                      type="range"
                      min="1.0"
                      max="1.4"
                      step="0.1"
                      value={accessibility.fontSizeScale}
                      onChange={(e) => setFontScale(parseFloat(e.target.value))}
                      className="flex-grow accent-indigo-500 bg-slate-900 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-300">A</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-tight">
                    Scale overall document grids for highly readable layout intervals.
                  </span>
                </div>

              </div>

            </div>

            {/* Bottom tips alert */}
            <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 flex items-start space-x-2.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[10px] text-slate-400 leading-normal">
                These options adjust visual styles automatically across all cognitive dashboards without shifting your session diagnostic scores.
              </p>
            </div>

          </div>
        </>
      )}

    </nav>
  );
};

export default Navbar;

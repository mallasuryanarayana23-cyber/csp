import React, { useState, useEffect } from 'react';
import Navbar from './components/layouts/Navbar';
import LandingPage from './components/layouts/LandingPage';
// Let's look at the paths we used:
// frontend/src/modules/student/StudentDashboard.tsx
// frontend/src/modules/teacher/TeacherPortal.tsx
// frontend/src/modules/parent/ParentPortal.tsx
// frontend/src/modules/admin/AdminPanel.tsx
// Yes! They are in src/modules/
import { StudentDashboard as StudentDash } from './modules/student/StudentDashboard';
import { TeacherPortal as TeacherPort } from './modules/teacher/TeacherPortal';
import { ParentPortal as ParentPort } from './modules/parent/ParentPortal';
import { AdminPanel as AdminPan } from './modules/admin/AdminPanel';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { useStore } from './store/useStore';
import { apiClient } from './services/api/client';
import { HelpCircle, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { user, activeRole, accessibility, addNotification } = useStore();
  const [showLanding, setShowLanding] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Gaze Reading Ruler Tracking
  const [rulerY, setRulerY] = useState(300);

  const handleMouseMove = (e: MouseEvent) => {
    if (accessibility.readingRuler) {
      setRulerY(e.clientY);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [accessibility.readingRuler]);

  // Dynamic chatbot assistant
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am NeuroBot. Ask me anything about dyslexia, attention tracking, or accommodations!' }
  ]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    try {
      const res = await apiClient.post('/api/chat', { message: userText });
      setChatHistory(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Sorry, I am unable to connect to the NeuroLearn backend right now.' }]);
    }
  };

  // Auth gate
  if (!user) {
    if (isRegistering) {
      return <RegisterPage onToggleLogin={() => setIsRegistering(false)} />;
    }
    return <LoginPage onToggleRegister={() => setIsRegistering(true)} />;
  }

  return (
    <div className={`min-h-screen text-slate-100 font-sans relative ${
      accessibility.dyslexiaFont ? 'dyslexia-font-enabled' : ''
    } ${
      accessibility.highContrast ? 'high-contrast-enabled' : ''
    }`}
    style={{ transform: `scale(${accessibility.fontSizeScale})`, transformOrigin: 'top center' }}
    >
      
      {/* 1. Global Reading ruler line guide overlay */}
      {accessibility.readingRuler && (
        <div 
          className="reading-ruler" 
          style={{ top: `${rulerY}px` }}
        />
      )}

      {/* 2. Top Navigation Bar */}
      {!showLanding && (
        <div className="print:hidden">
          <Navbar />
          <div className="bg-slate-900/40 border-b border-white/5 py-2 px-6 flex items-center justify-between text-xs text-slate-400 font-light select-none">
            <span>🛡 Secure, Sandboxed Client Gaze & Voice Screening Active</span>
            <button 
              onClick={() => setShowLanding(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              ← Back to Main Page
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Route Dashboard Panels */}
      {showLanding ? (
        <LandingPage onEnterDashboard={() => setShowLanding(false)} />
      ) : (
        <main className="py-6 min-h-[calc(100vh-140px)]">
          {activeRole === 'STUDENT' && <StudentDash />}
          {activeRole === 'TEACHER' && <TeacherPort />}
          {activeRole === 'PARENT' && <ParentPort />}
          {activeRole === 'ADMIN' && <AdminPan />}
        </main>
      )}

      {/* 4. Dynamic Interactive Chatbot Assistant Drawer */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 border border-indigo-400/30 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform duration-300 cursor-pointer relative group"
            title="Ask NeuroBot AI assistant"
          >
            {/* Glowing online aura indicator */}
            <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-[#050816] rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-[#050816] rounded-full" />
            <BrainCircuit className="w-6.5 h-6.5 text-white group-hover:rotate-6 transition-transform" />
          </button>
        ) : (
          <div className="w-85 rounded-2xl bg-[#0d1526]/95 border border-indigo-500/15 shadow-2xl p-4.5 flex flex-col text-left backdrop-blur-xl relative space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="font-display font-extrabold text-xs tracking-wider uppercase text-slate-200 block">NeuroBot Companion</span>
                  <span className="text-[9px] text-slate-500 block">Claude 3.5 Assistant • Online</span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Chat History Panel */}
            <div 
              className="h-56 overflow-y-auto space-y-3.5 pr-1 text-[11px] leading-normal font-light scrollbar-none"
              ref={(el) => {
                if (el) el.scrollTop = el.scrollHeight;
              }}
            >
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {chat.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mt-0.5 shrink-0">
                      <BrainCircuit className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div 
                    className={`p-3 rounded-2xl border text-xs leading-relaxed max-w-[78%] ${
                      chat.sender === 'user' 
                        ? 'bg-gradient-to-r from-indigo-600/15 to-purple-600/15 border-indigo-500/25 text-slate-100 rounded-tr-none' 
                        : 'bg-slate-950/80 border-slate-900 text-slate-200 rounded-tl-none font-light'
                    }`}
                  >
                    {chat.text}
                  </div>
                </div>
              ))}

              {/* Bouncing Typing Indicator Loader */}
              {chatHistory[chatHistory.length - 1]?.sender === 'user' && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mt-0.5 shrink-0 animate-pulse">
                    <BrainCircuit className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-900 rounded-tl-none flex items-center space-x-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested quick reply chips */}
            <div className="space-y-1.5 pt-1 border-t border-indigo-500/5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Suggested Queries</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'What is Dyslexia?',
                  'Explain Gaze screening',
                  'How are results calculated?'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setChatInput(chip);
                      // Trigger submit
                      setTimeout(() => {
                        const fakeEvent = { preventDefault: () => {} } as any;
                        handleSendChat(fakeEvent, chip);
                      }, 100);
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/20 text-[9px] font-semibold text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={(e) => handleSendChat(e)} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about Dyslexia, focus span..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 outline-none transition-colors placeholder-slate-700"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-98"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};
export default App;

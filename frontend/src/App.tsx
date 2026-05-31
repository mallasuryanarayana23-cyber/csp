import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/layouts/Navbar';
import LandingPage from './components/layouts/LandingPage';
import { StudentDashboard as StudentDash } from './modules/student/StudentDashboard';
import { TeacherPortal as TeacherPort } from './modules/teacher/TeacherPortal';
import { ParentPortal as ParentPort } from './modules/parent/ParentPortal';
import { AdminPanel as AdminPan } from './modules/admin/AdminPanel';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { useStore } from './store/useStore';
import { apiClient } from './services/api/client';
import { Brain, X, Send, Sparkles, ChevronDown } from 'lucide-react';

export const App: React.FC = () => {
  const { user, activeRole, accessibility, connectWebSocket } = useStore();
  const [showLanding, setShowLanding] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [rulerY, setRulerY] = useState(300);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (accessibility.readingRuler) setRulerY(e.clientY); };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [accessibility.readingRuler]);

  useEffect(() => {
    if (localStorage.getItem('neurolearn_token')) connectWebSocket();
  }, [connectWebSocket]);

  // ── Chatbot ───────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; ts: number }>>([
    { sender: 'bot', text: 'Hi! I\'m NeuroBot — your AI learning assistant. Ask me about dyslexia, attention tracking, or how NeuroLearn works!', ts: Date.now() }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatOpen]);

  const handleSendChat = async (text?: string) => {
    const msg = text || chatInput;
    if (!msg.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', text: msg, ts: Date.now() }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await apiClient.post('/api/chat', { message: msg });
      setChatHistory(prev => [...prev, { sender: 'bot', text: res.data.reply, ts: Date.now() }]);
    } catch {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Sorry, I can\'t reach the backend right now. Try again later!', ts: Date.now() }]);
    } finally { setChatLoading(false); }
  };

  // Auth gate
  if (!user) {
    if (isRegistering) return <RegisterPage onToggleLogin={() => setIsRegistering(false)} />;
    return <LoginPage onToggleRegister={() => setIsRegistering(true)} />;
  }

  return (
    <div className={`min-h-screen bg-cosmos-900 text-slate-100 font-sans relative ${
      accessibility.dyslexiaFont ? 'dyslexia-font-enabled' : ''
    } ${accessibility.highContrast ? 'high-contrast-enabled' : ''}`}
      style={{ transform: `scale(${accessibility.fontSizeScale})`, transformOrigin: 'top center' }}
    >

      {/* Reading ruler */}
      {accessibility.readingRuler && (
        <div className="reading-ruler" style={{ top: `${rulerY}px` }} />
      )}

      {/* Navbar + back bar */}
      {!showLanding && (
        <div className="print:hidden">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure sandboxed cognitive screening active
            </div>
            <button
              onClick={() => setShowLanding(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LandingPage onEnterDashboard={() => setShowLanding(false)} />
          </motion.div>
        ) : (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-4"
          >
            {activeRole === 'STUDENT' && <StudentDash />}
            {activeRole === 'TEACHER' && <TeacherPort />}
            {activeRole === 'PARENT'  && <ParentPort />}
            {activeRole === 'ADMIN'   && <AdminPan />}
          </motion.main>
        )}
      </AnimatePresence>

      {/* ── Chatbot FAB ─────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <AnimatePresence>
          {!chatOpen && (
            <motion.button
              key="fab"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setChatOpen(true)}
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/25 hover:scale-105 transition-transform cursor-pointer border border-white/10"
            >
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-cosmos-900 animate-pulse" />
              <Brain className="w-6 h-6 text-white" />
            </motion.button>
          )}

          {chatOpen && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-80 rounded-2xl glass-panel-bright border border-cosmos-400 shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '480px' }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-cosmos-600 bg-gradient-to-r from-blue-500/5 to-violet-500/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">NeuroBot</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p className="text-[9px] text-slate-500">AI Assistant · Online</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-xl bg-cosmos-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {chatHistory.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Brain className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                    <div className={`px-3 py-2.5 rounded-2xl text-[11px] leading-relaxed max-w-[78%] ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 text-slate-100 rounded-tr-none'
                        : 'bg-cosmos-700/60 border border-cosmos-600 text-slate-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {chatLoading && (
                  <div className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    </div>
                    <div className="px-3 py-3 rounded-2xl bg-cosmos-700/60 border border-cosmos-600 rounded-tl-none flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Chips */}
              <div className="px-3 py-2 border-t border-cosmos-700 flex gap-1.5 overflow-x-auto">
                {['What is Dyslexia?', 'How does gaze tracking work?', 'Explain ADHD markers'].map(chip => (
                  <button key={chip} onClick={() => handleSendChat(chip)}
                    className="whitespace-nowrap text-[9px] px-2.5 py-1 rounded-lg bg-cosmos-700 border border-cosmos-500 text-slate-400 hover:text-slate-200 hover:border-blue-500/30 transition-all font-semibold flex-shrink-0">
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 pt-0">
                <form onSubmit={e => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
                  <input
                    type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about dyslexia, focus..."
                    className="flex-1 bg-cosmos-800 border border-cosmos-500 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
                  />
                  <button type="submit" disabled={!chatInput.trim() || chatLoading}
                    className="w-9 h-9 rounded-xl premium-btn-primary flex items-center justify-center disabled:opacity-50 flex-shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default App;

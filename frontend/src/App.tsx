import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
// Let's look at the paths we used:
// frontend/src/dashboard/StudentDashboard.tsx
// frontend/src/dashboard/TeacherPortal.tsx
// frontend/src/dashboard/ParentPortal.tsx
// frontend/src/dashboard/AdminPanel.tsx
// Yes! They are in src/dashboard/
import { StudentDashboard as StudentDash } from './dashboard/StudentDashboard';
import { TeacherPortal as TeacherPort } from './dashboard/TeacherPortal';
import { ParentPortal as ParentPort } from './dashboard/ParentPortal';
import { AdminPanel as AdminPan } from './dashboard/AdminPanel';
import { useStore } from './store/useStore';
import { HelpCircle, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { user, activeRole, accessibility, addNotification } = useStore();
  const [showLanding, setShowLanding] = useState(true);

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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Generate responsive client-side AI answers
    setTimeout(() => {
      let botResponse = "I can assist you with your learning difficulty screening or custom study plans. Try running the voice or typing assessments to map your sensory profiles.";
      const query = userText.toLowerCase();
      if (query.includes('dyslexia')) {
        botResponse = "Dyslexia is mapped through letter substitutions (like b/d swap) and physical keystroke rhythm inconsistencies. Our platform generates custom formatted OpenDyslexic spaced text guides as accommodations.";
      } else if (query.includes('adhd') || query.includes('attention') || query.includes('focus')) {
        botResponse = "ADHD attention slip vectors are identified via webcam eye gaze tracking deviations. We recommend 2-minute visual calibration focus breaks and enabled horizontal reading guides.";
      } else if (query.includes('voice') || query.includes('speech')) {
        botResponse = "The voice module analyzes speech hesitation patterns, reading speed, and phonological fluency using consumer microphones.";
      }

      setChatHistory(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

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
          {activeRole === 'student' && <StudentDash />}
          {activeRole === 'teacher' && <TeacherPort />}
          {activeRole === 'parent' && <ParentPort />}
          {activeRole === 'admin' && <AdminPan />}
        </main>
      )}

      {/* 4. Dynamic Interactive Chatbot Assistant Drawer */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/30 text-white flex items-center justify-center shadow-primary-glow hover:scale-105 transition-transform duration-300 cursor-pointer"
            title="Ask NeuroBot AI assistant"
          >
            <HelpCircle className="w-7 h-7" />
          </button>
        ) : (
          <div className="w-80 rounded-2xl glass-panel-glow border border-white/20 shadow-2xl p-4 space-y-3.5 flex flex-col text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-xs tracking-wider uppercase text-slate-200 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>NeuroBot Assistant</span>
              </span>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-2 pr-1 text-[11px] leading-normal font-light">
              {chatHistory.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border ${
                    chat.sender === 'user' 
                      ? 'bg-indigo-600/10 border-indigo-500/25 ml-6 text-slate-200' 
                      : 'bg-slate-950/80 border-white/5 mr-6 text-slate-300'
                  }`}
                >
                  {chat.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about Dyslexia, focus span..." 
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
              />
              <button 
                type="submit"
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
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

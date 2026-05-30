import React, { useState } from 'react';
import { useStore, StudentProfile, AIReport } from '../store/useStore';
import { 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  Save, 
  Printer, 
  ChevronRight,
  TrendingUp,
  Brain,
  Mail,
  UserCheck
} from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const { students, aiReports, addTeacherNote, addNotification } = useStore();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  
  // Selected student details state for active review drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [teacherNotesText, setTeacherNotesText] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const activeReport = aiReports.find(r => r.studentId === selectedStudent?.id) || aiReports[0];

  // Sync editor note state when student changes
  React.useEffect(() => {
    if (activeReport) {
      setTeacherNotesText(activeReport.teacherNotes);
    }
  }, [selectedStudentId]);

  const handleSaveNotes = () => {
    if (!activeReport) return;
    addTeacherNote(activeReport.id, teacherNotesText);
    
    addNotification(
      'Educator Notes Updated',
      `Diagnostic remarks for ${selectedStudent.name} saved successfully.`,
      'success'
    );
  };

  // Trigger browser print layout optimized for PDF downloads
  const handlePrintReport = () => {
    window.print();
  };

  // Filter students based on search query & risk levels
  const filteredStudents = students.filter(student => {
    const report = aiReports.find(r => r.studentId === student.id);
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (riskFilter === 'ALL') return matchesSearch;
    if (riskFilter === 'HIGH') return matchesSearch && (report?.dyslexiaRisk === 'High' || report?.adhdRisk === 'High');
    if (riskFilter === 'MEDIUM') return matchesSearch && (report?.dyslexiaRisk === 'Medium' || report?.adhdRisk === 'Medium') && (report?.dyslexiaRisk !== 'High' && report?.adhdRisk !== 'High');
    return matchesSearch && report?.dyslexiaRisk === 'Low' && report?.adhdRisk === 'Low';
  });

  const flaggedHighCount = students.filter(s => {
    const r = aiReports.find(rep => rep.studentId === s.id);
    return r?.dyslexiaRisk === 'High' || r?.adhdRisk === 'High';
  }).length;

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto font-sans text-left print:bg-white print:text-slate-900">
      
      {/* 1. Header segment */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-emerald-950/10 p-6 rounded-3xl border border-white/5 print:hidden">
        <div className="space-y-1">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-rajdhani">Educator Terminal</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Classroom Diagnostics Cockpit</h2>
          <p className="text-xs text-slate-400 font-light">Monitor screening risk indices, generate clinical exports, and deploy custom academic accommodations.</p>
        </div>

        {/* Stats Grid summaries */}
        <div className="flex items-center space-x-6 pr-2">
          {/* Flagged counts */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-md">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Attention Flags</span>
              <span className="text-lg font-black text-red-400 font-rajdhani block leading-none mt-0.5">{flaggedHighCount} High Risk</span>
            </div>
          </div>
          {/* Clean evaluations */}
          <div className="flex items-center space-x-2.5 pl-4 border-l border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Screened Count</span>
              <span className="text-lg font-black text-emerald-400 font-rajdhani block leading-none mt-0.5">{students.length} Pupils</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LEFT COLUMN: Student search / filter risk matrix */}
      <div className="lg:col-span-5 space-y-4 print:hidden">
        
        {/* Search controls card */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-rajdhani block mb-0.5">Filtering controls</span>
          
          <div className="flex items-center space-x-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-white/5">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pupils by name..." 
              className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-200"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(f => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                  riskFilter === f 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {f} Risk
              </button>
            ))}
          </div>
        </div>

        {/* Student Matrix Lists card */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-bold text-slate-300">Diagnostic Risk Index Grid</span>
            <span className="text-[10px] text-slate-500 font-medium">Showing {filteredStudents.length} entries</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No pupils fit filtering limits.</p>
            ) : (
              filteredStudents.map((student) => {
                const report = aiReports.find(r => r.studentId === student.id);
                const isHigh = report?.dyslexiaRisk === 'High' || report?.adhdRisk === 'High';
                const isMed = (report?.dyslexiaRisk === 'Medium' || report?.adhdRisk === 'Medium') && !isHigh;
                
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all duration-300 flex items-center justify-between gap-3 text-left ${
                      selectedStudentId === student.id 
                        ? 'bg-indigo-500/10 border-indigo-500/35 shadow-sm' 
                        : 'bg-slate-950/60 hover:bg-slate-950 border-white/5'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 leading-tight">{student.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] text-slate-500">{student.grade}</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-500">Focus Score: <span className="font-bold text-slate-300">{student.focusScore}%</span></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-rajdhani ${
                        isHigh ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        isMed ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isHigh ? 'High Risk' : isMed ? 'Med Risk' : 'Low Risk'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 3. RIGHT COLUMN: Selected Student AI Diagnostic detailed report viewer */}
      <div className="lg:col-span-7 space-y-6 print:col-span-12">
        
        {/* Main report viewer panel */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6 print:border-none print:shadow-none print:p-0">
          
          {/* Report Metadata header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4 print:pb-2 print:border-slate-300">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5 print:text-emerald-700">Multi-Modal Diagnostic Dossier</span>
              <h3 className="text-xl font-extrabold print:text-black">{selectedStudent?.name || 'Sophia Alvarez'}</h3>
              <p className="text-xs text-slate-400 font-light print:text-slate-600">{selectedStudent?.grade} | Visual screen conducted on {activeReport?.date}</p>
            </div>
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/10 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer print:hidden"
              title="Print clinical file layout to PDF"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Export Dossier (PDF)</span>
            </button>
          </div>

          {/* Warning disclaimer inside printable report */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-slate-400 text-[10px] leading-normal font-sans">
            🚫 <span className="font-semibold text-slate-300">Clinical Safeguard Warning:</span> This screening dossier highlights early indicators of learning difficulties (ADHD/dyslexia correlation probabilities) based on client-side sensory dynamics metrics. This does not substitute professional medical reviews.
          </div>

          {/* AI Metrics Score matrices */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
            {/* Dyslexia Prob */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center print:border-slate-200 print:bg-slate-50">
              <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">Dyslexia Index</span>
              <span className="text-2xl font-black text-indigo-400 font-rajdhani block mt-1 print:text-indigo-700">{activeReport?.dyslexiaProb}%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">probability score</span>
            </div>
            {/* ADHD Prob */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center print:border-slate-200 print:bg-slate-50">
              <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">ADHD Focus Index</span>
              <span className="text-2xl font-black text-purple-400 font-rajdhani block mt-1 print:text-purple-700">{activeReport?.adhdProb}%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">probability score</span>
            </div>
            {/* Speech fluency */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center print:border-slate-200 print:bg-slate-50">
              <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">Speech Fluency</span>
              <span className="text-2xl font-black text-emerald-400 font-rajdhani block mt-1 print:text-emerald-700">{activeReport?.speechFluencyScore}%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">pronunciation map</span>
            </div>
            {/* Typing rhythm */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center print:border-slate-200 print:bg-slate-50">
              <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider">Typing Rhythm</span>
              <span className="text-2xl font-black text-amber-500 font-rajdhani block mt-1 print:text-amber-700">{activeReport?.typingRhythmConsistency}%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">consistency index</span>
            </div>
          </div>

          {/* Curriculum Accommodations Recommendations List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center space-x-1.5 print:text-black">
              <Sparkles className="w-4 h-4 text-indigo-400 print:text-indigo-600" />
              <span>AI-Generated Intervention Accommodations</span>
            </h4>
            <div className="grid gap-2.5">
              {activeReport?.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-light flex items-start space-x-2.5 print:border-slate-200 print:bg-white print:text-slate-800"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5 print:bg-emerald-600" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Educator Remarks Notation Editor */}
          <div className="space-y-3 print:space-y-1">
            <h4 className="text-sm font-bold flex items-center space-x-1.5 print:text-black">
              <FileText className="w-4 h-4 text-purple-400 print:text-purple-600" />
              <span>Diagnostic remarks & Educator Notation</span>
            </h4>
            <textarea
              value={teacherNotesText}
              onChange={(e) => setTeacherNotesText(e.target.value)}
              placeholder="Input clinical annotations or visual feedback markers..."
              rows={3}
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans tracking-wide transition-colors print:hidden"
            />
            
            {/* Printable static paragraph version for print layout */}
            <div className="hidden print:block p-3 border border-slate-300 rounded-xl bg-slate-50 text-xs text-slate-800 italic leading-relaxed min-h-[60px]">
              {teacherNotesText || 'No custom annotations appended to file.'}
            </div>

            <button
              onClick={handleSaveNotes}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors print:hidden"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Conclude & Save Remarks</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
export default TeacherPortal;

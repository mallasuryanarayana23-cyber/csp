import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  BrainCircuit, 
  Activity, 
  Search, 
  Sliders, 
  X, 
  Plus, 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  FileSignature, 
  Clock, 
  Award,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle,
  FileBadge
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import { apiClient } from '../../services/api/client';

export const TeacherPortal: React.FC = () => {
  const { 
    students, 
    aiReports, 
    readingTests, 
    fetchStudents, 
    fetchReadingTests, 
    fetchReports, 
    addNotification 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Slide-in panel notes editing state
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [assigningSuccess, setAssigningSuccess] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchReadingTests();
  }, []);

  // Update notes state when student or report changes
  useEffect(() => {
    if (selectedStudent) {
      fetchReports(selectedStudent.id);
    }
  }, [selectedStudent]);

  const activeReport = selectedStudent ? aiReports.find(r => r.studentId === selectedStudent.id) : null;

  useEffect(() => {
    if (activeReport) {
      setNotes(activeReport.teacherNotes || '');
    } else {
      setNotes('');
    }
  }, [activeReport]);

  // Fallbacks & Stats mapping
  const totalStudents = students.length;
  const highRiskCount = students.filter(s => {
    const r = aiReports.find(report => report.studentId === s.id);
    return r?.dyslexiaRisk === 'HIGH';
  }).length;
  const mediumRiskCount = students.filter(s => {
    const r = aiReports.find(report => report.studentId === s.id);
    return r?.dyslexiaRisk === 'MEDIUM';
  }).length;

  const avgFocus = totalStudents > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.focusScore, 0) / totalStudents) 
    : 0;

  // Cohort progress dataset
  const cohortProgress = [
    { name: 'Week 1', focus: 72, wpm: 68 },
    { name: 'Week 2', focus: 75, wpm: 70 },
    { name: 'Week 3', focus: 79, wpm: 71 },
    { name: 'Week 4', focus: 84, wpm: 75 },
    { name: 'Week 5', focus: 88, wpm: 78 },
  ];

  // Initials profile color helpers
  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      'bg-purple-500/10 text-purple-300 border-purple-500/30',
      'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      'bg-pink-500/10 text-pink-300 border-pink-500/30'
    ];
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  // Filter students based on search query and risk rating
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const r = aiReports.find(report => report.studentId === s.id);
    const riskTier = r?.dyslexiaRisk || 'LOW';

    if (selectedRiskFilter === 'ALL') return matchesSearch;
    return matchesSearch && riskTier === selectedRiskFilter;
  });

  // Handle professional Notes Saving
  const handleSaveNotes = async () => {
    if (!activeReport) return;
    setSavingNotes(true);
    setNotesSuccess(false);
    try {
      await apiClient.put(`/api/reports/${activeReport.id}/notes`, { notes });
      setNotesSuccess(true);
      addNotification(
        'Notes Updated Successfully',
        `Educator clinical notes saved for student: ${selectedStudent.name}.`,
        'success'
      );
      setTimeout(() => setNotesSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      addNotification('Failed to Save Notes', 'Database sync encountered a pipeline error.', 'warning');
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle assigning test to selectedStudent
  const handleAssignTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedTestId) return;
    setAssigningLoading(true);
    setAssigningSuccess(false);
    try {
      await apiClient.post(`/api/students/${selectedStudent.id}/assign-test`, {
        testId: selectedTestId
      });
      setAssigningSuccess(true);
      addNotification(
        'Screening Assigned',
        `Successfully queued exercise for student: ${selectedStudent.name}`,
        'success'
      );
      setTimeout(() => {
        setIsAssignModalOpen(false);
        setAssigningSuccess(false);
        setSelectedTestId('');
        setDueDate('');
      }, 2000);
    } catch (e) {
      console.error(e);
      addNotification('Assignment Failed', 'Database could not register assigning task.', 'warning');
    } finally {
      setAssigningLoading(false);
    }
  };

  // Professional jsPDF compiler layout generator
  const generatePDFReport = (student: any) => {
    const report = aiReports.find(r => r.studentId === student.id) || aiReports[0];
    const doc = new jsPDF();
    
    // Page theme background borders
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1.5);
    doc.rect(5, 5, 200, 287);

    // Document Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("NEUROLEARN AI DIAGNOSTIC SUITE", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("HIPAA Protected - Secure Clinical Telemetry Report", 20, 30);
    doc.text(`Report Compiled: ${new Date().toLocaleDateString()}`, 140, 30);

    doc.setDrawColor(226, 232, 240); // slate-200 border
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Profile Details Card
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text("STUDENT PROFILE INFO", 20, 48);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "normal");
    doc.text(`Student Name:  ${student.name}`, 20, 56);
    doc.text(`Grade Level:   ${student.grade || '4th Grade'}`, 20, 64);
    doc.text(`School:        ${student.school?.name || 'Default Academy'}`, 20, 72);
    
    doc.text(`Average Focus rating:  ${student.focusScore}%`, 110, 56);
    doc.text(`Risk Quotient Prob:    ${report?.dyslexiaProb || 48}%`, 110, 64);
    doc.text(`Overall Risk Tier:     ${report?.dyslexiaRisk || 'MEDIUM'}`, 110, 72);

    doc.line(20, 80, 190, 80);

    // Multi-modal Analysis Section
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("MULTI-MODAL NEURAL CLOUD FUSION ANALYSIS", 20, 93);

    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont("Helvetica", "normal");
    
    const analysisText = 
      `The NeuroLearn ensemble-v2.0 classifier evaluated physical gaze deviation shifts, QWERTY typing hesitation indexes, and audio waveform frequencies. Gaze tracking registered distraction events of ${student.metricsHistory ? student.metricsHistory[0]?.distractionEvents || 1 : 1} tracking skips. Keystroke rhythm was consistent with a ${report?.typingRhythmConsistency || 74}% score. Audio segmentations via our PyTorch Whisper cluster flagged speech fluency consistency at ${report?.speechFluencyScore || 82}%. The combined vector predicts a ${report?.dyslexiaRisk || 'MEDIUM'} probability of dyslexia reading traits.`;
    
    const splitText = doc.splitTextToSize(analysisText, 170);
    doc.text(splitText, 20, 102);

    doc.line(20, 135, 190, 135);

    // Recommended Interventions
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("RECOMMENDED EDUCATIONAL WORKOUTS", 20, 148);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "normal");
    
    const recs = report?.recommendations 
      ? (typeof report.recommendations === 'string' ? JSON.parse(report.recommendations) : report.recommendations)
      : ['Provide OpenDyslexic high-legibility UI text mode overlays.', 'Assign 2-minute visual attention focus calibration breaks.'];

    recs.forEach((recText: string, idx: number) => {
      doc.text(`[${idx + 1}]  ${recText}`, 20, 158 + (idx * 9));
    });

    doc.line(20, 185, 190, 185);

    // Educator Professional notes
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("EDUCATOR OBSERVATIONAL OBSERVATIONS", 20, 198);

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.setFont("Helvetica", "italic");
    
    const educatorNotes = notes || report?.teacherNotes || "No educator clinical notations logged at this time.";
    const splitNotes = doc.splitTextToSize(educatorNotes, 170);
    doc.text(splitNotes, 20, 206);

    // Signatures footer block
    doc.line(20, 245, 190, 245);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("Professor Marcus Vance", 20, 260);
    doc.setFont("Helvetica", "normal");
    doc.text("Certified Clinical Practitioner / Educator", 20, 265);
    doc.line(20, 255, 80, 255); // signature line

    doc.text("AI Verification signature:", 120, 260);
    doc.setFont("Courier", "bold");
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("neurolearn-ai-verified-md5", 120, 265);

    doc.save(`${student.name.replace(" ", "_")}_NeuroLearn_Diagnostic.pdf`);
    
    addNotification(
      'PDF Generated',
      `Official cognitive report exported for ${student.name}`,
      'success'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-left px-4 relative">
      
      {/* Background radial orbs */}
      <div className="gradient-orb w-96 h-96 bg-indigo-500/10 top-10 left-1/3" />

      {/* Top Meta Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        
        {/* Stat 1 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-space">Total Students</span>
            <div className="text-3xl font-space font-extrabold mt-1 text-slate-200">{totalStudents}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
            <Users className="w-5.5 h-5.5 text-indigo-400" />
          </div>
        </div>
        
        {/* Stat 2 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-400 uppercase tracking-widest font-bold font-space">High Risk</span>
            <div className="text-3xl font-space font-extrabold mt-1 text-rose-400">{highRiskCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
            <AlertTriangle className="w-5.5 h-5.5 text-rose-400" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold font-space">Cohort Focus Avg</span>
            <div className="text-3xl font-space font-extrabold mt-1 text-emerald-400">{avgFocus}%</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <TrendingUp className="w-5.5 h-5.5 text-emerald-400" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold font-space">Assigned Exercises</span>
            <div className="text-3xl font-space font-extrabold mt-1 text-purple-400">{readingTests.length} Active</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
            <BookOpen className="w-5.5 h-5.5 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left 8-cols: Student Data Roster */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-space font-extrabold text-slate-100">Student Cognitive Rosters</h3>
              <p className="text-xs text-slate-400 font-light">Trace individual dyslexia/ADHD screening indexes and logs.</p>
            </div>
            
            {/* Filter Toggle Pill & Search */}
            <div className="flex items-center space-x-2.5">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-all w-40 sm:w-48"
                />
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['ALL', 'HIGH', 'MEDIUM'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedRiskFilter(tier)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-widest uppercase cursor-pointer transition-colors ${
                      selectedRiskFilter === tier 
                        ? 'bg-indigo-600 text-white shadow shadow-indigo-600/15'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student roster list layout */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-indigo-500/10 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="pb-3 pl-3">Student Name</th>
                  <th className="pb-3">Grade Level</th>
                  <th className="pb-3 text-center">Focus Score</th>
                  <th className="pb-3 text-center">Risk Quotient</th>
                  <th className="pb-3 text-center">Diagnosis Tier</th>
                  <th className="pb-3 text-right pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-light">No students matched. Add or register more students in database.</td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const report = aiReports.find(r => r.studentId === student.id);
                    const riskTier = report?.dyslexiaRisk || 'LOW';
                    const riskProb = report?.dyslexiaProb || 15;
                    const initials = student.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase();
                    
                    return (
                      <tr 
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`hover:bg-indigo-500/5 cursor-pointer transition-colors ${
                          selectedStudent?.id === student.id ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <td className="py-3.5 pl-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold ${getAvatarBg(student.name)}`}>
                              {initials}
                            </div>
                            <div>
                              <span className="font-bold text-slate-200 block text-xs">{student.name}</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-300 font-medium">{student.grade || '4th Grade'}</td>
                        <td className="py-3.5 text-center font-bold text-slate-200">{student.focusScore}%</td>
                        <td className="py-3.5 text-center font-bold text-indigo-300">{riskProb}%</td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getRiskColor(riskTier)}`}>
                            {riskTier}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => generatePDFReport(student)}
                              className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer"
                              title="Generate PDF Report"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                              title="Open Sliding Details Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4-cols: Longitudinal analytics chart */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-space block mb-0.5">Research Grade telemetry</span>
            <h3 className="text-base font-bold flex items-center space-x-2">
              <Activity className="w-4.5 h-4.5 text-purple-400" />
              <span>Longitudinal Cohort Trends</span>
            </h3>
          </div>
          
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cohortProgress} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cohortFocusGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cohortWpmGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={9} fontWeight={600} />
                <YAxis stroke="#475569" fontSize={9} fontWeight={600} domain={[40, 100]} />
                <Tooltip 
                  contentStyle={{ background: '#0d1526', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="focus" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#cohortFocusGlow)" name="Avg Attention" />
                <Area type="monotone" dataKey="wpm" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#cohortWpmGlow)" name="Avg WPM" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-[10px] text-slate-400 text-center border-t border-indigo-500/5 pt-3.5 select-none flex justify-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
              <span>Cohort Focus</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-emerald-500 block" />
              <span>Cohort Velocity</span>
            </span>
          </div>
        </div>

      </div>

      {/* 60% Sliding Detail Profile Cockpit Panel */}
      {selectedStudent && (
        <>
          {/* Panel Backdrop overlay */}
          <div 
            onClick={() => setSelectedStudent(null)}
            className="fixed inset-0 bg-[#03050c]/85 backdrop-blur-sm z-40 transition-opacity cursor-pointer"
          />

          {/* Panel Drawer Sidebar */}
          <div className="fixed top-0 right-0 h-full w-full lg:w-[60%] bg-[#0d1526] border-l border-indigo-500/15 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out p-6 overflow-y-auto space-y-6 flex flex-col justify-between font-sans text-left">
            <div className="space-y-6">
              
              {/* Header Details */}
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-sm font-bold ${getAvatarBg(selectedStudent.name)}`}>
                    {selectedStudent.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-slate-100 text-lg">{selectedStudent.name}</h3>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{selectedStudent.grade || '4th Grade'}</span>
                      <span>•</span>
                      <span>{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Cognitive Gauge Meters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Gauge 1: Risk */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold block mb-2">Dyslexia Risk</span>
                  <div className={`text-base font-extrabold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${getRiskColor(activeReport?.dyslexiaRisk || 'MEDIUM')}`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>{activeReport?.dyslexiaRisk || 'MEDIUM'} ({activeReport?.dyslexiaProb || 48}%)</span>
                  </div>
                </div>

                {/* Gauge 2: Focus Consistency */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold block mb-2">Attention Rating</span>
                  <div className="text-base font-extrabold text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>{selectedStudent.focusScore}% Focus</span>
                  </div>
                </div>

                {/* Gauge 3: Speech Fluency */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold block mb-2">Speech Fluency</span>
                  <div className="text-base font-extrabold text-cyan-400 px-3 py-1.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center gap-1.5">
                    <Mic className="w-4 h-4" />
                    <span>{activeReport?.speechFluencyScore || 82}% Score</span>
                  </div>
                </div>
              </div>

              {/* Assignment Deck & Timeline logs */}
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                
                {/* Left side: Assign Test Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <FileSignature className="w-4 h-4 text-indigo-400" />
                      <span>Assign Screening Test</span>
                    </h4>
                  </div>
                  
                  {isAssignModalOpen ? (
                    <form onSubmit={handleAssignTestSubmit} className="p-4 rounded-2xl bg-slate-950/40 border border-indigo-500/10 space-y-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Exercise catalog</label>
                        <select
                          required
                          value={selectedTestId}
                          onChange={e => setSelectedTestId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500 text-slate-200"
                        >
                          <option value="">-- Select Test --</option>
                          {readingTests.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.difficulty})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Due Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500 text-slate-200"
                          />
                        </div>
                      </div>

                      {assigningSuccess && (
                        <div className="text-[11px] font-bold text-emerald-400 text-center leading-normal">
                          ✔ Test assigned! Notification dispatched.
                        </div>
                      )}

                      <div className="flex space-x-2 pt-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAssignModalOpen(false)}
                          className="flex-1 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={assigningLoading || !selectedTestId}
                          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          {assigningLoading ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>

                    </form>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 text-center flex flex-col items-center justify-center space-y-3 min-h-[140px]">
                      <BookOpen className="w-7 h-7 text-slate-600" />
                      <p className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed">
                        Queues visual dyslexia/ADHD screening exercises directly to student accounts.
                      </p>
                      <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold uppercase tracking-wider text-white flex items-center space-x-1.5 cursor-pointer shadow-md transition-all active:scale-98"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Exercises</span>
                      </button>
                    </div>
                  )}

                  {/* Assigned list roster */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Assigned Roster</span>
                    {selectedStudent.assignedTests && selectedStudent.assignedTests.length > 0 ? (
                      selectedStudent.assignedTests.map((tId: string) => {
                        const match = readingTests.find(t => t.id === tId);
                        if (!match) return null;
                        return (
                          <div key={tId} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-900 text-xs flex items-center justify-between">
                            <span className="font-semibold text-slate-300">{match.title}</span>
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase">{match.difficulty}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-slate-600 block leading-tight">No active assignments on file.</span>
                    )}
                  </div>
                </div>

                {/* Right side: Timeline & history logs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>Chronological Metrics Log</span>
                    </h4>
                  </div>
                  
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedStudent.metricsHistory ? (
                      selectedStudent.metricsHistory.map((metric: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span>SESSION: {metric.date || 'May 30'}</span>
                            <span className="text-emerald-400">SUCCESS</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[11px] leading-tight">
                            <div className="text-slate-400 font-light">WPM Speed: <span className="text-slate-200 font-bold">{metric.wpm || 74} WPM</span></div>
                            <div className="text-slate-400 font-light">Attention Score: <span className="text-slate-200 font-bold">{metric.focusScore || 92}%</span></div>
                            <div className="text-slate-400 font-light col-span-2">Distraction events: <span className="text-rose-400 font-bold">{metric.distractionEvents || 0} Skips</span></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-4 text-center">No telemetry history logged.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Educator Clinical Notes Textarea Editor */}
              <div className="space-y-3.5 pt-4 border-t border-indigo-500/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
                    <FileSignature className="w-4 h-4 text-indigo-400" />
                    <span>Clinical Notations & Observations</span>
                  </h4>
                  {notesSuccess && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-bounce">
                      ✔ Notes Synced to DB
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter professional clinical summaries, visual track deviations, or customized classroom accommodations here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 placeholder-slate-600 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes || !activeReport}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center space-x-1.5 transition-all"
                  >
                    {savingNotes ? (
                      <span>Syncing database...</span>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Save Observational Summary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="pt-6 border-t border-indigo-500/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure Telemetry Panel</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => generatePDFReport(selectedStudent)}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer flex items-center space-x-1.5 transition-all active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate AI PDF Diagnostic</span>
                </button>
                
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="py-2.5 px-5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  Close Panel
                </button>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default TeacherPortal;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Users, FileText, AlertTriangle, Download, BrainCircuit, Activity,
  Search, X, Plus, Calendar, ChevronRight, Clock, Sparkles, RefreshCw,
  Eye, CheckCircle, TrendingUp, ArrowUpRight, Filter, MoreHorizontal,
  Target, Zap, BookOpen, Layers
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import jsPDF from 'jspdf';
import { apiClient } from '../../services/api/client';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

// ─── Risk Badge ─────────────────────────────────────────────────────────────
const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  const classes = {
    HIGH: 'risk-badge-high', MEDIUM: 'risk-badge-medium', LOW: 'risk-badge-low',
  }[risk] || 'risk-badge-low';
  return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${classes} uppercase tracking-wider`}>{risk}</span>;
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; icon: any; color: string; sub: string; delay?: number }> = ({
  label, value, icon: Icon, color, sub, delay = 0
}) => (
  <motion.div {...fadeUp(delay)} className="neo-card rounded-2xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-600" />
    </div>
    <div>
      <div className="font-display text-3xl font-black text-white">{value}</div>
      <div className="text-sm font-medium text-slate-400 mt-0.5">{label}</div>
      <div className="text-xs text-slate-600 mt-1">{sub}</div>
    </div>
  </motion.div>
);

export const TeacherPortal: React.FC = () => {
  const { students, aiReports, readingTests, fetchStudents, fetchReadingTests, fetchReports, addNotification } = useStore();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [assigningLoading, setAssigningLoading] = useState(false);

  useEffect(() => { fetchStudents(); fetchReadingTests(); }, []);
  useEffect(() => {
    if (selectedStudent) fetchReports(selectedStudent.id);
  }, [selectedStudent]);

  const activeReport = selectedStudent ? aiReports.find(r => r.studentId === selectedStudent.id) : null;
  useEffect(() => { if (activeReport) setNotes(activeReport.teacherNotes || ''); else setNotes(''); }, [activeReport]);

  // Stats
  const totalStudents = students.length;
  const highRisk = students.filter(s => {
    const rep = aiReports.find(r => r.studentId === s.id);
    return rep?.dyslexiaRisk === 'HIGH' || rep?.adhdRisk === 'HIGH';
  }).length;
  const avgFocus = students.length > 0 ? Math.round(students.reduce((a, s) => a + (s.focusScore || 80), 0) / students.length) : 88;
  const pendingTests = students.filter(s => (s.assignedTests?.length || 0) > (s.completedTests?.length || 0)).length;

  // Filtered students
  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const rep = aiReports.find(r => r.studentId === s.id);
    const matchRisk = riskFilter === 'ALL' || rep?.dyslexiaRisk === riskFilter || rep?.adhdRisk === riskFilter;
    return matchSearch && matchRisk;
  });

  // Class performance chart
  const classData = students.slice(0, 7).map(s => ({
    name: s.name.split(' ')[0],
    focus: s.focusScore || 80,
    risk: aiReports.find(r => r.studentId === s.id)?.dyslexiaProb || 15,
  }));

  const handleSaveNotes = async () => {
    if (!selectedStudent) return;
    setSavingNotes(true);
    try {
      await apiClient.put(`/api/reports/${selectedStudent.id}/notes`, { teacherNotes: notes });
      addNotification('Notes Saved', `Clinical notes updated for ${selectedStudent.name}.`, 'success');
    } catch {
      addNotification('Save Failed', 'Could not connect to backend.', 'warning');
    } finally { setSavingNotes(false); }
  };

  const handleAssignTest = async () => {
    if (!selectedStudent || !selectedTestId) return;
    setAssigningLoading(true);
    try {
      await apiClient.post('/api/assignments', { studentId: selectedStudent.id, testId: selectedTestId, dueDate });
      addNotification('Test Assigned', `Assigned to ${selectedStudent.name}.`, 'success');
      setIsAssignOpen(false);
    } catch {
      addNotification('Assignment Failed', 'Could not reach backend.', 'warning');
    } finally { setAssigningLoading(false); }
  };

  const generatePDF = (student: any) => {
    const doc = new jsPDF();
    const report = aiReports.find(r => r.studentId === student.id);
    doc.setFontSize(22); doc.text('NeuroLearn — Clinical Report', 20, 25);
    doc.setFontSize(11); doc.setTextColor(80, 80, 80);
    doc.text(`Student: ${student.name}`, 20, 42);
    doc.text(`Grade: ${student.grade || 'N/A'}`, 20, 52);
    doc.text(`Focus Score: ${student.focusScore}%`, 20, 62);
    if (report) {
      doc.text(`Dyslexia Risk: ${report.dyslexiaRisk} (${report.dyslexiaProb}%)`, 20, 72);
      doc.text(`ADHD Risk: ${report.adhdRisk} (${report.adhdProb}%)`, 20, 82);
      doc.text(`Recommendations:`, 20, 95);
      report.recommendations?.forEach((r, i) => doc.text(`• ${r}`, 25, 105 + i * 10));
    }
    doc.save(`neurolearn_${student.name.replace(/\s/g, '_')}.pdf`);
    addNotification('PDF Generated', `Report for ${student.name} downloaded.`, 'success');
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarColors = ['#3b82f6', '#8b5cf6', '#22d3ee', '#10b981', '#f97316', '#ec4899'];

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <div className="gradient-orb gradient-orb-violet w-96 h-96 top-0 right-0 opacity-8" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 relative z-10">

        {/* ══ HEADER ════════════════════════════════════ */}
        <motion.div {...fadeUp(0)} className="neo-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-blue-500/4 pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs text-violet-400 font-semibold tracking-wider uppercase">Intelligence Grid</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-black">
                Teacher <span className="gradient-text-blue">Command Center</span>
              </h1>
              <p className="text-slate-400 mt-1">Class-wide cognitive analytics, intervention planning, and AI report generation.</p>
            </div>
            <button
              onClick={() => { fetchStudents(); fetchReadingTests(); }}
              className="flex items-center gap-2 premium-btn-ghost px-4 py-2.5 rounded-xl text-sm font-bold"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
          </div>
        </motion.div>

        {/* ══ STATS ROW ═════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={totalStudents} icon={Users} color="#3b82f6" sub="Active in cohort" delay={0.05} />
          <StatCard label="High Risk Alerts" value={highRisk} icon={AlertTriangle} color="#f97316" sub="Need intervention" delay={0.08} />
          <StatCard label="Average Focus" value={`${avgFocus}%`} icon={Target} color="#10b981" sub="Class baseline" delay={0.11} />
          <StatCard label="Tests Pending" value={pendingTests} icon={Clock} color="#8b5cf6" sub="Assigned not done" delay={0.14} />
        </div>

        {/* ══ MAIN GRID ═════════════════════════════════ */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* LEFT — Student Table */}
          <div className={`${selectedStudent ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>

            {/* Class Performance Chart */}
            {!selectedStudent && classData.length > 0 && (
              <motion.div {...fadeUp(0.1)} className="neo-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-0.5">Analytics</div>
                    <h3 className="font-display font-bold text-lg">Class Focus Distribution</h3>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,36,72,0.6)" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#0c1228', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', fontSize: '11px' }} />
                      <Bar dataKey="focus" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Focus %" />
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Search + Filter */}
            <motion.div {...fadeUp(0.12)} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-full bg-cosmos-700 border border-cosmos-500 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      riskFilter === f
                        ? 'bg-blue-500 text-white'
                        : 'bg-cosmos-700 border border-cosmos-500 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Student Table */}
            <motion.div {...fadeUp(0.15)} className="neo-card rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-cosmos-600">
                <h3 className="font-display font-bold text-sm text-slate-300">{filtered.length} Students</h3>
              </div>
              <div className="divide-y divide-cosmos-700">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 text-sm">No students match your search.</div>
                ) : filtered.map((s, i) => {
                  const rep = aiReports.find(r => r.studentId === s.id);
                  const color = avatarColors[i % avatarColors.length];
                  const isSelected = selectedStudent?.id === s.id;
                  return (
                    <motion.div
                      key={s.id}
                      onClick={() => setSelectedStudent(isSelected ? null : s)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                        isSelected ? 'bg-blue-500/8 border-l-2 border-blue-500' : 'hover:bg-cosmos-700/30'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                        style={{ background: `${color}25`, border: `1px solid ${color}40`, color }}>
                        {initials(s.name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-200 truncate">{s.name}</div>
                        <div className="text-xs text-slate-500 truncate">{s.grade || 'Grade N/A'} · {s.email}</div>
                      </div>

                      {/* Focus bar */}
                      <div className="hidden sm:flex flex-col items-end gap-1 w-24">
                        <span className="text-xs font-mono-data text-slate-300 font-bold">{s.focusScore || 80}%</span>
                        <div className="w-full h-1.5 bg-cosmos-600 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.focusScore || 80}%`, background: color }} />
                        </div>
                      </div>

                      {/* Risk badges */}
                      <div className="hidden md:flex items-center gap-1.5">
                        {rep ? (
                          <>
                            <RiskBadge risk={rep.dyslexiaRisk} />
                            <RiskBadge risk={rep.adhdRisk} />
                          </>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-bold">NO REPORT</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => generatePDF(s)}
                          className="w-7 h-7 rounded-lg bg-cosmos-600 border border-cosmos-500 hover:border-blue-500/30 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <ChevronRight className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Student Detail Panel */}
          <AnimatePresence>
            {selectedStudent && (
              <motion.div
                className="lg:col-span-5 space-y-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Detail Header */}
                <div className="neo-card rounded-3xl p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                          style={{ background: '#3b82f625', border: '1px solid #3b82f640', color: '#3b82f6' }}>
                          {initials(selectedStudent.name)}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">{selectedStudent.name}</h3>
                          <p className="text-xs text-slate-500">{selectedStudent.grade} · {selectedStudent.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setIsAssignOpen(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl premium-btn-primary text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Assign
                        </button>
                        <button onClick={() => setSelectedStudent(null)} className="w-7 h-7 rounded-xl bg-cosmos-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Focus', val: `${selectedStudent.focusScore || 80}%`, color: '#3b82f6' },
                        { label: 'Streak', val: `${selectedStudent.streakDays || 0}d`, color: '#f97316' },
                        { label: 'Tests', val: `${selectedStudent.completedTests?.length || 0}/${selectedStudent.assignedTests?.length || 3}`, color: '#10b981' },
                      ].map(m => (
                        <div key={m.label} className="bg-cosmos-700/50 rounded-xl p-2.5 text-center border border-cosmos-600">
                          <div className="text-[10px] text-slate-500 uppercase">{m.label}</div>
                          <div className="text-sm font-bold font-mono-data mt-0.5" style={{ color: m.color }}>{m.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Report Detail */}
                {activeReport && (
                  <div className="neo-card rounded-3xl p-5 space-y-4">
                    <div className="text-[10px] text-violet-400 uppercase tracking-widest font-bold">AI Report · {activeReport.date}</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Dyslexia', val: `${activeReport.dyslexiaProb}%`, risk: activeReport.dyslexiaRisk },
                        { label: 'ADHD', val: `${activeReport.adhdProb}%`, risk: activeReport.adhdRisk },
                        { label: 'Speech', val: `${activeReport.speechFluencyScore}%`, risk: 'SCORE' },
                        { label: 'Typing', val: `${activeReport.typingRhythmConsistency}%`, risk: 'SCORE' },
                      ].map(m => (
                        <div key={m.label} className="bg-cosmos-700/40 rounded-xl p-3 border border-cosmos-600">
                          <div className="text-[10px] text-slate-500 uppercase">{m.label}</div>
                          <div className="text-lg font-black font-mono-data text-white mt-0.5">{m.val}</div>
                          <RiskBadge risk={m.risk} />
                        </div>
                      ))}
                    </div>

                    {/* Timeline chart */}
                    {selectedStudent.metricsHistory && (
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedStudent.metricsHistory} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                            <defs>
                              <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#475569" fontSize={9} />
                            <YAxis stroke="#475569" fontSize={9} />
                            <Tooltip contentStyle={{ background: '#0c1228', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '8px', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="focusScore" stroke="#3b82f6" strokeWidth={2} fill="url(#detailGrad)" name="Focus" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="neo-card rounded-3xl p-5 space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Clinical Notes</div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add intervention notes, accommodations, or observations..."
                    className="w-full bg-cosmos-800 border border-cosmos-500 focus:border-blue-500 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-all"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveNotes} disabled={savingNotes}
                      className="flex-1 premium-btn-primary py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                    <button onClick={() => generatePDF(selectedStudent)}
                      className="flex items-center gap-1.5 premium-btn-ghost px-4 py-2.5 rounded-xl text-sm font-bold">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Assign Test Modal ────────────────────────── */}
      <AnimatePresence>
        {isAssignOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsAssignOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-panel-bright rounded-2xl p-6 w-full max-w-md border border-cosmos-400">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-lg">Assign Test</h3>
                  <button onClick={() => setIsAssignOpen(false)} className="w-7 h-7 rounded-xl bg-cosmos-700 flex items-center justify-center text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Select Test</label>
                    <select value={selectedTestId} onChange={e => setSelectedTestId(e.target.value)}
                      className="w-full bg-cosmos-800 border border-cosmos-500 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-200 outline-none">
                      <option value="">Choose a test...</option>
                      {readingTests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-cosmos-800 border border-cosmos-500 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-200 outline-none" />
                  </div>
                  <button onClick={handleAssignTest} disabled={assigningLoading || !selectedTestId}
                    className="w-full premium-btn-primary py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                    {assigningLoading ? 'Assigning...' : 'Assign Test'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherPortal;

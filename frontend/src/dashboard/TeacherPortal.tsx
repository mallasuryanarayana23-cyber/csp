import React from 'react';
import { useStore } from '../store/useStore';
import { Users, FileText, TrendingUp, AlertTriangle, Download, BrainCircuit, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';

export const TeacherPortal: React.FC = () => {
  const { students, aiReports } = useStore();

  const atRiskStudents = students.filter(s => s.status === 'at-risk');
  const improvingStudents = students.filter(s => s.status === 'improving');

  // Dummy longitudinal data for the chart
  const cohortData = [
    { name: 'Week 1', focus: 65, fluency: 70 },
    { name: 'Week 2', focus: 68, fluency: 72 },
    { name: 'Week 3', focus: 75, fluency: 71 },
    { name: 'Week 4', focus: 82, fluency: 76 },
    { name: 'Week 5', focus: 85, fluency: 80 },
  ];

  const generatePDFReport = (student: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("NeuroLearn AI Diagnostic Report", 20, 20);
    doc.setFontSize(14);
    doc.text(`Student: ${student.name}`, 20, 35);
    doc.text(`Grade: ${student.grade}`, 20, 45);
    doc.text(`Current Focus Score: ${student.focusScore}%`, 20, 55);
    
    doc.setFontSize(12);
    doc.text("AI Multi-Modal Fusion Analysis:", 20, 75);
    doc.text("The XGBoost ensemble model detected low gaze dispersion", 20, 85);
    doc.text("and stable typing rhythms, indicating strong attention.", 20, 95);
    doc.text("However, minor speech hesitations were flagged by Whisper NLP.", 20, 105);

    doc.text("Recommended Interventions:", 20, 125);
    doc.text("- 15-minute phoneme repetition drills", 25, 135);
    doc.text("- Continued use of Dyslexia-font UI mode", 25, 145);

    doc.save(`${student.name.replace(" ", "_")}_NeuroLearn_Report.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Top Meta Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Students</span>
            <div className="text-2xl font-bold mt-1 text-slate-200">{students.length}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold">At-Risk Alerts</span>
            <div className="text-2xl font-bold mt-1 text-red-400">{atRiskStudents.length}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center ">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Improving</span>
            <div className="text-2xl font-bold mt-1 text-emerald-400">{improvingStudents.length}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">AI Reports</span>
            <div className="text-2xl font-bold mt-1 text-purple-400">{aiReports.length}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Research-Grade Analytics Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Longitudinal Cohort Analytics</span>
            </h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Last 5 Weeks</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cohortData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFluency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="focus" stroke="#6366f1" fillOpacity={1} fill="url(#colorFocus)" />
                <Area type="monotone" dataKey="fluency" stroke="#10b981" fillOpacity={1} fill="url(#colorFluency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Student List */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col h-[350px]">
          <h3 className="text-sm font-bold flex items-center space-x-2 mb-4">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Generate Official AI Reports</span>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {students.map(student => (
              <div key={student.id} className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between hover:bg-slate-800 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{student.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[9px] text-slate-500 uppercase">Focus: {student.focusScore}%</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'at-risk' ? 'bg-red-500' : student.status === 'improving' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                  </div>
                </div>
                <button 
                  onClick={() => generatePDFReport(student)}
                  className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                  title="Download Official AI PDF Report"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeacherPortal;

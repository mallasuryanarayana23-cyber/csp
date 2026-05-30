import { create } from 'zustand';

export interface StudentMetric {
  date: string;
  focusScore: number;
  typingDelay: number; // ms average hesitation
  wpm: number;
  speechHesitations: number;
  readingSpeed: number; // WPM
  distractionEvents: number;
  stressScore: number; // 0-100
}

export interface ReadingTest {
  id: string;
  title: string;
  category: 'Dyslexia Screening' | 'ADHD Assessment' | 'General Reading' | 'Memory Recall';
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number; // seconds
}

export interface AIReport {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  date: string;
  dyslexiaRisk: 'Low' | 'Medium' | 'High';
  dyslexiaProb: number; // 0-100
  adhdRisk: 'Low' | 'Medium' | 'High';
  adhdProb: number; // 0-100
  cognitiveStress: 'Low' | 'Moderate' | 'Severe';
  speechFluencyScore: number; // 0-100
  typingRhythmConsistency: number; // 0-100
  attentionSpanMin: number;
  recommendations: string[];
  teacherNotes: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: string;
  focusScore: number; // 0-100
  lastTested: string;
  streakDays: number;
  badges: Array<{ id: string; name: string; icon: string; date: string }>;
  metricsHistory: StudentMetric[];
  assignedTests: string[]; // test ids
  completedTests: Array<{ testId: string; date: string; score: number }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

interface AccessibilitySettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  voiceNavigation: boolean;
  readingRuler: boolean;
  readingRulerY: number;
  fontSizeScale: number; // 1, 1.15, 1.3
}

interface NeuroStore {
  user: { name: string; role: 'student' | 'teacher' | 'parent' | 'admin'; email: string } | null;
  activeRole: 'student' | 'teacher' | 'parent' | 'admin';
  accessibility: AccessibilitySettings;
  students: StudentProfile[];
  readingTests: ReadingTest[];
  aiReports: AIReport[];
  notifications: Notification[];
  
  // Actions
  login: (email: string, role: 'student' | 'teacher' | 'parent' | 'admin') => void;
  logout: () => void;
  setRole: (role: 'student' | 'teacher' | 'parent' | 'admin') => void;
  toggleAccessibility: (key: keyof AccessibilitySettings) => void;
  setRulerY: (y: number) => void;
  setFontScale: (scale: number) => void;
  addReadingTestResult: (studentId: string, testId: string, wpm: number, accuracy: number, hesitationMs: number, distractionCount: number, speechScore: number) => void;
  addTeacherNote: (reportId: string, notes: string) => void;
  addNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
  markNotificationRead: (id: string) => void;
}

const mockReadingTests: ReadingTest[] = [
  {
    id: 'test-1',
    title: 'Visual Similarity Phonetic Screening',
    category: 'Dyslexia Screening',
    text: 'The brave little brown badger built a big beautiful bridge between the dense birch branches. Quickly, a quiet yellow duck decided to dive deep down into the clear blue creek.',
    difficulty: 'Medium',
    estimatedTime: 45
  },
  {
    id: 'test-2',
    title: 'Focus Tracking & Key Hesitation Test',
    category: 'ADHD Assessment',
    text: 'Concentrating on complex challenges can sometimes require constant quiet effort. When we pay close attention, we can discover amazing patterns that are normally completely invisible to our busy eyes.',
    difficulty: 'Easy',
    estimatedTime: 35
  },
  {
    id: 'test-3',
    title: 'Fluency and Phonological Rhythm Assessment',
    category: 'General Reading',
    text: 'Extraordinary biological mechanisms allow us to translate black printed ink letters on white paper into rich, three-dimensional mental images, full of sound, texture, color, and emotional narrative structure.',
    difficulty: 'Hard',
    estimatedTime: 60
  }
];

const mockStudents: StudentProfile[] = [
  {
    id: 'student-1',
    name: 'Ethan Winters',
    email: 'ethan@neurolearn.org',
    grade: '5th Grade',
    focusScore: 82,
    lastTested: 'May 28, 2026',
    streakDays: 5,
    badges: [
      { id: 'b1', name: 'Rhythm Master', icon: '⚡', date: 'May 20, 2026' },
      { id: 'b2', name: 'Laser Focus', icon: '🎯', date: 'May 25, 2026' }
    ],
    assignedTests: ['test-1', 'test-3'],
    completedTests: [
      { testId: 'test-2', date: 'May 28, 2026', score: 88 }
    ],
    metricsHistory: [
      { date: 'May 24', focusScore: 75, typingDelay: 280, wpm: 72, speechHesitations: 5, readingSpeed: 70, distractionEvents: 4, stressScore: 35 },
      { date: 'May 25', focusScore: 78, typingDelay: 260, wpm: 75, speechHesitations: 4, readingSpeed: 74, distractionEvents: 3, stressScore: 30 },
      { date: 'May 26', focusScore: 80, typingDelay: 250, wpm: 78, speechHesitations: 3, readingSpeed: 79, distractionEvents: 2, stressScore: 28 },
      { date: 'May 27', focusScore: 82, typingDelay: 245, wpm: 80, speechHesitations: 3, readingSpeed: 82, distractionEvents: 2, stressScore: 25 },
      { date: 'May 28', focusScore: 85, typingDelay: 230, wpm: 84, speechHesitations: 2, readingSpeed: 88, distractionEvents: 1, stressScore: 20 }
    ]
  },
  {
    id: 'student-2',
    name: 'Sophia Alvarez',
    email: 'sophia@neurolearn.org',
    grade: '4th Grade',
    focusScore: 54,
    lastTested: 'May 29, 2026',
    streakDays: 2,
    badges: [
      { id: 'b3', name: 'Speech Pioneer', icon: '🗣️', date: 'May 18, 2026' }
    ],
    assignedTests: ['test-1', 'test-2'],
    completedTests: [
      { testId: 'test-3', date: 'May 29, 2026', score: 62 }
    ],
    metricsHistory: [
      { date: 'May 25', focusScore: 48, typingDelay: 540, wpm: 38, speechHesitations: 14, readingSpeed: 40, distractionEvents: 12, stressScore: 68 },
      { date: 'May 26', focusScore: 50, typingDelay: 520, wpm: 40, speechHesitations: 12, readingSpeed: 44, distractionEvents: 10, stressScore: 65 },
      { date: 'May 27', focusScore: 52, typingDelay: 490, wpm: 42, speechHesitations: 13, readingSpeed: 45, distractionEvents: 11, stressScore: 60 },
      { date: 'May 28', focusScore: 55, typingDelay: 510, wpm: 43, speechHesitations: 11, readingSpeed: 48, distractionEvents: 8, stressScore: 58 },
      { date: 'May 29', focusScore: 54, typingDelay: 530, wpm: 41, speechHesitations: 15, readingSpeed: 42, distractionEvents: 9, stressScore: 62 }
    ]
  },
  {
    id: 'student-3',
    name: 'Marcus Chen',
    email: 'marcus@neurolearn.org',
    grade: '6th Grade',
    focusScore: 68,
    lastTested: 'May 27, 2026',
    streakDays: 0,
    badges: [
      { id: 'b4', name: 'Daily Champion', icon: '👑', date: 'May 10, 2026' }
    ],
    assignedTests: ['test-2', 'test-3'],
    completedTests: [
      { testId: 'test-1', date: 'May 27, 2026', score: 71 }
    ],
    metricsHistory: [
      { date: 'May 23', focusScore: 62, typingDelay: 390, wpm: 58, speechHesitations: 8, readingSpeed: 59, distractionEvents: 6, stressScore: 48 },
      { date: 'May 24', focusScore: 65, typingDelay: 370, wpm: 60, speechHesitations: 7, readingSpeed: 62, distractionEvents: 5, stressScore: 42 },
      { date: 'May 25', focusScore: 64, typingDelay: 380, wpm: 61, speechHesitations: 8, readingSpeed: 64, distractionEvents: 7, stressScore: 45 },
      { date: 'May 26', focusScore: 67, typingDelay: 360, wpm: 64, speechHesitations: 6, readingSpeed: 68, distractionEvents: 5, stressScore: 38 },
      { date: 'May 27', focusScore: 68, typingDelay: 350, wpm: 66, speechHesitations: 6, readingSpeed: 71, distractionEvents: 4, stressScore: 35 }
    ]
  }
];

const mockAIReports: AIReport[] = [
  {
    id: 'rep-1',
    studentId: 'student-1',
    studentName: 'Ethan Winters',
    grade: '5th Grade',
    date: 'May 28, 2026',
    dyslexiaRisk: 'Low',
    dyslexiaProb: 14,
    adhdRisk: 'Low',
    adhdProb: 18,
    cognitiveStress: 'Low',
    speechFluencyScore: 88,
    typingRhythmConsistency: 84,
    attentionSpanMin: 18.5,
    recommendations: [
      'Encourage advanced descriptive writing tasks to challenge verbal fluency.',
      'Assign memory-retrieval spelling lists to maintain high typing vocabulary.',
      'Introduce cognitive pacing games to stimulate sustained concentration.'
    ],
    teacherNotes: 'Ethan is showing remarkable progress. Gaze tracking shows consistent line transitions during reading tasks. Keystroke rhythms are steady.'
  },
  {
    id: 'rep-2',
    studentId: 'student-2',
    studentName: 'Sophia Alvarez',
    grade: '4th Grade',
    date: 'May 29, 2026',
    dyslexiaRisk: 'High',
    dyslexiaProb: 82,
    adhdRisk: 'Medium',
    adhdProb: 65,
    cognitiveStress: 'Severe',
    speechFluencyScore: 45,
    typingRhythmConsistency: 42,
    attentionSpanMin: 6.8,
    recommendations: [
      'Apply custom Dyslexia-friendly formatting (OpenDyslexic font, double spacing).',
      'Break visual paragraphs into small cards with colorful border guidelines.',
      'Provide verbal speech assistance (Text-to-Speech) for multi-syllabic vocabulary words.',
      'Utilize typing dynamics tasks twice a week to trace and retrain spelling substitution habits.'
    ],
    teacherNotes: 'Sophia has a high risk marker for visual spelling substitutions (b/d confusion). Frequent pauses between keypresses denote significant processing stress.'
  },
  {
    id: 'rep-3',
    studentId: 'student-3',
    studentName: 'Marcus Chen',
    grade: '6th Grade',
    date: 'May 27, 2026',
    dyslexiaRisk: 'Medium',
    dyslexiaProb: 44,
    adhdRisk: 'High',
    adhdProb: 76,
    cognitiveStress: 'Moderate',
    speechFluencyScore: 70,
    typingRhythmConsistency: 68,
    attentionSpanMin: 9.2,
    recommendations: [
      'Introduce visual line guide rulers to reduce gaze hops and skipping errors.',
      'Adopt micro-breaks (2-3 minutes) with focused physical alignment exercises.',
      'Incorporate interactive typing exercises to anchor wandering visual attention.'
    ],
    teacherNotes: 'Marcus shows classic ADHD attention flags. Web-gaze analytics indicate high distraction vectors (looking away from camera) during medium difficulty reading segments.'
  }
];

const mockNotifications: Notification[] = [
  {
    id: 'not-1',
    title: 'High Risk Alert: Sophia Alvarez',
    message: 'AI screening detected persistent visual substitutions (b/d letter swap) during today\'s reading segment. Dyslexia probability index is currently 82%.',
    type: 'warning',
    date: 'May 29, 2026',
    read: false
  },
  {
    id: 'not-2',
    title: 'New Screening Assigned',
    message: 'Teacher has assigned a new "Visual Similarity Phonetic Screening" test. Please complete it in your student cockpit.',
    type: 'info',
    date: 'May 28, 2026',
    read: false
  },
  {
    id: 'not-3',
    title: 'Streak Milestone Unlocked!',
    message: 'Ethan Winters achieved a 5-day cognitive practice streak! Laser Focus badge added to profile.',
    type: 'success',
    date: 'May 28, 2026',
    read: true
  }
];

export const useStore = create<NeuroStore>((set) => ({
  user: { name: 'Sophia Alvarez', role: 'student', email: 'sophia@neurolearn.org' }, // Default login as Sophia to show features!
  activeRole: 'student',
  accessibility: {
    dyslexiaFont: false,
    highContrast: false,
    voiceNavigation: false,
    readingRuler: false,
    readingRulerY: 300,
    fontSizeScale: 1
  },
  students: mockStudents,
  readingTests: mockReadingTests,
  aiReports: mockAIReports,
  notifications: mockNotifications,

  login: (email, role) => set((state) => {
    let name = 'System User';
    if (role === 'student') {
      const stu = state.students.find(s => s.email === email);
      name = stu ? stu.name : 'Sophia Alvarez';
    } else if (role === 'teacher') {
      name = 'Dr. Sarah Connor';
    } else if (role === 'parent') {
      name = 'Maria Alvarez';
    } else if (role === 'admin') {
      name = 'Super Admin';
    }
    
    return {
      user: { name, role, email },
      activeRole: role
    };
  }),

  logout: () => set({ user: null }),
  
  setRole: (role) => set({ activeRole: role }),

  toggleAccessibility: (key) => set((state) => ({
    accessibility: {
      ...state.accessibility,
      [key]: !state.accessibility[key]
    }
  })),

  setRulerY: (y) => set((state) => ({
    accessibility: {
      ...state.accessibility,
      readingRulerY: y
    }
  })),

  setFontScale: (scale) => set((state) => ({
    accessibility: {
      ...state.accessibility,
      fontSizeScale: scale
    }
  })),

  addTeacherNote: (reportId, notes) => set((state) => ({
    aiReports: state.aiReports.map(rep => 
      rep.id === reportId ? { ...rep, teacherNotes: notes } : rep
    )
  })),

  addNotification: (title, message, type) => set((state) => ({
    notifications: [
      {
        id: `not-${Date.now()}`,
        title,
        message,
        type,
        date: 'Today',
        read: false
      },
      ...state.notifications
    ]
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
  })),

  addReadingTestResult: (studentId, testId, wpm, accuracy, hesitationMs, distractionCount, speechScore) => set((state) => {
    // 1. Update completed tests in student profile
    const updatedStudents = state.students.map(student => {
      if (student.id !== studentId) return student;

      // Add to completed tests
      const completedTests = [...student.completedTests, { testId, date: 'Today', score: Math.round(accuracy) }];
      
      // Build a new metrics timeline entry
      const lastMetric = student.metricsHistory[student.metricsHistory.length - 1];
      const nextFocusScore = Math.max(25, Math.min(99, Math.round(100 - (distractionCount * 6) - (hesitationMs / 15))));
      const nextStressScore = Math.max(10, Math.min(99, Math.round((hesitationMs / 10) + (distractionCount * 8))));

      const nextMetric: StudentMetric = {
        date: 'Today',
        focusScore: nextFocusScore,
        typingDelay: hesitationMs,
        wpm: wpm,
        speechHesitations: Math.round(hesitationMs / 120),
        readingSpeed: wpm,
        distractionEvents: distractionCount,
        stressScore: nextStressScore
      };

      const metricsHistory = [...student.metricsHistory, nextMetric];

      return {
        ...student,
        focusScore: nextFocusScore,
        lastTested: 'Today',
        streakDays: student.streakDays + 1,
        completedTests,
        metricsHistory
      };
    });

    // 2. recalculate/add an updated AI Report
    const student = state.students.find(s => s.id === studentId);
    const test = state.readingTests.find(t => t.id === testId);
    
    // Determine risk metrics based on real input scores
    let dyslexiaRisk: 'Low' | 'Medium' | 'High' = 'Low';
    let dyslexiaProb = 12;
    let adhdRisk: 'Low' | 'Medium' | 'High' = 'Low';
    let adhdProb = 15;
    
    if (hesitationMs > 450 || wpm < 45) {
      dyslexiaRisk = 'High';
      dyslexiaProb = Math.round(Math.min(98, 65 + (hesitationMs / 15)));
    } else if (hesitationMs > 300 || wpm < 65) {
      dyslexiaRisk = 'Medium';
      dyslexiaProb = Math.round(45 + (hesitationMs / 25));
    }
    
    if (distractionCount > 6) {
      adhdRisk = 'High';
      adhdProb = Math.round(Math.min(98, 60 + (distractionCount * 5)));
    } else if (distractionCount > 3) {
      adhdRisk = 'Medium';
      adhdProb = Math.round(35 + (distractionCount * 8));
    }

    const nextAIReport: AIReport = {
      id: `rep-${Date.now()}`,
      studentId,
      studentName: student ? student.name : 'Unknown Student',
      grade: student ? student.grade : '4th Grade',
      date: 'Today',
      dyslexiaRisk,
      dyslexiaProb,
      adhdRisk,
      adhdProb,
      cognitiveStress: wpm < 50 ? 'Severe' : wpm < 70 ? 'Moderate' : 'Low',
      speechFluencyScore: Math.round(speechScore),
      typingRhythmConsistency: Math.round(Math.max(30, 100 - (hesitationMs / 10))),
      attentionSpanMin: Number(((wpm * 2.5) / 60).toFixed(1)),
      recommendations: [
        dyslexiaRisk === 'High' ? 'Apply customizable dyslexic display scales immediately.' : 'Utilize descriptive speed typing cards twice a week.',
        adhdRisk === 'High' ? 'Enable visual line-tracking overlay rulers for reading.' : 'Assign short focus-driven phoneme segments (1-2 mins).',
        'Deploy auditory spelling assistance patterns during key typing intervals.'
      ],
      teacherNotes: `Real-time session analysis performed on test "${test ? test.title : 'General Checkup'}". Keystroke hesitation: ${hesitationMs}ms. Distraction count: ${distractionCount}.`
    };

    const updatedReports = state.aiReports.filter(r => r.studentId !== studentId).concat(nextAIReport);

    return {
      students: updatedStudents,
      aiReports: updatedReports
    };
  })
}));


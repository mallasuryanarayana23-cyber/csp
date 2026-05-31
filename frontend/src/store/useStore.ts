import { create } from 'zustand';
import { apiClient } from '../services/api/client';

export interface ReadingTest {
  id: string;
  title: string;
  category: string;
  text: string;
  difficulty: string;
  estimatedTime: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: string;
  focusScore: number;
  lastTested?: string;
  streakDays: number;
  userId: string;
  parentId?: string;
  badges?: Array<{ id: string; name: string; icon: string; date: string }>;
  metricsHistory?: Array<{ date: string; wpm: number; focusScore: number; readingSpeed?: number; distractionEvents?: number }>;
  completedTests?: string[];
  assignedTests?: string[];
}

export interface AIReport {
  id: string;
  studentId: string;
  date: string;
  dyslexiaRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  dyslexiaProb: number;
  adhdRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  adhdProb: number;
  cognitiveStress: 'LOW' | 'MODERATE' | 'SEVERE';
  speechFluencyScore: number;
  typingRhythmConsistency: number;
  attentionSpanMin: number;
  recommendations: string[];
  teacherNotes: string;
}

interface AccessibilitySettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  voiceNavigation: boolean;
  readingRuler: boolean;
  readingRulerY: number;
  fontSizeScale: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

interface NeuroStore {
  user: { id: string; name: string; role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'; email: string; studentProfileId?: string } | null;
  activeRole: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | null;
  accessibility: AccessibilitySettings;
  students: StudentProfile[];
  readingTests: ReadingTest[];
  aiReports: AIReport[];
  notifications: Notification[];
  wsClient: WebSocket | null;
  
  // Actions
  login: (token: string, user: any) => void;
  logout: () => void;
  setRole: (role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN') => void;
  toggleAccessibility: (key: keyof AccessibilitySettings) => void;
  setRulerY: (y: number) => void;
  setFontScale: (scale: number) => void;
  
  // Async API Actions
  fetchStudents: () => Promise<void>;
  fetchReports: (studentId: string) => Promise<void>;
  addReadingTestResult: (
    studentId: string,
    testId: string,
    wpm: number,
    accuracy: number,
    hesitationMs: number,
    distractionCount: number,
    speechScore: number
  ) => Promise<void>;
  connectWebSocket: () => void;
  addNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
  markNotificationRead: (id: string) => void;
  fetchReadingTests: () => Promise<void>;
  fetchStudentDetail: (studentId: string) => Promise<any>;
}

export const useStore = create<NeuroStore>((set, get) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem('neurolearn_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null && parsed.role) {
          return parsed;
        }
        localStorage.removeItem('neurolearn_token');
        localStorage.removeItem('neurolearn_user');
      }
      return null;
    } catch {
      return null;
    }
  })(),
  activeRole: (() => {
    try {
      const saved = localStorage.getItem('neurolearn_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null && parsed.role) {
          return parsed.role;
        }
      }
      return null;
    } catch {
      return null;
    }
  })(),
  accessibility: {
    dyslexiaFont: false,
    highContrast: false,
    voiceNavigation: false,
    readingRuler: false,
    readingRulerY: 300,
    fontSizeScale: 1
  },
  readingTests: [
    {
      id: 'test-1',
      title: 'Phonetic Fluency Paragraph',
      category: 'Dyslexia Screening',
      text: 'The brave brown badger built a big beautiful bridge quickly.',
      difficulty: 'Easy',
      estimatedTime: 120
    },
    {
      id: 'test-2',
      title: 'Attention Visual Gaze Assessment',
      category: 'ADHD Assessment',
      text: 'A rapid blue falcon swept across the silent sky seeking visual targets.',
      difficulty: 'Medium',
      estimatedTime: 180
    },
    {
      id: 'test-3',
      title: 'General Reading Comprehension',
      category: 'General Reading',
      text: 'Early learning difficulty detection provides essential support before students face class setbacks.',
      difficulty: 'Easy',
      estimatedTime: 150
    }
  ],
  students: [
    {
      id: 'student-2',
      name: 'Sophia Alvarez',
      email: 'sophia@neurolearn.org',
      grade: 'Grade 4',
      focusScore: 88,
      lastTested: 'Yesterday',
      streakDays: 5,
      userId: 'user-sophia',
      badges: [
        { id: 'b1', name: 'Focus Champion', icon: '🏆', date: 'May 28' },
        { id: 'b2', name: 'Speech Master', icon: '🗣', date: 'May 29' }
      ],
      metricsHistory: [
        { date: 'Mon', wpm: 70, focusScore: 80, readingSpeed: 70, distractionEvents: 2 },
        { date: 'Tue', wpm: 72, focusScore: 82, readingSpeed: 72, distractionEvents: 1 },
        { date: 'Wed', wpm: 76, focusScore: 88, readingSpeed: 76, distractionEvents: 0 }
      ],
      completedTests: ['test-1'],
      assignedTests: ['test-1', 'test-2', 'test-3']
    }
  ],
  aiReports: [
    {
      id: 'report-1',
      studentId: 'student-2',
      date: 'May 30, 2026',
      dyslexiaRisk: 'LOW',
      dyslexiaProb: 15,
      adhdRisk: 'LOW',
      adhdProb: 12,
      cognitiveStress: 'LOW',
      speechFluencyScore: 92,
      typingRhythmConsistency: 88,
      attentionSpanMin: 15,
      recommendations: [
        'Dyslexic Font Spaced Reading',
        'Attention Micro-Breaks for 2 minutes'
      ],
      teacherNotes: 'Sophia is demonstrating high focus consistency across tasks.'
    }
  ],
  notifications: [],
  wsClient: null,

  login: (token, user) => {
    localStorage.setItem('neurolearn_token', token);
    localStorage.setItem('neurolearn_user', JSON.stringify(user));
    set({ user, activeRole: user.role });
    get().connectWebSocket();
  },

  logout: () => {
    localStorage.removeItem('neurolearn_token');
    localStorage.removeItem('neurolearn_user');
    if (get().wsClient) {
      get().wsClient?.close();
    }
    set({ user: null, activeRole: null, wsClient: null });
  },
  
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

  fetchStudents: async () => {
    try {
      const res = await apiClient.get('/api/students');
      // Mix incoming student lists with default metrics history for clean graph layouts
      const enrichedStudents = res.data.map((student: any) => {
        const defaultProfile = get().students.find(s => s.id === student.id || s.email === student.user?.email);
        return {
          ...student,
          name: student.user?.name || student.name || defaultProfile?.name || 'Student Account',
          email: student.user?.email || student.email || defaultProfile?.email || '',
          badges: student.badges || defaultProfile?.badges || [],
          metricsHistory: student.metricsHistory || defaultProfile?.metricsHistory || [
            { date: 'Mon', wpm: student.focusScore - 15, focusScore: student.focusScore - 8, readingSpeed: student.focusScore - 15, distractionEvents: 1 },
            { date: 'Wed', wpm: student.focusScore - 12, focusScore: student.focusScore - 4, readingSpeed: student.focusScore - 12, distractionEvents: 0 }
          ],
          completedTests: student.completedTests || defaultProfile?.completedTests || ['test-1'],
          assignedTests: student.assignedTests || defaultProfile?.assignedTests || ['test-1', 'test-2', 'test-3']
        };
      });
      set({ students: enrichedStudents });
    } catch (e) {
      console.error('Failed to fetch students', e);
    }
  },

  fetchReports: async (studentId: string) => {
    try {
      const res = await apiClient.get(`/api/reports/${studentId}`);
      set({ aiReports: res.data });
    } catch (e) {
      console.error('Failed to fetch reports', e);
    }
  },

  fetchReadingTests: async () => {
    try {
      const res = await apiClient.get('/api/reading-tests');
      set({ readingTests: res.data });
    } catch (e) {
      console.error('Failed to fetch reading tests', e);
    }
  },

  fetchStudentDetail: async (studentId: string) => {
    try {
      const res = await apiClient.get(`/api/students/${studentId}`);
      return res.data;
    } catch (e) {
      console.error('Failed to fetch student details', e);
      return null;
    }
  },

  addReadingTestResult: async (studentId, testId, wpm, accuracy, hesitationMs, distractionCount, speechScore) => {
    try {
      const res = await apiClient.post('/api/screenings/submit', {
        studentId,
        testId,
        wpm,
        accuracy,
        hesitationMs,
        distractionCount,
        speechScore,
        aiPayload: {
          gaze_dispersion: distractionCount * 12.5,
          blink_interval: 8.5,
          avg_dwell: hesitationMs * 0.4,
          avg_flight: hesitationMs * 0.6,
          rms_amplitude: 0.05,
          hesitation_events: distractionCount + 1,
          session_duration_s: 15
        },
        aiType: testId === 'test-2' ? 'ADHD' : 'DYSLEXIA'
      });
      console.log('Screening submitted successfully:', res.data);
    } catch (e) {
      console.error('Failed to submit screening results', e);
    }
  },

  connectWebSocket: () => {
    const token = localStorage.getItem('neurolearn_token');
    if (!token) return;

    const wsUrl = import.meta.env.VITE_API_URL?.replace('http', 'ws') || 'ws://localhost:4000';
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'NEW_SCREENING_SUBMISSION') {
          get().addNotification('New Screening Results', `Student ${data.data.studentId} submitted a screening.`, 'info');
        }
      } catch (e) {
        console.error('WebSocket message parsing error', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed. Attempting reconnect in 5 seconds...');
      setTimeout(() => {
        if (localStorage.getItem('neurolearn_token')) {
          get().connectWebSocket();
        }
      }, 5000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error occurred:', err);
      ws.close();
    };

    set({ wsClient: ws });
  },

  addNotification: (title, message, type) => set((state) => ({
    notifications: [
      {
        id: `not-${Date.now()}`,
        title,
        message,
        type,
        date: 'Just now',
        read: false
      },
      ...state.notifications
    ]
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
}));

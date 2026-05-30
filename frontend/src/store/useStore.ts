import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: string;
  focusScore: number;
  lastTested?: string;
  streakDays: number;
  userId: string;
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
  user: { id: string; name: string; role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'; email: string } | null;
  activeRole: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | null;
  accessibility: AccessibilitySettings;
  students: StudentProfile[];
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
  connectWebSocket: () => void;
  addNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
}

export const useStore = create<NeuroStore>((set, get) => ({
  user: null,
  activeRole: null,
  accessibility: {
    dyslexiaFont: false,
    highContrast: false,
    voiceNavigation: false,
    readingRuler: false,
    readingRulerY: 300,
    fontSizeScale: 1
  },
  students: [],
  aiReports: [],
  notifications: [],
  wsClient: null,

  login: (token, user) => {
    localStorage.setItem('neurolearn_token', token);
    set({ user, activeRole: user.role });
    get().connectWebSocket();
  },

  logout: () => {
    localStorage.removeItem('neurolearn_token');
    if (get().wsClient) {
      get().wsClient?.close();
    }
    set({ user: null, activeRole: null, students: [], aiReports: [], wsClient: null });
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
      set({ students: res.data });
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
}));

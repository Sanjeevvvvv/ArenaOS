import { create } from 'zustand';
import { soundManager } from '@/lib/sounds';
import { playSoundSafe } from '@/lib/soundGuard';
import { UserRole, Alert, Task, Concession, TransitItem, StadiumMetrics } from './types';
import { initialAlerts, initialTasks, initialConcessions, initialTransit } from './mockData';
import { 
  calculateAttendance, 
  calculateThroughput, 
  calculateConcessions, 
  calculateTransit, 
  calculateEnvironmentMetrics 
} from './simulateTick';

// Re-export types so existing references to @/store/useAppStore do not break
export * from './types';

interface AppState {
  // Global State
  role: UserRole;
  emergencyActive: boolean;
  language: 'en' | 'es' | 'fr' | 'de' | 'pt';
  
  // Data lists
  alerts: Alert[];
  tasks: Task[];
  concessions: Concession[];
  transit: TransitItem[];
  metrics: StadiumMetrics;
  
  // Accessibility States
  accessibilityMode: boolean;
  sensoryMapMode: boolean;
  audioGuideActive: boolean;
  highContrastMode: boolean;
  
  // Actions
  setRole: (role: UserRole) => void;
  setLanguage: (lang: 'en' | 'es' | 'fr' | 'de' | 'pt') => void;
  setEmergencyActive: (active: boolean) => void;
  toggleEmergency: () => void;
  
  // Alert Actions
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  resolveAlert: (id: string) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'timestamp'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  assignTask: (id: string, name: string) => void;
  
  // Concession Actions
  updateConcessionWaitTime: (id: string, time: number) => void;
  
  // Accessibility Actions
  setAccessibilityMode: (active: boolean) => void;
  setSensoryMapMode: (active: boolean) => void;
  setAudioGuideActive: (active: boolean) => void;
  setHighContrastMode: (active: boolean) => void;
  
  // System tick simulation
  simulateTick: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: 'fan',
  emergencyActive: false,
  language: 'en',
  alerts: initialAlerts,
  tasks: initialTasks,
  concessions: initialConcessions,
  transit: initialTransit,
  metrics: {
    totalAttendance: 68420,
    gateThroughput: 340,
    energySolarPercent: 84,
    waterRecycledLiters: 32540,
    noiseLevelDb: 89
  },
  
  accessibilityMode: false,
  sensoryMapMode: false,
  audioGuideActive: false,
  highContrastMode: false,

  setRole: (role) => {
    if (typeof document !== 'undefined') {
      document.cookie = `arena_user_role=${role}; path=/;`;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arena_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user.user_metadata) {
            user.user_metadata.role = role;
            localStorage.setItem('arena_user', JSON.stringify(user));
          }
        } catch {
          // ignore
        }
      }
    }
    set({ role });
  },
  setLanguage: (language) => set({ language }),
  setEmergencyActive: (active) => set({ emergencyActive: active }),
  toggleEmergency: () => set((state) => ({ emergencyActive: !state.emergencyActive })),

  addAlert: (alert) => {
    const id = `alt-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAlert: Alert = { ...alert, id, timestamp };
    
    playSoundSafe(() => soundManager.playAlertByType(alert.type));
    
    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
  },

  updateAlertStatus: (id, status) => {
    playSoundSafe(() => soundManager.playClick());
    
    set((state) => ({
      alerts: state.alerts.map((alt) => alt.id === id ? { ...alt, status } : alt)
    }));
  },

  resolveAlert: (id) => {
    playSoundSafe(() => soundManager.playSuccess());
    
    set((state) => ({
      alerts: state.alerts.map((alt) => alt.id === id ? { ...alt, status: 'resolved' as const } : alt)
    }));
  },

  addTask: (task) => {
    const id = `tsk-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTask: Task = { ...task, id, timestamp };
    
    playSoundSafe(() => {
      const typeMap = task.category === 'medical' 
        ? 'medical' 
        : (task.category === 'cleaning' || task.category === 'maintenance') 
          ? 'facility' 
          : 'crowd';
      soundManager.playAlertByType(typeMap);
    });
    
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  updateTaskStatus: (id, status) => {
    playSoundSafe(() => {
      if (status === 'completed') {
        soundManager.playSuccess();
      } else {
        soundManager.playClick();
      }
    });

    set((state) => ({
      tasks: state.tasks.map((tsk) => tsk.id === id ? { ...tsk, status } : tsk)
    }));
  },

  assignTask: (id, name) => {
    playSoundSafe(() => soundManager.playClick());

    set((state) => ({
      tasks: state.tasks.map((tsk) => tsk.id === id ? { ...tsk, assignedTo: name, status: 'in-progress' as const } : tsk)
    }));
  },

  updateConcessionWaitTime: (id, waitTime) => set((state) => {
    let status: Concession['status'] = 'open';
    if (waitTime > 20) status = 'crowded';
    if (waitTime <= 0) status = 'closed';
    return {
      concessions: state.concessions.map((cnc) => cnc.id === id ? { ...cnc, waitTime, status } : cnc)
    };
  }),

  setAccessibilityMode: (active) => set({ accessibilityMode: active }),
  setSensoryMapMode: (active) => set({ sensoryMapMode: active }),
  setAudioGuideActive: (active) => set({ audioGuideActive: active }),
  setHighContrastMode: (active) => set({ highContrastMode: active }),

  simulateTick: () => set((state) => {
    const attendanceDelta = Math.floor(Math.random() * 20) + 5;
    const totalAttendance = calculateAttendance(state.metrics.totalAttendance, attendanceDelta);
    const gateThroughput = calculateThroughput(state.metrics.gateThroughput);
    const concessions = calculateConcessions(state.concessions);
    const transit = calculateTransit(state.transit);
    
    const nextMetrics = calculateEnvironmentMetrics({
      ...state.metrics,
      totalAttendance,
      gateThroughput
    });

    return {
      metrics: nextMetrics,
      concessions,
      transit
    };
  })
}));

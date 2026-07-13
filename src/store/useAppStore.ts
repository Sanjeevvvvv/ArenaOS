import { create } from 'zustand';
import { soundManager } from '@/lib/sounds';

export type UserRole = 'fan' | 'staff' | 'security' | 'organizer';

export interface Alert {
  id: string;
  type: 'security' | 'medical' | 'crowd' | 'facility';
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'in-progress' | 'resolved';
  timestamp: string;
  coordinates: { x: number; y: number }; // 0-100 percentage for custom SVG map overlay
}

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  category: 'cleaning' | 'restocking' | 'assistance' | 'maintenance' | 'medical';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  timestamp: string;
}

export interface Concession {
  id: string;
  name: string;
  type: 'food' | 'drink' | 'merchandise';
  waitTime: number;
  status: 'open' | 'crowded' | 'closed';
  location: string;
  popularItem: string;
}

export interface TransitItem {
  id: string;
  type: 'bus' | 'train' | 'metro' | 'rideshare';
  line: string;
  destination: string;
  nextArrival: number;
  status: 'on-time' | 'delayed' | 'crowded';
  congestionLevel: 'low' | 'moderate' | 'heavy';
}

interface StadiumMetrics {
  totalAttendance: number;
  gateThroughput: number; // people per minute
  energySolarPercent: number;
  waterRecycledLiters: number;
  noiseLevelDb: number;
}

interface AppState {
  // Global State
  role: UserRole;
  emergencyActive: boolean;
  language: 'en' | 'es' | 'fr';
  
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
  setLanguage: (lang: 'en' | 'es' | 'fr') => void;
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

const initialAlerts: Alert[] = [
  {
    id: 'alt-1',
    type: 'crowd',
    title: 'Crowd Congestion Sector D',
    description: 'Spectator density exceeding safety threshold (4.2 people/m²) near Gate 3 ramp.',
    location: 'Sector D, Gate 3',
    severity: 'high',
    status: 'active',
    timestamp: '18:15',
    coordinates: { x: 74, y: 32 }
  },
  {
    id: 'alt-2',
    type: 'facility',
    title: 'Water Leak Sector F',
    description: 'Minor water pipe burst near concession area 42, causing wet surface hazard.',
    location: 'Concourse Level 2, Sector F',
    severity: 'medium',
    status: 'in-progress',
    timestamp: '18:22',
    coordinates: { x: 38, y: 78 }
  },
  {
    id: 'alt-3',
    type: 'medical',
    title: 'Heat Exhaustion Alert',
    description: 'Report of a fan experiencing severe heat exhaustion. Medical response team dispatched.',
    location: 'Lower Bowl, Section 114, Row 12',
    severity: 'medium',
    status: 'resolved',
    timestamp: '17:45',
    coordinates: { x: 50, y: 55 }
  }
];

const initialTasks: Task[] = [
  {
    id: 'tsk-1',
    title: 'Spill Clean-up Sector F',
    description: 'Clean up water leak area near concession 42. Lay wet floor warning signs.',
    location: 'Concourse Level 2, Sector F',
    category: 'cleaning',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Carlos M. (Staff)',
    timestamp: '18:24'
  },
  {
    id: 'tsk-2',
    title: 'Restock Consumables Stand B',
    description: 'Stand B needs soda syrups and paper napkins restocked before halftime rush.',
    location: 'Sector B, Food Stand 10',
    category: 'restocking',
    priority: 'low',
    status: 'pending',
    timestamp: '18:10'
  },
  {
    id: 'tsk-3',
    title: 'Wheelchair Assistance Request',
    description: 'Escort arriving guest from West Transit Plaza to Gate 1 (ADA entrance).',
    location: 'West Transit Hub / Gate 1',
    category: 'assistance',
    priority: 'high',
    status: 'pending',
    timestamp: '18:25'
  }
];

const initialConcessions: Concession[] = [
  {
    id: 'cnc-1',
    name: 'Glory Hot Dogs',
    type: 'food',
    waitTime: 14,
    status: 'open',
    location: 'Sector A, Gate 1',
    popularItem: 'World Cup Chilli Dog'
  },
  {
    id: 'cnc-2',
    name: 'Paddock Brews & Drinks',
    type: 'drink',
    waitTime: 5,
    status: 'open',
    location: 'Sector C, Gate 6',
    popularItem: 'Stadium Draft Ale'
  },
  {
    id: 'cnc-3',
    name: 'El Tri Tacos',
    type: 'food',
    waitTime: 28,
    status: 'crowded',
    location: 'Sector F, Level 2',
    popularItem: 'Al Pastor Taco Combo'
  },
  {
    id: 'cnc-4',
    name: 'FIFA Official Merch',
    type: 'merchandise',
    waitTime: 18,
    status: 'open',
    location: 'Sector D, Gate 3 Plaza',
    popularItem: 'Custom 2026 Jersey'
  }
];

const initialTransit: TransitItem[] = [
  {
    id: 'trn-1',
    type: 'metro',
    line: 'Red Line (Metro)',
    destination: 'Downtown Express',
    nextArrival: 4,
    status: 'on-time',
    congestionLevel: 'low'
  },
  {
    id: 'trn-2',
    type: 'bus',
    line: 'Shuttle 14B',
    destination: 'North Fan Parking Park&Ride',
    nextArrival: 9,
    status: 'delayed',
    congestionLevel: 'heavy'
  },
  {
    id: 'trn-3',
    type: 'rideshare',
    line: 'Uber/Lyft Zone',
    destination: 'Main Rideshare Area',
    nextArrival: 3,
    status: 'crowded',
    congestionLevel: 'heavy'
  }
];

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

  setRole: (role) => set({ role }),
  setLanguage: (language) => set({ language }),
  setEmergencyActive: (active) => set({ emergencyActive: active }),
  toggleEmergency: () => set((state) => ({ emergencyActive: !state.emergencyActive })),

  addAlert: (alert) => {
    const id = `alt-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAlert: Alert = { ...alert, id, timestamp };
    if (typeof window !== 'undefined') {
      soundManager.playAlertByType(alert.type);
    }
    set((state) => ({ alerts: [newAlert, ...state.alerts] }));
  },

  updateAlertStatus: (id, status) => {
    if (typeof window !== 'undefined') {
      soundManager.playClick();
    }
    set((state) => ({
      alerts: state.alerts.map((alt) => alt.id === id ? { ...alt, status } : alt)
    }));
  },

  resolveAlert: (id) => {
    if (typeof window !== 'undefined') {
      soundManager.playSuccess();
    }
    set((state) => ({
      alerts: state.alerts.map((alt) => alt.id === id ? { ...alt, status: 'resolved' as const } : alt)
    }));
  },

  addTask: (task) => {
    const id = `tsk-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTask: Task = { ...task, id, timestamp };
    if (typeof window !== 'undefined') {
      const typeMap = task.category === 'medical' 
        ? 'medical' 
        : (task.category === 'cleaning' || task.category === 'maintenance') 
          ? 'facility' 
          : 'crowd';
      soundManager.playAlertByType(typeMap);
    }
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  updateTaskStatus: (id, status) => {
    if (typeof window !== 'undefined') {
      if (status === 'completed') {
        soundManager.playSuccess();
      } else {
        soundManager.playClick();
      }
    }
    set((state) => ({
      tasks: state.tasks.map((tsk) => tsk.id === id ? { ...tsk, status } : tsk)
    }));
  },

  assignTask: (id, name) => {
    if (typeof window !== 'undefined') {
      soundManager.playClick();
    }
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
    // 1. Attendance increases slightly
    const attendanceDelta = Math.floor(Math.random() * 20) + 5;
    const totalAttendance = Math.min(72000, state.metrics.totalAttendance + attendanceDelta);
    
    // 2. Gate throughput fluctuates
    const gateThroughput = Math.max(120, Math.min(800, state.metrics.gateThroughput + (Math.random() > 0.5 ? 15 : -15)));
    
    // 3. Concession wait times fluctuate
    const concessions = state.concessions.map((cnc) => {
      const waitDelta = Math.random() > 0.5 ? 1 : -1;
      const newTime = Math.max(2, Math.min(45, cnc.waitTime + (Math.random() > 0.7 ? waitDelta : 0)));
      const status: Concession['status'] = newTime > 20 ? 'crowded' : 'open';
      return { ...cnc, waitTime: newTime, status };
    });

    // 4. Transit next arrivals count down
    const transit = state.transit.map((trn) => {
      let nextArrival = trn.nextArrival - 1;
      if (nextArrival <= 0) {
        nextArrival = trn.type === 'metro' ? 6 : trn.type === 'bus' ? 12 : 5;
      }
      return { ...trn, nextArrival };
    });

    // 5. Environmental metrics fluctuation
    const energySolarPercent = Math.min(100, Math.max(70, state.metrics.energySolarPercent + (Math.random() > 0.55 ? 1 : -1)));
    const waterRecycledLiters = state.metrics.waterRecycledLiters + Math.floor(Math.random() * 50) + 10;
    const noiseLevelDb = Math.max(80, Math.min(115, state.metrics.noiseLevelDb + (Math.random() > 0.5 ? 3 : -3)));

    return {
      metrics: {
        totalAttendance,
        gateThroughput,
        energySolarPercent,
        waterRecycledLiters,
        noiseLevelDb
      },
      concessions,
      transit
    };
  })
}));

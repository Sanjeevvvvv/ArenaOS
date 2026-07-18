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

export interface StadiumMetrics {
  totalAttendance: number;
  gateThroughput: number; // people per minute
  energySolarPercent: number;
  waterRecycledLiters: number;
  noiseLevelDb: number;
}

import { Alert, Task, Concession, TransitItem } from './types';

export const initialAlerts: Alert[] = [
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

export const initialTasks: Task[] = [
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

export const initialConcessions: Concession[] = [
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

export const initialTransit: TransitItem[] = [
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

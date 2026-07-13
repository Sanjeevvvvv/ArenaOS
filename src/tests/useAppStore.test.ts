import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

describe('useAppStore Zustand Store', () => {
  beforeEach(() => {
    // Reset or initialize state
    useAppStore.setState({
      role: 'fan',
      emergencyActive: false,
      language: 'en',
      alerts: [],
      tasks: [],
    });
  });

  it('should allow setting the user role', () => {
    useAppStore.getState().setRole('organizer');
    expect(useAppStore.getState().role).toBe('organizer');
  });

  it('should allow setting the active language', () => {
    useAppStore.getState().setLanguage('es');
    expect(useAppStore.getState().language).toBe('es');
  });

  it('should toggle emergency active status', () => {
    expect(useAppStore.getState().emergencyActive).toBe(false);
    useAppStore.getState().setEmergencyActive(true);
    expect(useAppStore.getState().emergencyActive).toBe(true);
  });

  it('should add alerts correctly', () => {
    useAppStore.getState().addAlert({
      type: 'security',
      title: 'Suspicious Package',
      description: 'Sector B bag checked.',
      location: 'Sector B Entrance',
      severity: 'high',
      status: 'active',
      coordinates: { x: 20, y: 30 }
    });

    const alerts = useAppStore.getState().alerts;
    expect(alerts.length).toBe(1);
    expect(alerts[0].title).toBe('Suspicious Package');
    expect(alerts[0].id).toBeDefined();
  });

  it('should allow adding and assigning tasks', () => {
    useAppStore.getState().addTask({
      title: 'Restock cups',
      description: 'Concession stand 3 is low',
      location: 'Stand 3',
      category: 'restocking',
      priority: 'low',
      status: 'pending'
    });

    const tasks = useAppStore.getState().tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Restock cups');

    const taskId = tasks[0].id;
    useAppStore.getState().assignTask(taskId, 'John Doe');
    
    expect(useAppStore.getState().tasks[0].assignedTo).toBe('John Doe');
    expect(useAppStore.getState().tasks[0].status).toBe('in-progress');
  });
});

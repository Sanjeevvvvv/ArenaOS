'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundManager } from '@/lib/sounds';

export function SimulationProvider() {
  const simulateTick = useAppStore((state) => state.simulateTick);
  const emergencyActive = useAppStore((state) => state.emergencyActive);

  // Background state ticks
  useEffect(() => {
    const interval = setInterval(() => {
      simulateTick();
    }, 6000);

    return () => clearInterval(interval);
  }, [simulateTick]);

  // Live Evacuation Audio Siren Loop
  useEffect(() => {
    if (emergencyActive) {
      soundManager.startEmergencySiren();
    } else {
      soundManager.stopEmergencySiren();
    }

    return () => {
      soundManager.stopEmergencySiren();
    };
  }, [emergencyActive]);

  return null;
}

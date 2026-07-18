import { Concession, TransitItem, StadiumMetrics } from './types';

/**
 * Pure function to calculate new attendance value.
 * Caps at maximum stadium capacity of 72,000.
 */
export function calculateAttendance(current: number, delta: number): number {
  return Math.min(72000, current + delta);
}

/**
 * Pure function to calculate new gate throughput, fluctuating within [120, 800].
 */
export function calculateThroughput(current: number): number {
  const delta = Math.random() > 0.5 ? 15 : -15;
  return Math.max(120, Math.min(800, current + delta));
}

/**
 * Pure function to calculate fluctuating concession wait times bounded between [2, 45].
 */
export function calculateConcessions(concessions: Concession[]): Concession[] {
  return concessions.map((cnc) => {
    const waitDelta = Math.random() > 0.5 ? 1 : -1;
    const newTime = Math.max(2, Math.min(45, cnc.waitTime + (Math.random() > 0.7 ? waitDelta : 0)));
    const status: Concession['status'] = newTime > 20 ? 'crowded' : 'open';
    return { ...cnc, waitTime: newTime, status };
  });
}

/**
 * Pure function to countdown transit arrivals, resetting back to line constants at 0.
 */
export function calculateTransit(transit: TransitItem[]): TransitItem[] {
  return transit.map((trn) => {
    let nextArrival = trn.nextArrival - 1;
    if (nextArrival <= 0) {
      nextArrival = trn.type === 'metro' ? 6 : trn.type === 'bus' ? 12 : 5;
    }
    return { ...trn, nextArrival };
  });
}

/**
 * Pure function to calculate environment metrics fluctuations (Solar, Water, Noise).
 * Solar bounded within [70, 100], Noise bounded within [80, 115].
 */
export function calculateEnvironmentMetrics(metrics: StadiumMetrics): StadiumMetrics {
  const energySolarPercent = Math.min(100, Math.max(70, metrics.energySolarPercent + (Math.random() > 0.55 ? 1 : -1)));
  const waterRecycledLiters = metrics.waterRecycledLiters + Math.floor(Math.random() * 50) + 10;
  const noiseLevelDb = Math.max(80, Math.min(115, metrics.noiseLevelDb + (Math.random() > 0.5 ? 3 : -3)));
  
  return {
    ...metrics,
    energySolarPercent,
    waterRecycledLiters,
    noiseLevelDb
  };
}

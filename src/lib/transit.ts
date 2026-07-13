import type { TransitItem } from '@/store/useAppStore';

/**
 * Calculates the optimal transit option based on status, next arrival time, and congestion.
 */
export function findOptimalTransitRoute(transitList: TransitItem[]): TransitItem | null {
  if (!transitList || transitList.length === 0) return null;
  
  const sorted = [...transitList].sort((a, b) => {
    // 1. Prioritize on-time status over crowded, and crowded over delayed
    const scoreA = a.status === 'on-time' ? 0 : a.status === 'crowded' ? 1 : 2;
    const scoreB = b.status === 'on-time' ? 0 : b.status === 'crowded' ? 1 : 2;
    if (scoreA !== scoreB) return scoreA - scoreB;
    
    // 2. Prioritize lower nextArrival time
    return a.nextArrival - b.nextArrival;
  });
  
  return sorted[0];
}

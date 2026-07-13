import { describe, it, expect } from 'vitest';
import { findOptimalTransitRoute } from '../lib/transit';
import type { TransitItem } from '../store/useAppStore';

describe('findOptimalTransitRoute Wayfinding Routing Logic', () => {
  it('should return null if list is empty or null', () => {
    expect(findOptimalTransitRoute([])).toBeNull();
  });

  it('should prioritize on-time transit over crowded or delayed', () => {
    const transitItems: TransitItem[] = [
      {
        id: 't-1',
        type: 'train',
        line: 'Line A',
        destination: 'Central Station',
        nextArrival: 5,
        status: 'delayed',
        congestionLevel: 'low'
      },
      {
        id: 't-2',
        type: 'bus',
        line: 'Line B',
        destination: 'East Gate',
        nextArrival: 10,
        status: 'on-time',
        congestionLevel: 'low'
      },
      {
        id: 't-3',
        type: 'metro',
        line: 'Line C',
        destination: 'North Hub',
        nextArrival: 2,
        status: 'crowded',
        congestionLevel: 'heavy'
      }
    ];

    const result = findOptimalTransitRoute(transitItems);
    expect(result).toBeDefined();
    expect(result?.id).toBe('t-2'); // on-time, even though nextArrival is longer than C
  });

  it('should choose lowest arrival time when statuses are the same', () => {
    const transitItems: TransitItem[] = [
      {
        id: 't-1',
        type: 'train',
        line: 'Line A',
        destination: 'Central Station',
        nextArrival: 15,
        status: 'on-time',
        congestionLevel: 'low'
      },
      {
        id: 't-2',
        type: 'bus',
        line: 'Line B',
        destination: 'East Gate',
        nextArrival: 8,
        status: 'on-time',
        congestionLevel: 'low'
      }
    ];

    const result = findOptimalTransitRoute(transitItems);
    expect(result).toBeDefined();
    expect(result?.id).toBe('t-2'); // 8 mins vs 15 mins
  });
});

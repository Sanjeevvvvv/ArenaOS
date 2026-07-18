import { describe, it, expect } from 'vitest';
import { 
  calculateAttendance, 
  calculateThroughput, 
  calculateConcessions, 
  calculateTransit, 
  calculateEnvironmentMetrics 
} from '../store/simulateTick';
import { Concession, TransitItem, StadiumMetrics } from '../store/types';

describe('useAppStore simulateTick Pure Functions', () => {
  describe('calculateAttendance', () => {
    it('should increment attendance correctly', () => {
      expect(calculateAttendance(50000, 150)).toBe(50150);
    });

    it('should clamp attendance at stadium limit of 72000', () => {
      expect(calculateAttendance(71900, 200)).toBe(72000);
      expect(calculateAttendance(72000, 10)).toBe(72000);
    });
  });

  describe('calculateThroughput', () => {
    it('should fluctuate gate throughput and clamp between 120 and 800', () => {
      const lowResult = calculateThroughput(125);
      expect(lowResult).toBeGreaterThanOrEqual(110);
      
      const clampLow = calculateThroughput(120);
      expect(clampLow).toBeGreaterThanOrEqual(120); // should not drop below 120
      
      const clampHigh = calculateThroughput(800);
      expect(clampHigh).toBeLessThanOrEqual(800); // should not exceed 800
    });
  });

  describe('calculateConcessions', () => {
    it('should fluctuate wait times and keep them within bounds of [2, 45]', () => {
      const mockConcessions: Concession[] = [
        { id: '1', name: 'Stand 1', type: 'food', waitTime: 2, status: 'open', location: 'Gate 1', popularItem: 'Item 1' },
        { id: '2', name: 'Stand 2', type: 'drink', waitTime: 45, status: 'crowded', location: 'Gate 2', popularItem: 'Item 2' }
      ];

      // Run multiple iterations since there's math.random
      for (let i = 0; i < 50; i++) {
        const next = calculateConcessions(mockConcessions);
        expect(next[0].waitTime).toBeGreaterThanOrEqual(2);
        expect(next[1].waitTime).toBeLessThanOrEqual(45);
        expect(next[0].status).toBe('open');
        expect(next[1].status).toBe('crowded');
      }
    });

    it('should mark wait times > 20 as crowded and <= 20 as open', () => {
      const mockConcessions: Concession[] = [
        { id: '1', name: 'Stand 1', type: 'food', waitTime: 30, status: 'open', location: 'Gate 1', popularItem: 'Item 1' },
        { id: '2', name: 'Stand 2', type: 'drink', waitTime: 10, status: 'crowded', location: 'Gate 2', popularItem: 'Item 2' }
      ];
      
      const next = calculateConcessions(mockConcessions);
      expect(next[0].status).toBe('crowded');
      expect(next[1].status).toBe('open');
    });
  });

  describe('calculateTransit', () => {
    it('should decrement arrival times by 1', () => {
      const mockTransit: TransitItem[] = [
        { id: '1', type: 'metro', line: 'Red', destination: 'Main', nextArrival: 5, status: 'on-time', congestionLevel: 'low' }
      ];
      const next = calculateTransit(mockTransit);
      expect(next[0].nextArrival).toBe(4);
    });

    it('should reset arrivals to line constants when countdown hits 0', () => {
      const mockTransit: TransitItem[] = [
        { id: '1', type: 'metro', line: 'Red', destination: 'Main', nextArrival: 1, status: 'on-time', congestionLevel: 'low' },
        { id: '2', type: 'bus', line: 'Green', destination: 'Main', nextArrival: 1, status: 'on-time', congestionLevel: 'low' },
        { id: '3', type: 'rideshare', line: 'Uber', destination: 'Main', nextArrival: 1, status: 'on-time', congestionLevel: 'low' }
      ];
      const next = calculateTransit(mockTransit);
      expect(next[0].nextArrival).toBe(6); // Metro reset value
      expect(next[1].nextArrival).toBe(12); // Bus reset value
      expect(next[2].nextArrival).toBe(5); // Rideshare reset value
    });
  });

  describe('calculateEnvironmentMetrics', () => {
    it('should fluctuate solar energy and keep it within [70, 100]', () => {
      const baseMetrics: StadiumMetrics = {
        totalAttendance: 60000,
        gateThroughput: 300,
        energySolarPercent: 70,
        waterRecycledLiters: 10000,
        noiseLevelDb: 80
      };

      for (let i = 0; i < 50; i++) {
        const next = calculateEnvironmentMetrics(baseMetrics);
        expect(next.energySolarPercent).toBeGreaterThanOrEqual(70);
        expect(next.energySolarPercent).toBeLessThanOrEqual(71); // only goes up/down by 1
      }

      const highMetrics = { ...baseMetrics, energySolarPercent: 100 };
      const nextHigh = calculateEnvironmentMetrics(highMetrics);
      expect(nextHigh.energySolarPercent).toBeLessThanOrEqual(100);
    });

    it('should scale up recycled water liter count', () => {
      const baseMetrics: StadiumMetrics = {
        totalAttendance: 60000,
        gateThroughput: 300,
        energySolarPercent: 80,
        waterRecycledLiters: 10000,
        noiseLevelDb: 80
      };
      const next = calculateEnvironmentMetrics(baseMetrics);
      expect(next.waterRecycledLiters).toBeGreaterThan(10000);
      expect(next.waterRecycledLiters - 10000).toBeLessThanOrEqual(60);
    });

    it('should fluctuate decibel levels and clamp between [80, 115]', () => {
      const baseMetrics: StadiumMetrics = {
        totalAttendance: 60000,
        gateThroughput: 300,
        energySolarPercent: 80,
        waterRecycledLiters: 10000,
        noiseLevelDb: 80
      };

      for (let i = 0; i < 50; i++) {
        const next = calculateEnvironmentMetrics(baseMetrics);
        expect(next.noiseLevelDb).toBeGreaterThanOrEqual(80);
      }

      const maxMetrics = { ...baseMetrics, noiseLevelDb: 115 };
      const nextMax = calculateEnvironmentMetrics(maxMetrics);
      expect(nextMax.noiseLevelDb).toBeLessThanOrEqual(115);
    });
  });
});

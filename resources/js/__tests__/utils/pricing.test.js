import { describe, it, expect } from 'vitest';
import { calculateMarginActual, getMarginColor } from '@/utils/pricing';

describe('calculateMarginActual', () => {
    // ─────────────────────────────────────────────
    // Normal margin calculations
    // ─────────────────────────────────────────────

    it('calculates margin correctly for normal values', () => {
        // sellingPrice=12000, avgCost=10000 → margin = ((12000-10000)/10000) × 100 = 20%
        const result = calculateMarginActual(12000, 10000);
        expect(result).toBe('20.00');
    });

    it('calculates margin with fractional result', () => {
        // sellingPrice=15000, avgCost=12000 → margin = 25%
        const result = calculateMarginActual(15000, 12000);
        expect(result).toBe('25.00');
    });

    it('calculates zero margin when prices are equal', () => {
        // sellingPrice=10000, avgCost=10000 → margin = 0%
        const result = calculateMarginActual(10000, 10000);
        expect(result).toBe('0.00');
    });

    it('calculates negative margin (loss)', () => {
        // sellingPrice=8000, avgCost=10000 → margin = -20%
        const result = calculateMarginActual(8000, 10000);
        expect(result).toBe('-20.00');
    });

    it('handles high margin correctly', () => {
        // sellingPrice=30000, avgCost=10000 → margin = 200%
        const result = calculateMarginActual(30000, 10000);
        expect(result).toBe('200.00');
    });

    it('returns two decimal places', () => {
        // sellingPrice=11333, avgCost=10000 → margin = 13.33%
        const result = calculateMarginActual(11333, 10000);
        expect(result).toBe('13.33');
    });

    // ─────────────────────────────────────────────
    // Edge cases / division-by-zero protection
    // ─────────────────────────────────────────────

    it('returns 0 when avgCost is 0', () => {
        const result = calculateMarginActual(15000, 0);
        expect(result).toBe(0);
    });

    it('returns 0 when avgCost is negative', () => {
        const result = calculateMarginActual(15000, -100);
        expect(result).toBe(0);
    });

    it('returns 0 when avgCost is null', () => {
        const result = calculateMarginActual(15000, null);
        expect(result).toBe(0);
    });

    it('returns 0 when avgCost is undefined', () => {
        const result = calculateMarginActual(15000, undefined);
        expect(result).toBe(0);
    });
});

describe('getMarginColor', () => {
    // ─────────────────────────────────────────────
    // Color thresholds
    // ─────────────────────────────────────────────

    it('returns emerald for margin >= 20%', () => {
        expect(getMarginColor(20)).toBe('text-emerald-600');
        expect(getMarginColor(25)).toBe('text-emerald-600');
        expect(getMarginColor(100)).toBe('text-emerald-600');
    });

    it('returns amber for margin >= 10% and < 20%', () => {
        expect(getMarginColor(10)).toBe('text-amber-500');
        expect(getMarginColor(15)).toBe('text-amber-500');
        expect(getMarginColor(19.99)).toBe('text-amber-500');
    });

    it('returns red for margin < 10%', () => {
        expect(getMarginColor(9.99)).toBe('text-red-500');
        expect(getMarginColor(5)).toBe('text-red-500');
        expect(getMarginColor(0)).toBe('text-red-500');
        expect(getMarginColor(-10)).toBe('text-red-500');
    });

    // ─────────────────────────────────────────────
    // Boundary values (exact thresholds)
    // ─────────────────────────────────────────────

    it('returns emerald at exactly 20%', () => {
        expect(getMarginColor(20)).toBe('text-emerald-600');
    });

    it('returns amber at exactly 10%', () => {
        expect(getMarginColor(10)).toBe('text-amber-500');
    });
});

import { describe, it, expect } from 'vitest';
import { formatRupiah } from '@/utils/currency';

describe('formatRupiah', () => {
    // ─────────────────────────────────────────────
    // Normal values
    // ─────────────────────────────────────────────

    it('formats positive integers correctly', () => {
        const result = formatRupiah(15000);
        expect(result).toContain('15.000');
        expect(result).toContain('Rp');
    });

    it('formats large numbers with thousand separators', () => {
        const result = formatRupiah(1500000);
        expect(result).toContain('1.500.000');
    });

    it('formats zero as Rp 0', () => {
        const result = formatRupiah(0);
        expect(result).toContain('0');
        expect(result).toContain('Rp');
    });

    it('formats negative amounts', () => {
        const result = formatRupiah(-5000);
        expect(result).toContain('5.000');
    });

    // ─────────────────────────────────────────────
    // Edge cases / null handling
    // ─────────────────────────────────────────────

    it('returns Rp 0 for null', () => {
        expect(formatRupiah(null)).toBe('Rp 0');
    });

    it('returns Rp 0 for undefined', () => {
        expect(formatRupiah(undefined)).toBe('Rp 0');
    });

    // ─────────────────────────────────────────────
    // Decimal handling (should be 0 fraction digits)
    // ─────────────────────────────────────────────

    it('truncates decimal amounts (no fraction digits)', () => {
        const result = formatRupiah(15000.75);
        // Should NOT show .75 since maximumFractionDigits is 0
        expect(result).not.toContain('.75');
    });

    it('formats small values correctly', () => {
        const result = formatRupiah(500);
        expect(result).toContain('500');
    });

    // ─────────────────────────────────────────────
    // Realistic POS values
    // ─────────────────────────────────────────────

    it('formats typical fruit price', () => {
        // Apel Fuji 1kg = Rp 45.000
        const result = formatRupiah(45000);
        expect(result).toContain('45.000');
    });

    it('formats large transaction total', () => {
        // Total belanja = Rp 2.350.000
        const result = formatRupiah(2350000);
        expect(result).toContain('2.350.000');
    });
});

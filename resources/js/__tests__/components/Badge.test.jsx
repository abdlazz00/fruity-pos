import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/Components/Badge';

describe('Badge Component', () => {
    // ─────────────────────────────────────────────
    // Rendering
    // ─────────────────────────────────────────────

    it('renders children text correctly', () => {
        render(<Badge>Aktif</Badge>);
        expect(screen.getByText('Aktif')).toBeInTheDocument();
    });

    it('renders with default variant when no variant specified', () => {
        const { container } = render(<Badge>Default</Badge>);
        const badge = container.firstChild;
        // Default variant uses gray colors
        expect(badge.className).toContain('bg-[#F3F4F6]');
        expect(badge.className).toContain('text-[#9CA3AF]');
    });

    // ─────────────────────────────────────────────
    // Variant styles
    // ─────────────────────────────────────────────

    it('applies success variant (Aktif / Approved / Locked)', () => {
        const { container } = render(<Badge variant="success">Approved</Badge>);
        const badge = container.firstChild;
        expect(badge.className).toContain('bg-[#F0FDF4]');
        expect(badge.className).toContain('text-[#16A34A]');
    });

    it('applies warning variant (Pending)', () => {
        const { container } = render(<Badge variant="warning">Pending</Badge>);
        const badge = container.firstChild;
        expect(badge.className).toContain('bg-[#FFFBEB]');
        expect(badge.className).toContain('text-[#EAB308]');
    });

    it('applies danger variant (Rejected / Cancelled)', () => {
        const { container } = render(<Badge variant="danger">Rejected</Badge>);
        const badge = container.firstChild;
        expect(badge.className).toContain('bg-[#FEF2F2]');
        expect(badge.className).toContain('text-[#DC2626]');
    });

    it('applies info variant (Confirmed)', () => {
        const { container } = render(<Badge variant="info">Confirmed</Badge>);
        const badge = container.firstChild;
        expect(badge.className).toContain('bg-[#E6F1FB]');
        expect(badge.className).toContain('text-[#0C447C]');
    });

    it('falls back to default for unknown variant', () => {
        const { container } = render(<Badge variant="nonexistent">Test</Badge>);
        const badge = container.firstChild;
        expect(badge.className).toContain('bg-[#F3F4F6]');
    });

    // ─────────────────────────────────────────────
    // Custom className
    // ─────────────────────────────────────────────

    it('appends custom className', () => {
        const { container } = render(<Badge className="ml-2">Custom</Badge>);
        const badge = container.firstChild;
        expect(badge.className).toContain('ml-2');
    });

    // ─────────────────────────────────────────────
    // Structure
    // ─────────────────────────────────────────────

    it('renders as a span element', () => {
        const { container } = render(<Badge>Span</Badge>);
        expect(container.firstChild.tagName).toBe('SPAN');
    });

    it('has rounded-full pill shape', () => {
        const { container } = render(<Badge>Pill</Badge>);
        expect(container.firstChild.className).toContain('rounded-full');
    });
});

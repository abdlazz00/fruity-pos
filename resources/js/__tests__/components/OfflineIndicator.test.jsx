import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OfflineIndicator from '@/Components/OfflineIndicator';

describe('OfflineIndicator Component', () => {
    // ─────────────────────────────────────────────
    // Online State
    // ─────────────────────────────────────────────

    it('shows "Online" text when online', () => {
        render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={0}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );
        expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('shows green dot when online', () => {
        const { container } = render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={0}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );
        const dot = container.querySelector('.bg-emerald-500');
        expect(dot).toBeInTheDocument();
    });

    // ─────────────────────────────────────────────
    // Offline State
    // ─────────────────────────────────────────────

    it('shows "Offline" text when offline', () => {
        render(
            <OfflineIndicator
                isOnline={false}
                pendingCount={0}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );
        expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('shows red dot when offline', () => {
        const { container } = render(
            <OfflineIndicator
                isOnline={false}
                pendingCount={0}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );
        const dot = container.querySelector('.bg-red-500');
        expect(dot).toBeInTheDocument();
    });

    it('shows pulse animation when offline', () => {
        const { container } = render(
            <OfflineIndicator
                isOnline={false}
                pendingCount={0}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );
        const statusBadge = container.querySelector('.animate-pulse');
        expect(statusBadge).toBeInTheDocument();
    });

    // ─────────────────────────────────────────────
    // Pending Count Badge
    // ─────────────────────────────────────────────

    it('hides sync button when no pending transactions', () => {
        render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={0}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );
        expect(screen.queryByText(/Pending/)).not.toBeInTheDocument();
    });

    it('shows pending count when there are pending transactions', () => {
        render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={3}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );
        expect(screen.getByText(/3 Pending/)).toBeInTheDocument();
    });

    it('shows sync button as clickable when online with pending', () => {
        const mockClick = vi.fn();
        render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={5}
                isSyncing={false}
                onSyncClick={mockClick}
            />
        );

        const syncButton = screen.getByText(/5 Pending/).closest('button');
        expect(syncButton).not.toBeDisabled();

        fireEvent.click(syncButton);
        expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('disables sync button when offline', () => {
        render(
            <OfflineIndicator
                isOnline={false}
                pendingCount={3}
                isSyncing={false}
                onSyncClick={() => {}}
            />
        );

        const syncButton = screen.getByText(/3 Pending/).closest('button');
        expect(syncButton).toBeDisabled();
    });

    // ─────────────────────────────────────────────
    // Syncing State
    // ─────────────────────────────────────────────

    it('shows "Syncing..." text while syncing', () => {
        render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={3}
                isSyncing={true}
                onSyncClick={() => {}}
            />
        );
        expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });

    it('disables sync button while syncing', () => {
        render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={3}
                isSyncing={true}
                onSyncClick={() => {}}
            />
        );

        const syncButton = screen.getByText('Syncing...').closest('button');
        expect(syncButton).toBeDisabled();
    });

    it('shows spinner animation while syncing', () => {
        const { container } = render(
            <OfflineIndicator
                isOnline={true}
                pendingCount={3}
                isSyncing={true}
                onSyncClick={() => {}}
            />
        );
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });
});

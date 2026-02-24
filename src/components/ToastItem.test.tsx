import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToastItem } from './ToastItem';
import type { Toast } from '../types/types';
import { TOAST_APPEARANCE_ANIMATION_MS } from '../common/constants.ts';


describe('ToastItem', () => {
    const mockOnRemove = vi.fn();
    const defaultToast: Toast = {
        id: 'test-id',
        message: 'Test Message',
        type: 'success',
        duration: 3000,
        timestamp: Date.now(),
    };

    beforeEach(() => {
        vi.useFakeTimers();
        mockOnRemove.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders correctly', () => {
        render(<ToastItem toast={defaultToast} onRemove={mockOnRemove} />);
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('calls onRemove after duration', () => {
        render(<ToastItem toast={defaultToast} onRemove={mockOnRemove} />);

        vi.advanceTimersByTime(2999);
        expect(mockOnRemove).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100);

        expect(mockOnRemove).not.toHaveBeenCalled();

        vi.advanceTimersByTime(TOAST_APPEARANCE_ANIMATION_MS);

        expect(mockOnRemove).toHaveBeenCalledWith('test-id');
    });

    it('pauses on hover and resumes on leave (Smart Timer)', () => {
        render(<ToastItem toast={defaultToast} onRemove={mockOnRemove} />);

        vi.advanceTimersByTime(1000);

        expect(mockOnRemove).not.toHaveBeenCalled();

        const toastElement = screen.getByRole('alert');
        fireEvent.mouseEnter(toastElement);

        vi.advanceTimersByTime(5000);

        expect(mockOnRemove).not.toHaveBeenCalled();

        fireEvent.mouseLeave(toastElement);

        vi.advanceTimersByTime(1500);

        expect(mockOnRemove).not.toHaveBeenCalled();

        vi.advanceTimersByTime(600);

        expect(mockOnRemove).not.toHaveBeenCalled();

        vi.advanceTimersByTime(TOAST_APPEARANCE_ANIMATION_MS);

        expect(mockOnRemove).toHaveBeenCalledWith('test-id');
    });

    it('resets timer when timestamp updates (deduplication)', () => {
        const { rerender } = render(<ToastItem toast={defaultToast} onRemove={mockOnRemove} />);

        vi.advanceTimersByTime(2000);

        expect(mockOnRemove).not.toHaveBeenCalled();

        const updatedToast = { ...defaultToast, timestamp: Date.now() };
        rerender(<ToastItem toast={updatedToast} onRemove={mockOnRemove} />);

        vi.advanceTimersByTime(2000);

        expect(mockOnRemove).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1100);

        expect(mockOnRemove).not.toHaveBeenCalled(); // Exit animation in progress

        vi.advanceTimersByTime(TOAST_APPEARANCE_ANIMATION_MS);

        expect(mockOnRemove).toHaveBeenCalledWith('test-id');
    });
});
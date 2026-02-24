import { useState, useCallback, type FC } from 'react';
import type { Toast } from '../types/types';
import { usePausableTimer } from '../hooks/usePausableTimer';
import { TOAST_APPEARANCE_ANIMATION_MS } from '../common/constants.ts';

interface ToastItemProps {
  toast: Toast;
  onRemoveToast: (id: string) => void;
}

export const ToastItem: FC<ToastItemProps> = ({ toast, onRemoveToast }) => {
  const [isToastClosing, setIsToastClosing] = useState(false);

  const handleCloseToast = useCallback(() => {
    setIsToastClosing(true);
    setTimeout(() => onRemoveToast(toast.id), TOAST_APPEARANCE_ANIMATION_MS);
  }, [onRemoveToast, toast.id]);

  const { pauseTimer, resumeTimer } = usePausableTimer({
    duration: toast.duration,
    timestamp: toast.timestamp,
    onExpire: handleCloseToast,
  });

  const className = `toast toast-${toast.type}${isToastClosing ? ' toast-unmount' : ''}`;

  return (
    <div
      className={className}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      role="alert"
    >
      <span>{toast.message}</span>
      <button onClick={handleCloseToast}>×</button>
    </div>
  );
};
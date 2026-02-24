import { useState, useCallback, type FC } from 'react';
import type { Toast } from '../types/types';
import { usePausableTimer } from '../hooks/usePausableTimer';
import { TOAST_APPEARANCE_ANIMATION_MS } from '../common/constants.ts';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem: FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const startExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), TOAST_APPEARANCE_ANIMATION_MS);
  }, [onRemove, toast.id]);

  const { pauseTimer, resumeTimer } = usePausableTimer({
    duration: toast.duration,
    timestamp: toast.timestamp,
    onExpire: startExit,
  });

  const className = `toast toast-${toast.type}${isExiting ? ' toast-unmount' : ''}`;

  return (
    <div
      className={className}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      role="alert"
    >
      <span>{toast.message}</span>
      <button onClick={startExit}>×</button>
    </div>
  );
};
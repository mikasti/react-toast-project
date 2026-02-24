/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, useContext, createContext, useMemo, type ReactNode, type FC } from 'react';
import type { Toast } from '../types/types.ts';
import { ToastItem } from '../components/ToastItem.tsx';
import { generateUID } from '../common/generateUID.ts';

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts((prevToasts) => {
      const existingToast = prevToasts.find(
        (t) => t.message === toast.message && t.type === toast.type
      );

      if (existingToast) {
        return prevToasts.map((t) =>
          t.id === existingToast.id
            ? { ...t, timestamp: Date.now() }
            : t
        );
      }

      const newToast: Toast = {
        ...toast,
        id: generateUID(),
        timestamp: Date.now(),
      };

      return [...prevToasts, newToast];
    });
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter(( t) => t.id !== toastId));
  }, []);

  const contextValue = useMemo(() => ({
    addToast,
    removeToast
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-list">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemoveToast={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
};
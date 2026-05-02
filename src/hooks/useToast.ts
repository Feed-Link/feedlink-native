import { useState, useCallback, useRef } from 'react';
import { ToastItem } from '../components/Toast';

export default function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return { toasts, show };
}

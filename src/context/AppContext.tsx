import React from 'react';
import { useState, useCallback, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { ToastItem } from '../components/Toast';
import useToast from '../hooks/useToast';
import * as api from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

api.setStorage({
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
});

interface AppContextType {
  user: any | null;
  setUser: (u: any | null) => void;
  role: string | null;
  setRole: (r: string) => void;
  toasts: ToastItem[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  logout: () => Promise<void>;
  unreadCount: number;
  setUnreadCount: (n: number) => void;
}

const AppContext = React.createContext<AppContextType>({
  user: null, setUser: () => {}, role: null, setRole: () => {},
  toasts: [], showToast: () => {}, logout: async () => {},
  unreadCount: 0, setUnreadCount: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toasts, show } = useToast();
  const router = useRouter();
  const segments = useSegments();

  const logout = useCallback(async () => {
    try { await api.auth.logout(); } catch (_) {}
    api.clearTokens();
    await AsyncStorage.removeItem('fl_role');
    await AsyncStorage.removeItem('fl_user');
    setUser(null);
    setRole(null);
    router.replace('/auth/onboarding' as any);
  }, []);

  // Auto-check auth on mount
  React.useEffect(() => {
    const check = async () => {
      await api.loadTokens();
      const storedRole = await AsyncStorage.getItem('fl_role');
      if (storedRole) setRole(storedRole);
      if (api.getToken() && storedRole) {
        try {
          const res = await api.auth.getProfile();
          setUser(res.data);
          const seg = segments.join('/');
          if (!seg.includes('auth')) return; // already in app
          router.replace((`/${storedRole}/home` as any));
        } catch (_) { /* token invalid */ }
      }
    };
    check();
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, role, setRole, toasts, showToast: show, logout, unreadCount, setUnreadCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return React.useContext(AppContext); }

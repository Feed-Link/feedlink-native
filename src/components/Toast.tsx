import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../theme';

export interface ToastItem {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastItem[];
}

export function Toast({ toasts }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <View style={styles.container}>
      {toasts.map(t => (
        <View
          key={t.id}
          style={[
            styles.toast,
            t.type === 'error' ? styles.error : t.type === 'success' ? styles.success : styles.info,
          ]}
        >
          <Text style={styles.text}>{t.msg}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -160 }],
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
    width: 320,
  },
  toast: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: '600',
    width: '100%',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 10,
  },
  error: { backgroundColor: 'rgba(220,38,38,0.95)', color: '#fff' },
  success: { backgroundColor: 'rgba(22,163,74,0.95)', color: '#fff' },
  info: { backgroundColor: 'rgba(28,25,23,0.92)', color: '#fff' },
  text: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});

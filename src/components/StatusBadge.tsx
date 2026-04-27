import React from 'react';
import { Text, ViewStyle } from 'react-native';
import { C } from '../theme';

interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: 'rgba(245,158,11,0.12)', color: C.amber, label: 'Active' },
  claimed: { bg: 'rgba(61,133,220,0.12)', color: C.blue, label: 'Claimed' },
  completed: { bg: 'rgba(22,163,74,0.12)', color: C.green, label: 'Completed' },
  expired: { bg: 'rgba(168,163,158,0.15)', color: C.textLight, label: 'Expired' },
  cancelled: { bg: 'rgba(220,38,38,0.1)', color: C.red, label: 'Cancelled' },
  pending: { bg: 'rgba(245,158,11,0.12)', color: C.amber, label: 'Pending' },
  confirmed: { bg: 'rgba(22,163,74,0.12)', color: C.green, label: 'Confirmed' },
  rejected: { bg: 'rgba(220,38,38,0.1)', color: C.red, label: 'Rejected' },
  open: { bg: 'rgba(22,163,74,0.12)', color: C.green, label: 'Open' },
  accepted: { bg: 'rgba(61,133,220,0.12)', color: C.blue, label: 'Accepted' },
  fulfilled: { bg: 'rgba(22,163,74,0.12)', color: C.green, label: 'Fulfilled' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = statusMap[status] || statusMap.active;
  return (
    <Text style={{ display: 'inline-block', paddingHorizontal: 11, paddingVertical: 4, borderRadius: 99, backgroundColor: s.bg, color: s.color, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 } as ViewStyle}>
      {s.label}
    </Text>
  );
}

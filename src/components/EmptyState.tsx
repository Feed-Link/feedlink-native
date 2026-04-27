import React from 'react';
import { View, Text } from 'react-native';
import { C } from '../theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 }}>
      <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        {icon || <Text style={{ fontSize: 36 }}>📭</Text>}
      </View>
      <Text style={{ fontWeight: '700', fontSize: 17, color: C.textDark, marginBottom: 6, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 13, color: C.textLight, lineHeight: 19.5, textAlign: 'center' }}>{subtitle}</Text>}
    </View>
  );
}

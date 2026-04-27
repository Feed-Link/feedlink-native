import React from 'react';
import { View, Text } from 'react-native';
import { C } from '../theme';

interface AvatarProps {
  name?: string;
  size?: number;
  color?: string;
}

export default function Avatar({ name = '?', size = 44, color = C.green }: AvatarProps) {
  const parts = name ? name.split(' ') : [];
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (parts[0] || '?')[0].toUpperCase();

  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Text style={{
        fontSize: size * 0.4,
        fontWeight: '700',
        color: '#fff',
      }}>{initials}</Text>
    </View>
  );
}

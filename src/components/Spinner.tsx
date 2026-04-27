import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { C } from '../theme';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export default function Spinner({ size = 36, color }: SpinnerProps) {
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size={size} color={color || C.green} />
    </View>
  );
}

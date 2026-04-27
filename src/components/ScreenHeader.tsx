import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightEl?: React.ReactNode;
}

export default function ScreenHeader({ title, onBack, rightEl }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12 }]}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Text style={{ fontSize: 18, color: C.textDark }}>→</Text>
          </View>
        </TouchableOpacity>
      )}
      <Text style={{ flex: 1, fontWeight: '700', fontSize: 18, color: C.textDark }}>{title}</Text>
      {rightEl}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(250,250,249,0.88)',
    borderBottomWidth: 0,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

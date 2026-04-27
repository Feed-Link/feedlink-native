import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { C } from '../theme';

interface TagChipProps {
  tag: string;
  selected: boolean;
  onClick: () => void;
}

const labels: Record<string, string> = {
  for_humans: 'For Humans',
  for_animals: 'For Animals',
  for_both: 'For Both',
  cooked: 'Cooked',
  raw_ingredients: 'Raw Ingredients',
  packaged: 'Packaged',
};

export default function TagChip({ tag, selected, onClick }: TagChipProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.85}
      style={{
        height: 32,
        paddingHorizontal: 16,
        borderRadius: 99,
        borderWidth: 0,
        backgroundColor: selected ? C.green : C.surface2,
        justifyContent: 'center',
        flexShrink: 0,
      } as ViewStyle}
    >
      <Text style={{
        fontSize: 12,
        fontWeight: '700',
        color: selected ? '#fff' : C.textMid,
        whiteSpace: 'nowrap',
      }}>{labels[tag] || tag}</Text>
    </TouchableOpacity>
  );
}

import React from 'react';
import { TextInput, View, Text, TextStyle } from 'react-native';
import { C } from '../theme';

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  accentColor?: string;
}

export default function TextArea({ label, value, onChange, placeholder, rows = 3, required, accentColor = C.green }: TextAreaProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ display: 'block', fontWeight: '600', fontSize: 12, color: C.textMid, marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {label}{required && <Text style={{ color: C.red }}> *</Text>}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.textLight}
        multiline
        numberOfLines={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          borderRadius: 14,
          borderWidth: 2,
          borderColor: focused ? accentColor : 'transparent',
          backgroundColor: C.surface2,
          padding: 12,
          fontSize: 14,
          color: C.textDark,
          textAlignVertical: 'top',
          outlineStyle: 'none',
          shadowColor: focused ? accentColor : 'transparent',
          shadowOpacity: focused ? 0.1 : 0,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

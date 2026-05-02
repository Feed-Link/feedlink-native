import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { C } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  accentColor?: string;
}

export default React.memo(function Input({ label, value, onChangeText, placeholder, required, secureTextEntry, keyboardType, style, accentColor = C.green, ...rest }: InputProps) {
  const [focused, setFocused] = React.useState(false);

  const borderColor = focused ? accentColor : 'transparent';
  const bgColor = focused ? C.surface : C.surface2;

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.textMid, marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {label}{required && <Text style={{ color: C.red }}> *</Text>}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            width: '100%',
            height: 48,
            borderRadius: 14,
            borderWidth: 2,
            borderColor,
            backgroundColor: bgColor,
            paddingHorizontal: 14,
            fontSize: 14,
            color: C.textDark,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
});

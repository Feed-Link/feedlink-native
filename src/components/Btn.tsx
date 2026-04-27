import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { C } from '../theme';

type BtnVariant = 'primary' | 'amber' | 'outline' | 'danger' | 'ghost';
type BtnSize = 'sm' | 'md' | 'lg';

interface BtnProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: BtnVariant;
  fullWidth?: boolean;
  size?: BtnSize;
  disabled?: boolean;
  style?: ViewStyle;
  loading?: boolean;
}

const gradMap = {
  primary: [C.green, C.greenDark],
  amber: ['rgb(251,191,36)', 'rgb(217,119,6)'],
};

export default function Btn({ children, onPress, variant = 'primary', fullWidth, size = 'md', disabled, style, loading }: BtnProps) {
  const isGradient = variant === 'primary' || variant === 'amber';
  const sz = { sm: { h: 34, px: 16, fs: 12 }, md: { h: 48, px: 22, fs: 15 }, lg: { h: 54, px: 24, fs: 16 } }[size];

  const baseStyle: ViewStyle = {
    height: sz.h,
    paddingHorizontal: sz.px,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: fullWidth ? '100%' as any : 'auto',
  };

  const variantStyle: ViewStyle = isGradient
    ? { backgroundColor: disabled ? C.surface2 : C[variant === 'primary' ? 'green' : 'amber'] }
    : variant === 'outline'
    ? { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border }
    : variant === 'danger'
    ? { backgroundColor: C.surface, borderWidth: 1.5, borderColor: 'rgb(250,202,202)' }
    : { backgroundColor: 'transparent' };

  const textColor = disabled ? C.textLight : (variant === 'primary' || variant === 'amber') ? '#fff' : variant === 'danger' ? C.red : C.textDark;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[baseStyle, variantStyle, disabled ? { opacity: 0.5 } : {}, style]}
      activeOpacity={0.85}
    >
      {loading && <ActivityIndicator size="small" color={textColor} />}
      <Text style={{ fontSize: sz.fs, fontWeight: '700', color: textColor, letterSpacing: 0.1 }}>{children}</Text>
    </TouchableOpacity>
  );
}

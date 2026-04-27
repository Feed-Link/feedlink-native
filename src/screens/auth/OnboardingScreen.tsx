import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { C } from '../../theme';
import Btn from '../../components/Btn';

interface RoleOption {
  value: string;
  title: string;
  sub: string;
  icon: string;
}

export default function OnboardingScreen() {
  const [role, setRole] = React.useState('donor');
  const router = useRouter();

  const options: RoleOption[] = [
    { value: 'donor', title: 'Donate Food', sub: 'I have surplus food to share', icon: '🌱' },
    { value: 'recipient', title: 'Receive Food', sub: "I'm looking for food for my community", icon: '🤲' },
  ];

  const handleSelect = (v: string) => {
    setRole(v);
    Haptics.selectionAsync().catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>I want to…</Text>
        <Text style={styles.subheading}>Pick how you'd like to use FeedLink.</Text>
      </View>

      <View style={styles.options}>
        {options.map(opt => {
          const isSelected = role === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              activeOpacity={0.85}
              style={[styles.option, isSelected ? styles.optionSelected : styles.optionDefault]}
            >
              <View style={[styles.iconBox, isSelected ? styles.iconBoxSelected : styles.iconBoxDefault]}>
                <Text style={styles.iconText}>{opt.icon}</Text>
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionSub}>{opt.sub}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Btn fullWidth size="lg" variant="amber" onPress={() => router.push(`/register?role=${role}` as any)}>
          Continue →
        </Btn>
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink} onPress={() => router.push('/login' as any)}>Log in</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    backgroundColor: C.bg,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: 32,
  },
  heading: {
    fontWeight: '700',
    fontSize: 26,
    color: C.textDark,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: C.textMid,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    flex: 1,
  },
  option: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionSelected: {
    borderColor: C.amber,
    backgroundColor: 'rgba(245,158,11,0.04)',
  },
  optionDefault: {
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    flexShrink: 0,
  },
  iconBoxSelected: {
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  iconBoxDefault: {
    backgroundColor: C.surface2,
  },
  iconText: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    fontSize: 17,
    color: C.textDark,
  },
  optionSub: {
    fontSize: 13,
    color: C.textMid,
    marginTop: 4,
  },
  checkBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
  },
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    color: C.textMid,
    marginTop: 16,
  },
  loginLink: {
    color: C.amber,
    fontWeight: '700',
  },
});

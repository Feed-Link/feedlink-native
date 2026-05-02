import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface TabItem {
  key: string;
  label: string;
  iconName: string;
}

interface BottomNavBarProps {
  tabs: TabItem[];
  active: string;
  accentColor?: string;
}

export default function BottomNavBar({ tabs, active, accentColor = C.green }: BottomNavBarProps) {
  const router = useRouter();

  const handlePress = (key: string) => {
    router.push(key as any);
  };

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.06)',
      paddingBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 4,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              paddingVertical: 10,
              minHeight: 64,
            }}>
            <Ionicons
              name={tab.iconName as any}
              size={22}
              color={isActive ? accentColor : C.textLight}
            />
            <Text style={{
              fontSize: 10,
              fontWeight: isActive ? '700' : '400',
              color: isActive ? accentColor : C.textLight,
              letterSpacing: 0.2,
            }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Donor-specific tabs
export const DONOR_TABS: TabItem[] = [
  { key: '/donor/home', label: 'Home', iconName: 'home-outline' },
  { key: '/donor/listings', label: 'Listings', iconName: 'grid' },
  { key: '/donor/map', label: 'Map', iconName: 'map-outline' },
  { key: '/donor/notifications', label: 'Alerts', iconName: 'notifications-outline' },
  { key: '/donor/profile', label: 'Profile', iconName: 'person-outline' },
];

// Recipient-specific tabs
export const RECIPIENT_TABS: TabItem[] = [
  { key: '/recipient/home',        label: 'Home',      iconName: 'home-outline' },
  { key: '/recipient/my-claims',     label: 'My Claims', iconName: 'basket-outline' },
  { key: '/recipient/map',          label: 'Map',       iconName: 'map-outline' },
  { key: '/recipient/notifications', label: 'Alerts',    iconName: 'notifications-outline' },
  { key: '/recipient/profile',       label: 'Profile',   iconName: 'person-outline' },
];

// Guest-specific tabs (minimal)
export const GUEST_TABS: TabItem[] = [
  { key: '/guest/home', label: 'Home', iconName: 'home-outline' },
  { key: '/guest/listings', label: 'Listings', iconName: 'grid-outline' },
  { key: '/guest/profile', label: 'Profile', iconName: 'person-outline' },
];

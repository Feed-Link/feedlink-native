import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { C } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';

interface ListingCardProps {
  listing: any;
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionColor?: string;
}

export default function ListingCard({ listing, onPress, actionLabel, onAction, actionColor }: ListingCardProps) {
  const timeLeft = listing.expires_at ? (() => {
    const diff = new Date(listing.expires_at).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h left` : `${m}m left`;
  })() : null;

  const isUrgent = timeLeft && timeLeft.includes('m left');

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: C.surface,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Thumbnail */}
        <View style={{ width: 90, height: 90, backgroundColor: C.tagAmber, flexShrink: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          {listing.photos?.[0]
            ? <Image source={{ uri: listing.photos[0] }} style={{ width: 90, height: 90 }} resizeMode="cover" />
            : <MaterialCommunityIcons name="food" size={32} color="rgb(180,120,40)" />
          }
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark, marginBottom: 4 }} numberOfLines={1}>{listing.title}</Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={listing.status} />
              {timeLeft && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: isUrgent ? C.tagAmber : C.surface2, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 }}>
                  <MaterialCommunityIcons name="clock-outline" size={10} color={isUrgent ? C.amber : C.textMid} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isUrgent ? C.amber : C.textMid }}>{timeLeft}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="package-variant-closed" size={12} color={C.textLight} />
              <Text style={{ fontSize: 12, color: C.textLight }} numberOfLines={1}>{listing.quantity || '—'}</Text>
            </View>
            {listing.address && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <MaterialCommunityIcons name="map-marker-outline" size={12} color={C.textLight} />
                <Text style={{ fontSize: 11, color: C.textLight }} numberOfLines={1}>{listing.address.split(',')[0]}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Claims bar */}
      {listing.claims_count > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.surface2 }}>
          <MaterialCommunityIcons name="account-multiple-outline" size={13} color={C.green} />
          <Text style={{ fontSize: 12, color: C.green, fontWeight: '600' }}>{listing.claims_count} request{listing.claims_count > 1 ? 's' : ''} pending</Text>
        </View>
      )}

      {actionLabel && (
        <View style={{ padding: 10, paddingTop: 0 }}>
          <TouchableOpacity
            onPress={e => { onAction?.(); }}
            activeOpacity={0.85}
            style={{ backgroundColor: actionColor || C.green, paddingVertical: 9, borderRadius: 10, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

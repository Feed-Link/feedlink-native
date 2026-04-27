import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageStyle } from 'react-native';
import { C } from '../theme';
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
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })() : null;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.85}
      style={{ backgroundColor: C.surface, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 }}>
      {/* Thumbnail */}
      <View style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: C.tagAmber, flexShrink: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        {listing.photos?.[0]
          ? <Image source={{ uri: listing.photos[0] }} style={{ width: 72, height: 72, borderRadius: 14 } as ImageStyle} />
          : <Text style={{ fontSize: 28 }}>🌾</Text>
        }
      </View>
      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark, marginBottom: 5, lineHeight: 19.5 }} numberOfLines={2}>{listing.title}</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
          <StatusBadge status={listing.status} />
          {listing.distance_km != null && (
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.green, backgroundColor: C.tagGreen, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>{listing.distance_km.toFixed(1)} km</Text>
          )}
          {timeLeft && (
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.amber, backgroundColor: C.tagAmber, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>⏱ {timeLeft}</Text>
          )}
        </View>
        <Text style={{ fontSize: 12, color: C.textLight }}>{listing.quantity}</Text>
        {actionLabel && (
          <View style={{ marginTop: 8 }}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onAction?.(); }} activeOpacity={0.85}
              style={{ backgroundColor: actionColor || C.green, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{actionLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

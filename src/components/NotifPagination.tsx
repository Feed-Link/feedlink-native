import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { C } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NotifPaginationProps {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export default function NotifPagination({ page, lastPage, total, perPage, onChange }: NotifPaginationProps) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <View style={{ alignItems: 'center', paddingVertical: 20, paddingTop: 28 }}>
      {/* Page counter */}
      <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 14, fontWeight: '500' }}>
        {from}–{to} of {total}
      </Text>

      {/* Prev/Next buttons */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity
          disabled={page === 1}
          onPress={() => onChange(page - 1)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: page === 1 ? C.surface2 : C.surface,
            borderWidth: 1,
            borderColor: page === 1 ? C.border : C.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={page === 1 ? C.textLight : C.textDark}
          />
        </TouchableOpacity>

        {/* Page indicator */}
        <View style={{ minWidth: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.textDark }}>
            {page} of {lastPage}
          </Text>
        </View>

        <TouchableOpacity
          disabled={page === lastPage}
          onPress={() => onChange(page + 1)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: page === lastPage ? C.surface2 : C.surface,
            borderWidth: 1,
            borderColor: page === lastPage ? C.border : C.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={page === lastPage ? C.textLight : C.textDark}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

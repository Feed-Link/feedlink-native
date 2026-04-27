import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { C } from '../theme';
import Btn from './Btn';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger }: ConfirmModalProps) {
  return (
    <View style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 200,
      alignItems: 'center',
      justifyContent: 'flex-end',
    }}>
      <View style={{
        backgroundColor: C.surface,
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 48,
      }}>
        <Text style={{ fontWeight: '700', fontSize: 17, color: C.textDark, marginBottom: 8 }}>{title}</Text>
        <Text style={{ fontSize: 14, color: C.textMid, marginBottom: 24 }}>{message}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn
            variant="outline"
            fullWidth
            onPress={onCancel}
            style={{ flex: 1 }}
          >
            Cancel
          </Btn>
          <Btn
            fullWidth
            onPress={onConfirm}
            style={{
              flex: 1,
              backgroundColor: danger ? C.red : C.green,
              borderWidth: danger ? 0 : undefined,
            }}
          >
            {confirmLabel}
          </Btn>
        </View>
      </View>
    </View>
  );
}

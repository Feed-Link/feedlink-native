import { View, Text } from 'react-native';
import { C } from '../../src/theme';

export default function DonorHome() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: C.textDark }}>Donor Home — Coming Next</Text>
    </View>
  );
}

import { StyleSheet, View } from 'react-native';
import ModelAR3D from '@/components/ModelAR3D';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ModelAR3D />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

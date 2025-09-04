import { StyleSheet, View } from 'react-native';
import ModernARInterface from '@/components/ModernARInterface';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ModernARInterface />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

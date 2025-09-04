import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

const ARStatusBar = ({
  isARActive,
  isLoading,
  objectCount,
  selectedObjectType,
  objectTypes,
  physicsEnabled
}) => {
  const selectedObject = objectTypes?.find(obj => obj.name === selectedObjectType);
  
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.content}>
          {/* Main Status */}
          <View style={styles.mainStatus}>
            <Text style={styles.title}>🎯 AR Studio</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: isARActive ? '#00FF88' : '#FF6B6B' }
                ]} />
                <Text style={styles.statusText}>
                  {isLoading ? 'Initializing...' : isARActive ? 'Active' : 'Standby'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{objectCount}</Text>
              <Text style={styles.statLabel}>Objects</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.stat}>
              <Text style={styles.statEmoji}>
                {selectedObject?.emoji || '🟦'}
              </Text>
              <Text style={styles.statLabel}>
                {selectedObjectType || 'None'}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.stat}>
              <Text style={styles.statEmoji}>
                {physicsEnabled ? '⚡' : '💫'}
              </Text>
              <Text style={styles.statLabel}>
                {physicsEnabled ? 'Physics' : 'Float'}
              </Text>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 20,
  },
  mainStatus: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00FF88',
    marginBottom: 2,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
});

export default ARStatusBar;

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ARSettings = ({
  lightingMode,
  onToggleLighting,
  showControls,
  onToggleControls
}) => {
  return (
    <View style={styles.container}>
      {/* Lighting Toggle */}
      <TouchableOpacity
        style={[styles.settingButton, styles.lightingButton]}
        onPress={onToggleLighting}
        activeOpacity={0.8}
      >
        <Text style={styles.settingIcon}>
          {lightingMode === 'dynamic' ? '🌈' : '💡'}
        </Text>
        <Text style={styles.settingText}>
          {lightingMode === 'dynamic' ? 'Dynamic' : 'Simple'}
        </Text>
      </TouchableOpacity>

      {/* Controls Toggle */}
      <TouchableOpacity
        style={[styles.settingButton, styles.toggleButton]}
        onPress={onToggleControls}
        activeOpacity={0.8}
      >
        <Text style={styles.settingIcon}>
          {showControls ? '🔽' : '🔼'}
        </Text>
        <Text style={styles.settingText}>
          {showControls ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 280,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 12,
  },
  settingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lightingButton: {
    shadowColor: '#FFA500',
  },
  toggleButton: {
    shadowColor: '#FFFFFF',
  },
  settingIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  settingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ARSettings;

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

const ARControls = ({
  showControls,
  selectedObjectType,
  objectCount,
  physicsEnabled,
  onAddObject,
  onTogglePhysics,
  onClearAll
}) => {
  if (!showControls) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={70} tint="dark" style={styles.blurContainer}>
        <View style={styles.controlsRow}>
          {/* Add Object Button */}
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={onAddObject}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>➕</Text>
            <Text style={styles.buttonText}>Add {selectedObjectType}</Text>
          </TouchableOpacity>

          {/* Physics Toggle Button */}
          <TouchableOpacity
            style={[styles.button, styles.physicsButton]}
            onPress={onTogglePhysics}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>
              {physicsEnabled ? '⚡' : '💫'}
            </Text>
            <Text style={styles.buttonText}>
              {physicsEnabled ? 'Physics' : 'Float'}
            </Text>
          </TouchableOpacity>

          {/* Clear All Button */}
          <TouchableOpacity
            style={[
              styles.button, 
              styles.clearButton,
              objectCount === 0 && styles.disabledButton
            ]}
            onPress={onClearAll}
            disabled={objectCount === 0}
            activeOpacity={objectCount === 0 ? 1 : 0.8}
          >
            <Text style={[
              styles.buttonIcon,
              objectCount === 0 && styles.disabledIcon
            ]}>
              🗑️
            </Text>
            <Text style={[
              styles.buttonText,
              objectCount === 0 && styles.disabledText
            ]}>
              Clear ({objectCount})
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    zIndex: 15,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 90,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButton: {
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
  },
  physicsButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ARControls;

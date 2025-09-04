import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

const ObjectSelector = ({
  objectTypes,
  selectedObjectType,
  onSelectType,
  showControls
}) => {
  if (!showControls) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Select Object</Text>
          <View style={styles.objectGrid}>
            {objectTypes.map((type) => (
              <TouchableOpacity
                key={type.name}
                style={[
                  styles.objectButton,
                  selectedObjectType === type.name && styles.selectedButton,
                ]}
                onPress={() => onSelectType(type.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.objectEmoji}>{type.emoji}</Text>
                <Text style={[
                  styles.objectLabel,
                  selectedObjectType === type.name && styles.selectedLabel
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 180,
    left: 20,
    right: 20,
    zIndex: 15,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  objectGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  objectButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  selectedButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  objectEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  objectLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedLabel: {
    color: '#00FF88',
    fontWeight: '600',
  },
});

export default ObjectSelector;

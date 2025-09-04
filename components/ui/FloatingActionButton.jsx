import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

const FloatingActionButton = ({ 
  onPress, 
  icon = '✨', 
  color = '#007AFF',
  position = 'bottom-right',
  size = 'medium' 
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getPositionStyle = () => {
    const base = { position: 'absolute', zIndex: 20 };
    
    switch (position) {
      case 'bottom-right':
        return { ...base, bottom: 40, right: 20 };
      case 'bottom-left':
        return { ...base, bottom: 40, left: 20 };
      case 'top-right':
        return { ...base, top: 100, right: 20 };
      case 'top-left':
        return { ...base, top: 100, left: 20 };
      default:
        return { ...base, bottom: 40, right: 20 };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 50, height: 50, borderRadius: 25 };
      case 'large':
        return { width: 70, height: 70, borderRadius: 35 };
      default:
        return { width: 60, height: 60, borderRadius: 30 };
    }
  };

  return (
    <Animated.View
      style={[
        getPositionStyle(),
        {
          transform: [
            { scale: Animated.multiply(scaleValue, pulseValue) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.fab,
          getSizeStyle(),
          { backgroundColor: color, shadowColor: color }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Text style={[styles.fabIcon, { fontSize: size === 'small' ? 20 : size === 'large' ? 28 : 24 }]}>
          {icon}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  fabIcon: {
    color: '#FFFFFF',
  },
});

export default FloatingActionButton;

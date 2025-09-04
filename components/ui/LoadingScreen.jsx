import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LoadingScreen = ({ message = "Loading AR Environment..." }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Breathing scale animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.gradientBackground} />
      
      {/* Main loading animation */}
      <Animated.View
        style={[
          styles.loadingCircle,
          {
            transform: [
              { rotate: spin },
              { scale: scaleValue }
            ]
          }
        ]}
      >
        <View style={styles.innerCircle}>
          <Animated.Text 
            style={[
              styles.loadingEmoji,
              { transform: [{ scale: pulseValue }] }
            ]}
          >
            🎯
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Loading text */}
      <Text style={styles.loadingMessage}>{message}</Text>
      
      {/* Progress dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <LoadingDot key={index} delay={index * 200} />
        ))}
      </View>
    </View>
  );
};

const LoadingDot = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => animation.start(), delay);
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [delay]);

  return (
    <Animated.View style={[styles.dot, { opacity }]} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 40,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    opacity: 0.9,
  },
  loadingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderTopColor: '#00FF88',
    borderRightColor: '#FF6B6B',
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingEmoji: {
    fontSize: 32,
  },
  loadingMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
});

export default LoadingScreen;

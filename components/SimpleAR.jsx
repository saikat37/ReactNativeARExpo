import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';

const SimpleAR = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [objectCount, setObjectCount] = useState(0);
  const [isARActive, setIsARActive] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') {
        setTimeout(() => setIsARActive(true), 1000);
      }
    })();
  }, []);

  const addObject = () => {
    setObjectCount(prev => prev + 1);
  };

  const clearAll = () => {
    setObjectCount(0);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access denied</Text>
        <Text style={styles.subText}>Please enable camera permissions for AR</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} facing="back">
        {/* AR Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>🚀 Expo AR System</Text>
          <Text style={styles.statusText}>
            Status: {isARActive ? '🟢 Active' : '🟡 Loading...'}
          </Text>
          <Text style={styles.objectCount}>
            Virtual Objects: {objectCount}
          </Text>
        </View>

        {/* Virtual Object Indicators */}
        {Array.from({ length: objectCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.virtualObject,
              {
                top: 200 + (index % 3) * 80,
                left: 100 + (index % 4) * 80,
              }
            ]}
          >
            <Text style={styles.objectEmoji}>
              {['🟦', '🟢', '🔴', '🟡', '🟣'][index % 5]}
            </Text>
          </View>
        ))}

        {/* Control Panel */}
        <View style={styles.controlPanel}>
          <TouchableOpacity style={styles.addButton} onPress={addObject}>
            <Text style={styles.buttonText}>➕ Add Object</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.clearButton, objectCount === 0 && styles.disabledButton]} 
            onPress={clearAll}
            disabled={objectCount === 0}
          >
            <Text style={[styles.buttonText, objectCount === 0 && styles.disabledText]}>
              🗑️ Clear ({objectCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>✨ Simple AR Demo</Text>
          <Text style={styles.instructionText}>
            Tap "Add Object" to place virtual items in your AR space!
          </Text>
          <Text style={styles.instructionSubtext}>
            Camera feed + Virtual overlay = AR Magic! 🎯
          </Text>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginTop: 100,
  },
  subText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
  },
  statusPanel: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  objectCount: {
    fontSize: 16,
    color: '#ffaa00',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  virtualObject: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  objectEmoji: {
    fontSize: 30,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  addButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 140,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 140,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: '#ccc',
  },
  instructions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    padding: 15,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionSubtext: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default SimpleAR;

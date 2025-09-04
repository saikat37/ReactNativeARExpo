import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const WorkingAR = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [objectCount, setObjectCount] = useState(0);
  const [isARActive, setIsARActive] = useState(false);

  useEffect(() => {
    if (permission?.granted) {
      setTimeout(() => setIsARActive(true), 1000);
    }
  }, [permission]);

  const addObject = () => {
    setObjectCount(prev => prev + 1);
  };

  const clearAll = () => {
    setObjectCount(0);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required for AR</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        {/* AR Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>🚀 AR Camera Active!</Text>
          <Text style={styles.statusText}>
            Status: {isARActive ? '🟢 AR Ready' : '🟡 Initializing...'}
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
          <Text style={styles.instructionTitle}>✨ AR Camera Demo</Text>
          <Text style={styles.instructionText}>
            Live camera feed + Virtual objects = AR Magic!
          </Text>
          <Text style={styles.instructionSubtext}>
            📱 Point camera around while adding objects
          </Text>
        </View>
      </CameraView>
    </View>
  );
};

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
  permissionButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    fontStyle: 'italic',
  },
});

export default WorkingAR;

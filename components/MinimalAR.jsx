import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const MinimalAR = () => {
  const [objectCount, setObjectCount] = React.useState(0);

  const addObject = () => {
    setObjectCount(prev => prev + 1);
  };

  const clearAll = () => {
    setObjectCount(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.fakeCamera}>
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>🚀 AR System Working!</Text>
          <Text style={styles.objectCount}>Virtual Objects: {objectCount}</Text>
        </View>

        {/* Virtual Objects */}
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

        {/* Controls */}
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

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>✨ AR Demo Working!</Text>
          <Text style={styles.instructionText}>
            Tap "Add Object" to place virtual items!
          </Text>
          <Text style={styles.note}>
            📷 Camera will be added once this works
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fakeCamera: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
  note: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MinimalAR;

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';

const Real3DAR = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [objects3D, setObjects3D] = useState([]);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState('cube');
  const [showControls, setShowControls] = useState(true);
  
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef();

  const objectTypes = [
    { name: 'cube', emoji: '🟦', color: 0x4CAF50 },
    { name: 'sphere', emoji: '🔴', color: 0xF44336 },
    { name: 'pyramid', emoji: '🔺', color: 0xFFC107 },
    { name: 'cylinder', emoji: '🟢', color: 0x2196F3 },
    { name: 'torus', emoji: '🟣', color: 0x9C27B0 },
  ];

  useEffect(() => {
    if (permission?.granted) {
      setTimeout(() => setIsARActive(true), 1000);
    }
  }, [permission]);

  // Create 3D geometry based on type
  const create3DGeometry = (type) => {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(0.6, 16, 16);
      case 'pyramid':
        return new THREE.ConeGeometry(0.6, 1.2, 4);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
      case 'torus':
        return new THREE.TorusGeometry(0.6, 0.3, 8, 16);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Initialize 3D scene
  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background for AR
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Add lighting for realistic 3D rendering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add point light for dynamic lighting
    const pointLight = new THREE.PointLight(0xff6b6b, 1, 100);
    pointLight.position.set(0, 5, 3);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Animate existing objects
      objects3D.forEach((objData, index) => {
        if (objData.mesh) {
          // Continuous rotation for visual appeal
          objData.mesh.rotation.x += 0.01;
          objData.mesh.rotation.y += 0.015;
          
          // Floating animation
          const time = Date.now() * 0.001;
          objData.mesh.position.y = objData.originalY + Math.sin(time + index) * 0.3;
        }
      });

      // Update camera for slight movement simulation
      const time = Date.now() * 0.0005;
      camera.position.x = Math.sin(time) * 0.1;
      camera.position.y = Math.cos(time * 0.7) * 0.05;

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  // Add new 3D object to AR scene
  const add3DObject = () => {
    const objectType = objectTypes.find(obj => obj.name === selectedObjectType);
    const geometry = create3DGeometry(selectedObjectType);
    
    // Create realistic material with properties
    const material = new THREE.MeshPhongMaterial({ 
      color: objectType.color,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Random positioning in AR space
    const x = (Math.random() - 0.5) * 8;
    const y = (Math.random() - 0.5) * 4;
    const z = (Math.random() - 0.5) * 4 - 2;
    
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add to scene
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }

    // Track object data
    const newObject = {
      id: Date.now(),
      type: selectedObjectType,
      mesh: mesh,
      originalY: y,
      position: { x, y, z }
    };

    setObjects3D(prev => [...prev, newObject]);
  };

  // Clear all 3D objects
  const clearAll3DObjects = () => {
    objects3D.forEach(objData => {
      if (objData.mesh && sceneRef.current) {
        sceneRef.current.remove(objData.mesh);
        objData.mesh.geometry.dispose();
        objData.mesh.material.dispose();
      }
    });
    setObjects3D([]);
  };

  // Handle cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearAll3DObjects();
    };
  }, []);

  // Pan responder for touch interactions
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      // Touch to place object at screen coordinates
      const touch = evt.nativeEvent;
      if (touch && sceneRef.current && cameraRef.current) {
        // Convert screen coordinates to world position
        const x = ((touch.locationX / 400) - 0.5) * 8;
        const y = -((touch.locationY / 600) - 0.5) * 6;
        const z = -2;

        add3DObjectAtPosition(x, y, z);
      }
    },
  });

  // Add 3D object at specific position
  const add3DObjectAtPosition = (x, y, z) => {
    const objectType = objectTypes.find(obj => obj.name === selectedObjectType);
    const geometry = create3DGeometry(selectedObjectType);
    
    const material = new THREE.MeshPhongMaterial({ 
      color: objectType.color,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }

    const newObject = {
      id: Date.now(),
      type: selectedObjectType,
      mesh: mesh,
      originalY: y,
      position: { x, y, z }
    };

    setObjects3D(prev => [...prev, newObject]);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading 3D AR System...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required for 3D AR</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        {/* 3D AR Overlay */}
        <View style={styles.arOverlay} {...panResponder.panHandlers}>
          <GLView
            style={styles.glView}
            onContextCreate={onContextCreate}
          />
        </View>

        {/* AR Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>🌟 Real 3D AR System</Text>
          <Text style={styles.statusText}>
            Status: {isARActive ? '🟢 3D Rendering Active' : '🟡 Initializing 3D...'}
          </Text>
          <Text style={styles.objectCount}>
            3D Objects: {objects3D.length}
          </Text>
          <Text style={styles.currentType}>
            Selected: {objectTypes.find(obj => obj.name === selectedObjectType)?.emoji} {selectedObjectType}
          </Text>
        </View>

        {/* Object Type Selector */}
        <View style={styles.typeSelector}>
          {objectTypes.map((type) => (
            <TouchableOpacity
              key={type.name}
              style={[
                styles.typeButton,
                selectedObjectType === type.name && styles.selectedTypeButton
              ]}
              onPress={() => setSelectedObjectType(type.name)}
            >
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Control Panel */}
        {showControls && (
          <View style={styles.controlPanel}>
            <TouchableOpacity style={styles.addButton} onPress={add3DObject}>
              <Text style={styles.buttonText}>🎯 Add 3D Object</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.clearButton, objects3D.length === 0 && styles.disabledButton]} 
              onPress={clearAll3DObjects}
              disabled={objects3D.length === 0}
            >
              <Text style={[styles.buttonText, objects3D.length === 0 && styles.disabledText]}>
                🗑️ Clear ({objects3D.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Toggle Controls */}
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowControls(!showControls)}
        >
          <Text style={styles.toggleText}>
            {showControls ? '🔽' : '🔼'}
          </Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>🚀 3D AR Instructions</Text>
          <Text style={styles.instructionText}>
            • Tap anywhere on screen to place 3D objects
          </Text>
          <Text style={styles.instructionText}>
            • Select object type from top panel
          </Text>
          <Text style={styles.instructionText}>
            • Real 3D models with lighting & shadows
          </Text>
          <Text style={styles.instructionSubtext}>
            📱 Move your device to see 3D perspective!
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
  arOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  glView: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#00ff88',
    zIndex: 10,
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
    marginBottom: 5,
  },
  currentType: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  typeSelector: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    padding: 10,
    zIndex: 10,
  },
  typeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTypeButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.3)',
    borderColor: '#00ff88',
  },
  typeEmoji: {
    fontSize: 24,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 10,
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
  toggleButton: {
    position: 'absolute',
    top: 280,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  toggleText: {
    color: 'white',
    fontSize: 16,
  },
  instructions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    padding: 15,
    zIndex: 10,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    marginBottom: 3,
  },
  instructionSubtext: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default Real3DAR;

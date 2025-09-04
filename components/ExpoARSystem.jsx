import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer, Scene, PerspectiveCamera, BoxGeometry, SphereGeometry, CylinderGeometry, MeshBasicMaterial, Mesh, AmbientLight, DirectionalLight } from 'expo-three';
import * as THREE from 'three';

const { width, height } = Dimensions.get('window');

export default function ExpoARSystem() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [currentObjectType, setCurrentObjectType] = useState('cube');
  const glRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const objectsRef = useRef([]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onContextCreate = async (gl) => {
    try {
      // Create renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Transparent background for AR
      rendererRef.current = renderer;

      // Create scene
      const scene = new Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // Add lights
      const ambientLight = new AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Start render loop
      const render = () => {
        requestAnimationFrame(render);
        
        // Animate objects
        objectsRef.current.forEach((obj, index) => {
          if (obj.userData.animate) {
            obj.rotation.y += 0.01;
            obj.rotation.x += 0.005;
          }
          
          // Add floating animation
          obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
        });

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      render();
      
      setIsARActive(true);
    } catch (error) {
      console.error('AR initialization failed:', error);
    }
  };

  const addObject = () => {
    if (!sceneRef.current) return;

    let geometry, material, object;
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    material = new MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.8
    });

    // Create different object types
    switch(currentObjectType) {
      case 'sphere':
        geometry = new SphereGeometry(0.3, 16, 16);
        break;
      case 'cylinder':
        geometry = new CylinderGeometry(0.2, 0.2, 0.6, 16);
        break;
      case 'cube':
      default:
        geometry = new BoxGeometry(0.5, 0.5, 0.5);
        break;
    }

    object = new Mesh(geometry, material);
    
    // Random position
    object.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    
    // Random rotation
    object.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // Add animation flag
    object.userData = { 
      animate: Math.random() > 0.5,
      type: currentObjectType,
      createdAt: Date.now()
    };

    sceneRef.current.add(object);
    objectsRef.current.push(object);
    setObjectCount(prev => prev + 1);

    // Cycle through object types
    const types = ['cube', 'sphere', 'cylinder'];
    const currentIndex = types.indexOf(currentObjectType);
    const nextIndex = (currentIndex + 1) % types.length;
    setCurrentObjectType(types[nextIndex]);
  };

  const clearAllObjects = () => {
    if (!sceneRef.current) return;

    objectsRef.current.forEach(obj => {
      sceneRef.current.remove(obj);
      obj.geometry.dispose();
      obj.material.dispose();
    });
    
    objectsRef.current = [];
    setObjectCount(0);
  };

  const removeLastObject = () => {
    if (!sceneRef.current || objectsRef.current.length === 0) return;

    const lastObject = objectsRef.current.pop();
    sceneRef.current.remove(lastObject);
    lastObject.geometry.dispose();
    lastObject.material.dispose();
    setObjectCount(prev => prev - 1);
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
        <Text style={styles.text}>No access to camera</Text>
        <Text style={styles.subText}>Please grant camera permissions to use AR features</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Background */}
      <Camera
        style={styles.camera}
        facing="back"
        ratio="16:9"
      >
        {/* 3D AR Overlay */}
        <GLView
          style={styles.glView}
          onContextCreate={onContextCreate}
          ref={glRef}
        />
        
        {/* AR Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            AR {isARActive ? 'Active' : 'Initializing...'}
          </Text>
          <Text style={styles.infoText}>
            Objects: {objectCount} | Next: {currentObjectType}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.addButton]}
            onPress={addObject}
          >
            <Text style={styles.buttonText}>Add {currentObjectType}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.removeButton]}
            onPress={removeLastObject}
            disabled={objectCount === 0}
          >
            <Text style={[styles.buttonText, objectCount === 0 && styles.disabledText]}>
              Remove Last
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.clearButton]}
            onPress={clearAllObjects}
            disabled={objectCount === 0}
          >
            <Text style={[styles.buttonText, objectCount === 0 && styles.disabledText]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            🎯 Tap "Add" to place 3D objects in your AR space
          </Text>
          <Text style={styles.instructionsSubText}>
            Objects will animate and float in 3D space
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
  glView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  subText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  statusContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
  },
  statusText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
  },
  addButton: {
    backgroundColor: 'rgba(40, 167, 69, 0.8)',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
  },
  clearButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: '#ccc',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
  },
  instructionsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  instructionsSubText: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});

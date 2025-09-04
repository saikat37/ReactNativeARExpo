import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Advanced3DAR = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [objects3D, setObjects3D] = useState([]);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState('cube');
  const [showControls, setShowControls] = useState(true);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [lightingMode, setLightingMode] = useState('dynamic');
  
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });

  const objectTypes = [
    { 
      name: 'cube', 
      emoji: '🟦', 
      color: 0x4CAF50,
      physics: { mass: 1, bounce: 0.8 }
    },
    { 
      name: 'sphere', 
      emoji: '🔴', 
      color: 0xF44336,
      physics: { mass: 0.8, bounce: 0.9 }
    },
    { 
      name: 'pyramid', 
      emoji: '🔺', 
      color: 0xFFC107,
      physics: { mass: 1.2, bounce: 0.6 }
    },
    { 
      name: 'cylinder', 
      emoji: '🟢', 
      color: 0x2196F3,
      physics: { mass: 1.1, bounce: 0.7 }
    },
    { 
      name: 'torus', 
      emoji: '🟣', 
      color: 0x9C27B0,
      physics: { mass: 0.9, bounce: 0.8 }
    },
    { 
      name: 'diamond', 
      emoji: '💎', 
      color: 0x00BCD4,
      physics: { mass: 2.0, bounce: 1.0 }
    },
  ];

  useEffect(() => {
    if (permission?.granted) {
      setTimeout(() => setIsARActive(true), 1000);
    }
  }, [permission]);

  // Create 3D geometry with enhanced details
  const create3DGeometry = (type) => {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
      case 'sphere':
        return new THREE.SphereGeometry(0.6, 32, 32);
      case 'pyramid':
        return new THREE.ConeGeometry(0.6, 1.2, 8);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
      case 'torus':
        return new THREE.TorusGeometry(0.6, 0.3, 16, 32);
      case 'diamond':
        return new THREE.OctahedronGeometry(0.8, 0);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Create advanced material with realistic properties
  const createAdvancedMaterial = (type, color) => {
    const objectType = objectTypes.find(obj => obj.name === type);
    
    switch (type) {
      case 'diamond':
        return new THREE.MeshPhysicalMaterial({
          color: color,
          metalness: 0.1,
          roughness: 0.1,
          transmission: 0.9,
          thickness: 0.5,
          transparent: true,
          opacity: 0.8,
        });
      case 'sphere':
        return new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.3,
          roughness: 0.4,
          transparent: true,
          opacity: 0.9,
        });
      default:
        return new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 100,
          transparent: true,
          opacity: 0.9,
          specular: 0x222222,
        });
    }
  };

  // Initialize enhanced 3D scene
  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    
    // Initialize renderer with better settings
    const renderer = new Renderer({ 
      gl,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    // Initialize scene with fog for depth
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Enhanced lighting system
    const setupLighting = () => {
      // Clear existing lights
      const lights = scene.children.filter(child => child.isLight);
      lights.forEach(light => scene.remove(light));

      if (lightingMode === 'dynamic') {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(10, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        scene.add(mainLight);

        // Colored point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0xff6b6b, 0.8, 100);
        pointLight1.position.set(-5, 5, 3);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x6b6bff, 0.6, 100);
        pointLight2.position.set(5, -3, 3);
        scene.add(pointLight2);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5);
        rimLight.position.set(-10, -10, -5);
        scene.add(rimLight);
      } else {
        // Simple lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
      }
    };

    setupLighting();

    // Add invisible ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop with physics simulation
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Animate existing objects with physics
      objects3D.forEach((objData, index) => {
        if (objData.mesh && physicsEnabled) {
          // Simulate physics
          objData.velocity.y -= 0.01; // Gravity
          objData.mesh.position.add(objData.velocity);
          
          // Bounce off ground
          if (objData.mesh.position.y < -2.5) {
            objData.mesh.position.y = -2.5;
            objData.velocity.y *= -objData.physics.bounce;
            objData.velocity.x *= 0.95; // Friction
            objData.velocity.z *= 0.95;
          }
          
          // Continuous rotation
          objData.mesh.rotation.x += objData.rotationSpeed.x;
          objData.mesh.rotation.y += objData.rotationSpeed.y;
          objData.mesh.rotation.z += objData.rotationSpeed.z;
        } else if (objData.mesh && !physicsEnabled) {
          // Simple floating animation
          objData.mesh.rotation.x += 0.01;
          objData.mesh.rotation.y += 0.015;
          objData.mesh.position.y = objData.originalY + Math.sin(time + index) * 0.3;
        }
      });

      // Dynamic camera movement
      if (lightingMode === 'dynamic') {
        camera.position.x = Math.sin(time * 0.3) * 0.5;
        camera.position.y = 2 + Math.cos(time * 0.2) * 0.3;
        camera.lookAt(0, 0, 0);
      }

      // Dynamic lighting effects
      if (lightingMode === 'dynamic') {
        const pointLights = scene.children.filter(child => 
          child.isLight && child.type === 'PointLight'
        );
        pointLights.forEach((light, index) => {
          light.position.x = Math.sin(time + index * 2) * 8;
          light.position.z = Math.cos(time + index * 2) * 8;
        });
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  // Add 3D object with physics properties
  const add3DObject = () => {
    const objectType = objectTypes.find(obj => obj.name === selectedObjectType);
    const geometry = create3DGeometry(selectedObjectType);
    const material = createAdvancedMaterial(selectedObjectType, objectType.color);

    const mesh = new THREE.Mesh(geometry, material);
    
    // Random positioning
    const x = (Math.random() - 0.5) * 6;
    const y = Math.random() * 3 + 2;
    const z = (Math.random() - 0.5) * 4;
    
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }

    // Physics properties
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      0,
      (Math.random() - 0.5) * 0.1
    );

    const rotationSpeed = {
      x: (Math.random() - 0.5) * 0.03,
      y: (Math.random() - 0.5) * 0.03,
      z: (Math.random() - 0.5) * 0.03,
    };

    const newObject = {
      id: Date.now(),
      type: selectedObjectType,
      mesh: mesh,
      originalY: y,
      position: { x, y, z },
      velocity: velocity,
      rotationSpeed: rotationSpeed,
      physics: objectType.physics,
    };

    setObjects3D(prev => [...prev, newObject]);
  };

  // Touch to place object
  const handleTouchPlace = (evt) => {
    if (!sceneRef.current || !cameraRef.current) return;

    const touch = evt.nativeEvent;
    
    // Convert screen coordinates to world position
    const normalizedX = (touch.locationX / screenWidth) * 2 - 1;
    const normalizedY = -(touch.locationY / screenHeight) * 2 + 1;

    // Create raycaster for precise positioning
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(normalizedX, normalizedY);
    
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    // Place object at ray intersection point
    const direction = raycaster.ray.direction;
    const distance = 5;
    const worldPosition = new THREE.Vector3();
    worldPosition.copy(cameraRef.current.position).add(direction.multiplyScalar(distance));

    add3DObjectAtPosition(worldPosition.x, worldPosition.y, worldPosition.z);
  };

  // Add 3D object at specific world position
  const add3DObjectAtPosition = (x, y, z) => {
    const objectType = objectTypes.find(obj => obj.name === selectedObjectType);
    const geometry = create3DGeometry(selectedObjectType);
    const material = createAdvancedMaterial(selectedObjectType, objectType.color);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add wireframe for enhanced 3D effect
    const wireframe = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      opacity: 0.2, 
      transparent: true 
    });
    const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
    mesh.add(wireframeMesh);
    
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }

    // Physics properties
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      Math.random() * 0.1,
      (Math.random() - 0.5) * 0.2
    );

    const rotationSpeed = {
      x: (Math.random() - 0.5) * 0.04,
      y: (Math.random() - 0.5) * 0.04,
      z: (Math.random() - 0.5) * 0.04,
    };

    const newObject = {
      id: Date.now(),
      type: selectedObjectType,
      mesh: mesh,
      originalY: y,
      position: { x, y, z },
      velocity: velocity,
      rotationSpeed: rotationSpeed,
      physics: objectType.physics,
    };

    setObjects3D(prev => [...prev, newObject]);
  };

  // Clear all 3D objects with animation
  const clearAll3DObjects = () => {
    objects3D.forEach((objData, index) => {
      if (objData.mesh && sceneRef.current) {
        // Animate removal
        const fadeOut = () => {
          objData.mesh.material.opacity -= 0.05;
          objData.mesh.scale.multiplyScalar(0.95);
          
          if (objData.mesh.material.opacity <= 0) {
            sceneRef.current.remove(objData.mesh);
            objData.mesh.geometry.dispose();
            objData.mesh.material.dispose();
          } else {
            setTimeout(fadeOut, 50);
          }
        };
        
        setTimeout(() => fadeOut(), index * 100);
      }
    });
    setObjects3D([]);
  };

  // Create explosion effect
  const createExplosion = () => {
    if (!sceneRef.current) return;

    for (let i = 0; i < 20; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        transparent: true,
        opacity: 0.8,
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      );
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 0.5
      );
      
      sceneRef.current.add(particle);
      
      // Animate particle
      const animateParticle = () => {
        particle.position.add(velocity);
        velocity.multiplyScalar(0.98);
        particle.material.opacity *= 0.98;
        
        if (particle.material.opacity > 0.01) {
          requestAnimationFrame(animateParticle);
        } else {
          sceneRef.current.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
        }
      };
      
      setTimeout(() => animateParticle(), i * 50);
    }
  };

  // Handle cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      objects3D.forEach(objData => {
        if (objData.mesh && sceneRef.current) {
          sceneRef.current.remove(objData.mesh);
          objData.mesh.geometry.dispose();
          objData.mesh.material.dispose();
        }
      });
    };
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading Advanced 3D AR System...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required for Advanced 3D AR</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        {/* 3D AR Overlay with Touch */}
        <TouchableOpacity
          style={styles.arOverlay}
          activeOpacity={1}
          onPress={handleTouchPlace}
        >
          <GLView
            style={styles.glView}
            onContextCreate={onContextCreate}
          />
        </TouchableOpacity>

        {/* Enhanced Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>🌟 Advanced 3D AR</Text>
          <Text style={styles.statusText}>
            Status: {isARActive ? '🟢 Full 3D Rendering' : '🟡 Initializing...'}
          </Text>
          <Text style={styles.objectCount}>
            3D Objects: {objects3D.length}
          </Text>
          <Text style={styles.currentType}>
            Selected: {objectTypes.find(obj => obj.name === selectedObjectType)?.emoji} {selectedObjectType}
          </Text>
          <Text style={styles.physicsStatus}>
            Physics: {physicsEnabled ? '🟢 ON' : '🔴 OFF'}
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

        {/* Advanced Control Panel */}
        {showControls && (
          <View style={styles.controlPanel}>
            <TouchableOpacity style={styles.addButton} onPress={add3DObject}>
              <Text style={styles.buttonText}>🎯 Add 3D</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.physicsButton}
              onPress={() => setPhysicsEnabled(!physicsEnabled)}
            >
              <Text style={styles.buttonText}>
                {physicsEnabled ? '🌊 Physics' : '⭐ Float'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.explosionButton} onPress={createExplosion}>
              <Text style={styles.buttonText}>💥 Explode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.clearButton, objects3D.length === 0 && styles.disabledButton]} 
              onPress={clearAll3DObjects}
              disabled={objects3D.length === 0}
            >
              <Text style={[styles.buttonText, objects3D.length === 0 && styles.disabledText]}>
                🗑️ Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Panel */}
        <View style={styles.settingsPanel}>
          <TouchableOpacity 
            style={styles.lightingButton}
            onPress={() => setLightingMode(lightingMode === 'dynamic' ? 'simple' : 'dynamic')}
          >
            <Text style={styles.smallButtonText}>
              {lightingMode === 'dynamic' ? '🌈 Dynamic' : '💡 Simple'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Controls */}
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowControls(!showControls)}
        >
          <Text style={styles.toggleText}>
            {showControls ? '🔽' : '🔼'}
          </Text>
        </TouchableOpacity>

        {/* Enhanced Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>🚀 Advanced 3D AR</Text>
          <Text style={styles.instructionText}>
            • Tap screen to place realistic 3D objects
          </Text>
          <Text style={styles.instructionText}>
            • Toggle physics for gravity simulation
          </Text>
          <Text style={styles.instructionText}>
            • Dynamic lighting & shadow effects
          </Text>
          <Text style={styles.instructionSubtext}>
            📱 Real 3D models with depth & perspective!
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    marginBottom: 5,
  },
  physicsStatus: {
    fontSize: 12,
    color: '#00bcd4',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  typeSelector: {
    position: 'absolute',
    top: 220,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 25,
    padding: 8,
    zIndex: 10,
  },
  typeButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 20,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 120,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 10,
  },
  addButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
  },
  physicsButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
  },
  explosionButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: '#ccc',
  },
  settingsPanel: {
    position: 'absolute',
    top: 290,
    left: 20,
    zIndex: 10,
  },
  lightingButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#666',
  },
  toggleButton: {
    position: 'absolute',
    top: 290,
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginBottom: 2,
  },
  instructionSubtext: {
    fontSize: 11,
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default Advanced3DAR;

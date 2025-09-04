import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { BlurView } from 'expo-blur';

// Components
import ARStatusBar from './ui/ARStatusBar';
import ObjectSelector from './ui/ObjectSelector';
import ARControls from './ui/ARControls';
import ARSettings from './ui/ARSettings';
import LoadingScreen from './ui/LoadingScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ModernARInterface = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [objects3D, setObjects3D] = useState([]);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState('cube');
  const [showControls, setShowControls] = useState(true);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [lightingMode, setLightingMode] = useState('dynamic');
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  
  // 3D refs
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef();

  const objectTypes = [
    {
      name: 'cube',
      emoji: '🟦',
      color: 0x4CAF50,
      physics: { mass: 1, bounce: 0.8 },
      type: 'geometry'
    },
    {
      name: 'sphere',
      emoji: '🔴',
      color: 0xF44336,
      physics: { mass: 0.8, bounce: 0.9 },
      type: 'geometry'
    },
    {
      name: 'pyramid',
      emoji: '🔺',
      color: 0xFFC107,
      physics: { mass: 1.2, bounce: 0.6 },
      type: 'geometry'
    },
    {
      name: 'diamond',
      emoji: '💎',
      color: 0x00BCD4,
      physics: { mass: 2.0, bounce: 1.0 },
      type: 'geometry'
    },
  ];

  useEffect(() => {
    if (permission?.granted) {
      initializeAR();
    }
  }, [permission]);

  useEffect(() => {
    // Animate UI entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initializeAR = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
    setIsARActive(true);
    setIsLoading(false);
  };

  const create3DGeometry = (type) => {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
      case 'sphere':
        return new THREE.SphereGeometry(0.6, 64, 32);
      case 'pyramid':
        return new THREE.ConeGeometry(0.6, 1.2, 8);
      case 'diamond':
        return new THREE.OctahedronGeometry(0.8, 2);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  const createMaterial = (type, color) => {
    switch (type) {
      case 'diamond':
        return new THREE.MeshPhysicalMaterial({
          color: color,
          metalness: 0.1,
          roughness: 0.05,
          transmission: 0.95,
          thickness: 0.5,
          transparent: true,
          opacity: 0.9,
          ior: 1.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        });
      case 'sphere':
        return new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.8,
          roughness: 0.2,
          envMapIntensity: 1.5,
        });
      default:
        return new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.3,
          roughness: 0.4,
          transparent: true,
          opacity: 0.95,
        });
    }
  };

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    
    // Enhanced renderer setup
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
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Enhanced lighting setup
    setupSceneLighting(scene);

    // Ground plane with grid
    addGroundPlane(scene);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Animate objects
      animateObjects(time);
      
      // Dynamic camera movement
      if (lightingMode === 'dynamic') {
        camera.position.x = Math.sin(time * 0.2) * 0.5;
        camera.position.y = 1.5 + Math.cos(time * 0.15) * 0.3;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  const setupSceneLighting = (scene) => {
    // Clean existing lights
    const lights = scene.children.filter(child => child.isLight);
    lights.forEach(light => scene.remove(light));

    // Modern lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-3, 5, 2);
    scene.add(fillLight);

    if (lightingMode === 'dynamic') {
      // Rim light
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
      rimLight.position.set(0, 2, -5);
      scene.add(rimLight);

      // Colored accent lights
      const accentLight1 = new THREE.PointLight(0xff6b6b, 0.6, 20);
      accentLight1.position.set(-8, 3, 3);
      scene.add(accentLight1);

      const accentLight2 = new THREE.PointLight(0x6b6bff, 0.4, 20);
      accentLight2.position.set(8, -2, 3);
      scene.add(accentLight2);
    }
  };

  const addGroundPlane = (scene) => {
    // Invisible ground for shadows
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.ShadowMaterial({ 
      opacity: 0.3,
      transparent: true,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x333333);
    gridHelper.position.y = -2.99;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
  };

  const animateObjects = (time) => {
    objects3D.forEach((objData, index) => {
      if (!objData.mesh) return;

      if (physicsEnabled) {
        // Physics simulation
        objData.velocity.y -= 0.008; // Gravity
        objData.mesh.position.add(objData.velocity);
        
        // Ground collision with proper bounce
        if (objData.mesh.position.y < -2.5) {
          objData.mesh.position.y = -2.5;
          objData.velocity.y *= -objData.physics.bounce;
          objData.velocity.x *= 0.92;
          objData.velocity.z *= 0.92;
          
          // Small random impulse on bounce
          if (Math.abs(objData.velocity.y) < 0.01) {
            objData.velocity.x += (Math.random() - 0.5) * 0.02;
            objData.velocity.z += (Math.random() - 0.5) * 0.02;
          }
        }
        
        // Smooth rotation
        objData.mesh.rotation.x += objData.rotationSpeed.x;
        objData.mesh.rotation.y += objData.rotationSpeed.y;
        objData.mesh.rotation.z += objData.rotationSpeed.z;
      } else {
        // Floating animation with breathing effect
        const float = Math.sin(time * 0.8 + index) * 0.4;
        const breathe = Math.sin(time * 2 + index * 0.5) * 0.05;
        
        objData.mesh.position.y = objData.originalY + float;
        objData.mesh.rotation.y += 0.008;
        objData.mesh.scale.setScalar(1 + breathe);
      }
    });
  };

  const addObject = (position = null) => {
    const objectType = objectTypes.find(obj => obj.name === selectedObjectType);
    const geometry = create3DGeometry(selectedObjectType);
    const material = createMaterial(selectedObjectType, objectType.color);
    const mesh = new THREE.Mesh(geometry, material);

    // Position
    const x = position?.x || (Math.random() - 0.5) * 4;
    const y = position?.y || Math.random() * 2 + 3;
    const z = position?.z || (Math.random() - 0.5) * 3;
    
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add entrance animation
    mesh.scale.set(0, 0, 0);
    const scaleAnimation = () => {
      const targetScale = 1;
      const currentScale = mesh.scale.x;
      const step = (targetScale - currentScale) * 0.15;
      
      if (Math.abs(step) > 0.01) {
        mesh.scale.addScalar(step);
        requestAnimationFrame(scaleAnimation);
      } else {
        mesh.scale.set(targetScale, targetScale, targetScale);
      }
    };
    scaleAnimation();

    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }

    // Physics properties
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      0,
      (Math.random() - 0.5) * 0.05
    );

    const rotationSpeed = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02,
    };

    const newObject = {
      id: Date.now() + Math.random(),
      type: selectedObjectType,
      mesh: mesh,
      originalY: y,
      position: { x, y, z },
      velocity: velocity,
      rotationSpeed: rotationSpeed,
      physics: objectType.physics,
      createdAt: Date.now(),
    };

    setObjects3D(prev => [...prev, newObject]);
  };

  const handleTouchPlace = (evt) => {
    if (!sceneRef.current || !cameraRef.current || !isARActive) return;

    const touch = evt.nativeEvent;
    const normalizedX = (touch.locationX / screenWidth) * 2 - 1;
    const normalizedY = -(touch.locationY / screenHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(normalizedX, normalizedY);
    
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const direction = raycaster.ray.direction;
    const distance = 4;
    const worldPosition = new THREE.Vector3();
    worldPosition.copy(cameraRef.current.position).add(direction.multiplyScalar(distance));

    // Add haptic feedback effect
    addObject({ 
      x: worldPosition.x, 
      y: worldPosition.y, 
      z: worldPosition.z 
    });
  };

  const clearAllObjects = () => {
    if (objects3D.length === 0) return;

    objects3D.forEach((objData, index) => {
      if (objData.mesh && sceneRef.current) {
        // Smooth fade out animation
        const fadeOut = () => {
          objData.mesh.scale.multiplyScalar(0.92);
          if (objData.mesh.material) {
            objData.mesh.material.opacity -= 0.08;
          }
          
          if (objData.mesh.scale.x > 0.1) {
            setTimeout(fadeOut, 30);
          } else {
            sceneRef.current.remove(objData.mesh);
            objData.mesh.geometry.dispose();
            objData.mesh.material.dispose();
          }
        };
        
        setTimeout(() => fadeOut(), index * 80);
      }
    });
    setObjects3D([]);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!permission) {
    return <LoadingScreen message="Initializing AR System..." />;
  }

  // Show loading screen while initializing AR
  if (permission?.granted && isLoading) {
    return <LoadingScreen message="Setting up AR environment..." />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Animated.View 
          style={[
            styles.permissionContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.permissionTitle}>🚀 AR Experience</Text>
          <Text style={styles.permissionText}>
            Camera access required for augmented reality
          </Text>
          <TouchableOpacity 
            style={styles.modernPermissionButton} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      <CameraView style={styles.camera} facing="back">
        {/* AR Scene Overlay */}
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

        {/* UI Overlay */}
        <Animated.View 
          style={[
            styles.uiContainer,
            { opacity: fadeAnim }
          ]}
        >
          {/* Status Bar */}
          <ARStatusBar
            isARActive={isARActive}
            isLoading={isLoading}
            objectCount={objects3D.length}
            selectedObjectType={selectedObjectType}
            objectTypes={objectTypes}
            physicsEnabled={physicsEnabled}
          />

          {/* Object Selector */}
          <ObjectSelector
            objectTypes={objectTypes}
            selectedObjectType={selectedObjectType}
            onSelectType={setSelectedObjectType}
            showControls={showControls}
          />

          {/* Main Controls */}
          <ARControls
            showControls={showControls}
            selectedObjectType={selectedObjectType}
            objectCount={objects3D.length}
            physicsEnabled={physicsEnabled}
            onAddObject={addObject}
            onTogglePhysics={() => setPhysicsEnabled(!physicsEnabled)}
            onClearAll={clearAllObjects}
          />

          {/* Settings */}
          <ARSettings
            lightingMode={lightingMode}
            onToggleLighting={() => setLightingMode(
              lightingMode === 'dynamic' ? 'simple' : 'dynamic'
            )}
            showControls={showControls}
            onToggleControls={() => setShowControls(!showControls)}
          />

          {/* Tap instruction */}
          {isARActive && (
            <View style={styles.tapInstruction}>
              <Text style={styles.tapText}>Tap anywhere to place objects</Text>
            </View>
          )}
        </Animated.View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '300',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 40,
  },
  permissionContent: {
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  modernPermissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  uiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  tapInstruction: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 15,
  },
  tapText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default ModernARInterface;

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer, THREE } from 'expo-three';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ModelAR3D = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [objects3D, setObjects3D] = useState([]);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState('chair');
  const [showControls, setShowControls] = useState(true);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [lightingMode, setLightingMode] = useState('dynamic');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef();
  const loadedModelsRef = useRef({});

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
      name: 'chair', 
      emoji: '🪑', 
      color: 0x8B4513,
      physics: { mass: 3.0, bounce: 0.3 },
      type: 'model',
      modelPath: 'chair.glb'
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
      setTimeout(() => setIsARActive(true), 1000);
      loadModels();
    }
  }, [permission]);

  // Load 3D models
  const loadModels = async () => {
    setLoadingProgress('Loading 3D models...');
    
    try {
      console.log('Starting to load chair model...');
      
      const loader = new GLTFLoader();
      
      // Load chair.glb from assets
      const chairAsset = Asset.fromModule(require('../assets/models/chair.glb'));
      await chairAsset.downloadAsync();
      
      console.log('Chair asset downloaded, loading with GLTF loader...');
      
      // Load the GLB model
      loader.load(
        chairAsset.localUri,
        (gltf) => {
          console.log('Chair model loaded successfully!');
          const chairModel = gltf.scene.clone();
          
          // Normalize the chair model properly
          const box = new THREE.Box3().setFromObject(chairModel);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const targetSize = 1.2; // 1.2 meters for better visibility
          const scale = targetSize / maxDim;
          chairModel.scale.setScalar(scale);
          
          // Position the chair properly - centered and sitting on ground
          box.setFromObject(chairModel); // Recalculate after scaling
          const center = box.getCenter(new THREE.Vector3());
          const yMin = box.min.y;
          
          chairModel.position.x -= center.x; // Center X
          chairModel.position.z -= center.z; // Center Z 
          chairModel.position.y -= yMin;     // Sit on ground (y=0)
          
          // Enhance materials for better visibility
          chairModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Improve material properties
              if (child.material) {
                if (child.material.map) {
                  // Keep textures but enhance them
                  child.material.metalness = 0.1;
                  child.material.roughness = 0.8;
                } else {
                  // Add a nice wood-like color for untextured parts
                  child.material.color = new THREE.Color(0x8B4513);
                  child.material.metalness = 0.0;
                  child.material.roughness = 0.9;
                }
              }
            }
          });
          
          // Store the processed model
          loadedModelsRef.current['chair'] = chairModel;
          
          console.log('Chair model processed and ready for use');
          setLoadingProgress('✅ Chair model ready!');
          setModelsLoaded(true);
        },
        (progress) => {
          if (progress.total > 0) {
            const progressPercent = Math.round((progress.loaded / progress.total) * 100);
            setLoadingProgress(`📦 Loading chair: ${progressPercent}%`);
          }
        },
        (error) => {
          console.error('Error loading chair GLB:', error);
          console.warn('Falling back to procedural chair geometry');
          setLoadingProgress('⚠️ Using fallback chair geometry');
          setModelsLoaded(true);
        }
      );
      
    } catch (error) {
      console.error('Error setting up model loading:', error);
      setLoadingProgress('Using basic geometries');
      setModelsLoaded(true);
    }
  };

  // Create 3D geometry or load model
  const create3DObject = (type) => {
    const objectType = objectTypes.find(obj => obj.name === type);
    
    if (objectType.type === 'model' && loadedModelsRef.current[type]) {
      // Clone the loaded model
      const model = loadedModelsRef.current[type].clone();
      
      // Scale the model appropriately
      model.scale.set(0.5, 0.5, 0.5);
      
      // Enable shadows for all meshes in the model
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Enhance materials if needed
          if (child.material) {
            child.material.metalness = 0.1;
            child.material.roughness = 0.7;
          }
        }
      });
      
      return { mesh: model, isModel: true };
    } else {
      // Create basic geometry
      const geometryOrGroup = create3DGeometry(type);
      
      // Handle both geometries and groups (like chair)
      if (geometryOrGroup instanceof THREE.Group) {
        // For groups (like chair), return the group directly
        return { mesh: geometryOrGroup, isModel: true };
      } else {
        // For geometries, create a mesh
        const material = createAdvancedMaterial(type, objectType.color);
        const mesh = new THREE.Mesh(geometryOrGroup, material);
        return { mesh, isModel: false };
      }
    }
  };

  // Create 3D geometry for basic shapes
  const create3DGeometry = (type) => {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
      case 'sphere':
        return new THREE.SphereGeometry(0.6, 32, 32);
      case 'pyramid':
        return new THREE.ConeGeometry(0.6, 1.2, 8);
      case 'diamond':
        return new THREE.OctahedronGeometry(0.8, 0);
      case 'chair':
        // Create a custom chair-like geometry using basic shapes
        const chairGroup = new THREE.Group();
        
        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, 0.5, 0);
        chairGroup.add(seat);
        
        // Chair back
        const backGeometry = new THREE.BoxGeometry(1, 1, 0.1);
        const backMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.set(0, 1, -0.45);
        chairGroup.add(back);
        
        // Chair legs (4 legs)
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
        
        const positions = [
          [-0.4, 0.25, -0.4],
          [0.4, 0.25, -0.4],
          [-0.4, 0.25, 0.4],
          [0.4, 0.25, 0.4]
        ];
        
        positions.forEach(pos => {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          leg.position.set(pos[0], pos[1], pos[2]);
          chairGroup.add(leg);
        });
        
        return chairGroup;
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Create advanced material
  const createAdvancedMaterial = (type, color) => {
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
    
    // Initialize renderer
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

    // Initialize scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Enhanced lighting
    const setupLighting = () => {
      // Clear existing lights
      const lights = scene.children.filter(child => child.isLight);
      lights.forEach(light => scene.remove(light));

      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      // Main directional light
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(10, 10, 5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 50;
      scene.add(mainLight);

      // Fill light
      const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
      fillLight.position.set(-5, 3, 2);
      scene.add(fillLight);

      if (lightingMode === 'dynamic') {
        // Colored point lights
        const pointLight1 = new THREE.PointLight(0xff6b6b, 0.8, 100);
        pointLight1.position.set(-5, 5, 3);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x6b6bff, 0.6, 100);
        pointLight2.position.set(5, -3, 3);
        scene.add(pointLight2);
      }
    };

    setupLighting();

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.4 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Animate objects
      objects3D.forEach((objData, index) => {
        if (objData.mesh && physicsEnabled) {
          // Physics simulation
          objData.velocity.y -= 0.01; // Gravity
          objData.mesh.position.add(objData.velocity);
          
          // Ground collision
          if (objData.mesh.position.y < -2.5) {
            objData.mesh.position.y = -2.5;
            objData.velocity.y *= -objData.physics.bounce;
            objData.velocity.x *= 0.95;
            objData.velocity.z *= 0.95;
          }
          
          // Rotation
          if (!objData.isModel) {
            objData.mesh.rotation.x += objData.rotationSpeed.x;
            objData.mesh.rotation.y += objData.rotationSpeed.y;
            objData.mesh.rotation.z += objData.rotationSpeed.z;
          } else {
            // Rotate models more naturally
            objData.mesh.rotation.y += objData.rotationSpeed.y * 0.5;
          }
        } else if (objData.mesh && !physicsEnabled) {
          // Floating animation
          if (!objData.isModel) {
            objData.mesh.rotation.x += 0.01;
            objData.mesh.rotation.y += 0.015;
          } else {
            objData.mesh.rotation.y += 0.01;
          }
          objData.mesh.position.y = objData.originalY + Math.sin(time + index) * 0.3;
        }
      });

      // Dynamic camera
      if (lightingMode === 'dynamic') {
        camera.position.x = Math.sin(time * 0.3) * 0.5;
        camera.position.y = 2 + Math.cos(time * 0.2) * 0.3;
        camera.lookAt(0, 0, 0);

        // Animate lights
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

  // Add 3D object
  const add3DObject = () => {
    const objectType = objectTypes.find(obj => obj.name === selectedObjectType);
    const objectData = create3DObject(selectedObjectType);
    
    if (!objectData.mesh) {
      Alert.alert('Error', 'Could not create 3D object');
      return;
    }

    const { mesh, isModel } = objectData;
    
    // Position
    const x = (Math.random() - 0.5) * 6;
    const y = Math.random() * 3 + 2;
    const z = (Math.random() - 0.5) * 4;
    
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }

    // Physics
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
      isModel: isModel,
      originalY: y,
      position: { x, y, z },
      velocity: velocity,
      rotationSpeed: rotationSpeed,
      physics: objectType.physics,
    };

    setObjects3D(prev => [...prev, newObject]);
  };

  // Touch to place
  const handleTouchPlace = (evt) => {
    if (!sceneRef.current || !cameraRef.current) return;

    const touch = evt.nativeEvent;
    const normalizedX = (touch.locationX / screenWidth) * 2 - 1;
    const normalizedY = -(touch.locationY / screenHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(normalizedX, normalizedY);
    
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const direction = raycaster.ray.direction;
    const distance = 5;
    const worldPosition = new THREE.Vector3();
    worldPosition.copy(cameraRef.current.position).add(direction.multiplyScalar(distance));

    add3DObjectAtPosition(worldPosition.x, worldPosition.y, worldPosition.z);
  };

  // Add object at position
  const add3DObjectAtPosition = (x, y, z) => {
    const objectType = objectTypes.find(obj => obj.name === selectedObjectType);
    const objectData = create3DObject(selectedObjectType);
    
    if (!objectData.mesh) return;

    const { mesh, isModel } = objectData;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }

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
      isModel: isModel,
      originalY: y,
      position: { x, y, z },
      velocity: velocity,
      rotationSpeed: rotationSpeed,
      physics: objectType.physics,
    };

    setObjects3D(prev => [...prev, newObject]);
  };

  // Clear objects
  const clearAll3DObjects = () => {
    objects3D.forEach((objData, index) => {
      if (objData.mesh && sceneRef.current) {
        const fadeOut = () => {
          if (objData.mesh.material) {
            if (Array.isArray(objData.mesh.material)) {
              objData.mesh.material.forEach(mat => mat.opacity -= 0.05);
            } else {
              objData.mesh.material.opacity -= 0.05;
            }
          }
          objData.mesh.scale.multiplyScalar(0.95);
          
          const hasOpacity = objData.mesh.material && 
            (Array.isArray(objData.mesh.material) ? 
             objData.mesh.material[0].opacity > 0 : 
             objData.mesh.material.opacity > 0);
          
          if (!hasOpacity) {
            sceneRef.current.remove(objData.mesh);
            if (objData.mesh.geometry) objData.mesh.geometry.dispose();
            if (objData.mesh.material) {
              if (Array.isArray(objData.mesh.material)) {
                objData.mesh.material.forEach(mat => mat.dispose());
              } else {
                objData.mesh.material.dispose();
              }
            }
          } else {
            setTimeout(fadeOut, 50);
          }
        };
        
        setTimeout(() => fadeOut(), index * 100);
      }
    });
    setObjects3D([]);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading 3D AR with Models...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required for 3D Model AR</Text>
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

        {/* Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>🪑 3D Model AR System</Text>
          <Text style={styles.statusText}>
            Status: {isARActive ? '🟢 3D Models Active' : '🟡 Loading...'}
          </Text>
          {!modelsLoaded && (
            <Text style={styles.loadingText}>
              {loadingProgress}
            </Text>
          )}
          <Text style={styles.objectCount}>
            Objects: {objects3D.length}
          </Text>
          <Text style={styles.currentType}>
            Selected: {objectTypes.find(obj => obj.name === selectedObjectType)?.emoji} {selectedObjectType}
          </Text>
          <Text style={styles.physicsStatus}>
            Physics: {physicsEnabled ? '🟢 ON' : '🔴 OFF'}
          </Text>
        </View>

        {/* Object Selector */}
        <View style={styles.typeSelector}>
          {objectTypes.map((type) => (
            <TouchableOpacity
              key={type.name}
              style={[
                styles.typeButton,
                selectedObjectType === type.name && styles.selectedTypeButton,
                type.type === 'model' && !modelsLoaded && styles.disabledButton
              ]}
              onPress={() => setSelectedObjectType(type.name)}
              disabled={type.type === 'model' && !modelsLoaded}
            >
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Controls */}
        {showControls && (
          <View style={styles.controlPanel}>
            <TouchableOpacity style={styles.addButton} onPress={add3DObject}>
              <Text style={styles.buttonText}>
                {selectedObjectType === 'chair' ? '🪑 Add Chair' : '🎯 Add 3D'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.physicsButton}
              onPress={() => setPhysicsEnabled(!physicsEnabled)}
            >
              <Text style={styles.buttonText}>
                {physicsEnabled ? '🌊 Physics' : '⭐ Float'}
              </Text>
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

        {/* Settings */}
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

        {/* Toggle */}
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
          <Text style={styles.instructionTitle}>🪑 3D Model AR</Text>
          <Text style={styles.instructionText}>
            • Tap to place real 3D models & objects
          </Text>
          <Text style={styles.instructionText}>
            • Chair model loaded from GLB file
          </Text>
          <Text style={styles.instructionText}>
            • Physics simulation with realistic behavior
          </Text>
          <Text style={styles.instructionSubtext}>
            📱 Real furniture & objects in AR space!
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
  loadingText: {
    fontSize: 12,
    color: '#ffaa00',
    textAlign: 'center',
    marginBottom: 5,
    fontStyle: 'italic',
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
    top: 240,
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
  disabledButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    opacity: 0.5,
  },
  typeEmoji: {
    fontSize: 24,
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
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
  },
  physicsButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledText: {
    color: '#ccc',
  },
  settingsPanel: {
    position: 'absolute',
    top: 310,
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
    top: 310,
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

export default ModelAR3D;

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer, Scene, PerspectiveCamera, BoxGeometry, SphereGeometry, CylinderGeometry, OctahedronGeometry, MeshBasicMaterial, MeshPhongMaterial, Mesh, AmbientLight, DirectionalLight, PointLight } from 'expo-three';
import * as THREE from 'three';

const { width, height } = Dimensions.get('window');

export default function EnhancedExpoAR() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isARActive, setIsARActive] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [currentObjectType, setCurrentObjectType] = useState('cube');
  const [currentMode, setCurrentMode] = useState('place'); // place, animate, interactive
  const [showStats, setShowStats] = useState(true);
  const glRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const objectsRef = useRef([]);
  const animationSpeedRef = useRef(1);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onContextCreate = async (gl) => {
    try {
      // Create renderer with enhanced settings
      const renderer = new Renderer({ gl, antialias: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Transparent background for AR
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Create scene
      const scene = new Scene();
      sceneRef.current = scene;

      // Create camera with better settings
      const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 2, 5);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Enhanced lighting system
      const ambientLight = new AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Add colored point lights for dynamic lighting
      const pointLight1 = new PointLight(0xff0040, 1, 50);
      pointLight1.position.set(-10, 10, -10);
      scene.add(pointLight1);

      const pointLight2 = new PointLight(0x0040ff, 1, 50);
      pointLight2.position.set(10, 10, 10);
      scene.add(pointLight2);

      // Start enhanced render loop
      const render = () => {
        requestAnimationFrame(render);
        const time = Date.now() * 0.001;
        
        // Animate objects with different patterns
        objectsRef.current.forEach((obj, index) => {
          if (obj.userData.animate) {
            const speed = animationSpeedRef.current;
            
            switch(obj.userData.animationType) {\n              case 'rotate':\n                obj.rotation.y += 0.01 * speed;\n                obj.rotation.x += 0.005 * speed;\n                break;\n              case 'bounce':\n                obj.position.y += Math.sin(time * 2 + index) * 0.01;\n                break;\n              case 'orbit':\n                const radius = 2;\n                obj.position.x = Math.cos(time + index) * radius;\n                obj.position.z = Math.sin(time + index) * radius;\n                break;\n              case 'pulse':\n                const scale = 1 + Math.sin(time * 3 + index) * 0.2;\n                obj.scale.set(scale, scale, scale);\n                break;\n            }\n          }\n          \n          // Interactive mode - objects react to each other\n          if (currentMode === 'interactive' && objectsRef.current.length > 1) {\n            objectsRef.current.forEach((otherObj, otherIndex) => {\n              if (index !== otherIndex) {\n                const distance = obj.position.distanceTo(otherObj.position);\n                if (distance < 2) {\n                  // Objects attract/repel each other\n                  const direction = new THREE.Vector3().subVectors(obj.position, otherObj.position).normalize();\n                  obj.position.add(direction.multiplyScalar(0.01));\n                }\n              }\n            });\n          }\n        });\n\n        // Animate lights\n        pointLight1.position.x = Math.sin(time * 0.5) * 10;\n        pointLight1.position.z = Math.cos(time * 0.5) * 10;\n        pointLight2.position.x = Math.cos(time * 0.7) * 10;\n        pointLight2.position.z = Math.sin(time * 0.7) * 10;\n\n        renderer.render(scene, camera);\n        gl.endFrameEXP();\n      };\n      render();\n      \n      setIsARActive(true);\n    } catch (error) {\n      console.error('Enhanced AR initialization failed:', error);\n      Alert.alert('AR Error', 'Failed to initialize AR system');\n    }\n  };\n\n  const addObject = () => {\n    if (!sceneRef.current) return;\n\n    let geometry, material, object;\n    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xa55eea, 0x26de81];\n    const color = colors[Math.floor(Math.random() * colors.length)];\n    \n    // Enhanced materials with different properties\n    const materialType = Math.random();\n    if (materialType > 0.7) {\n      material = new MeshPhongMaterial({ \n        color: color,\n        transparent: true,\n        opacity: 0.8,\n        shininess: 100\n      });\n    } else if (materialType > 0.4) {\n      material = new MeshBasicMaterial({ \n        color: color,\n        transparent: true,\n        opacity: 0.9,\n        wireframe: Math.random() > 0.8\n      });\n    } else {\n      material = new MeshPhongMaterial({ \n        color: color,\n        transparent: true,\n        opacity: 0.7,\n        emissive: new THREE.Color(color).multiplyScalar(0.2)\n      });\n    }\n\n    // Create different object types with varying complexity\n    switch(currentObjectType) {\n      case 'sphere':\n        geometry = new SphereGeometry(0.3, 16, 16);\n        break;\n      case 'cylinder':\n        geometry = new CylinderGeometry(0.2, 0.2, 0.6, 16);\n        break;\n      case 'octahedron':\n        geometry = new OctahedronGeometry(0.4, 2);\n        break;\n      case 'cube':\n      default:\n        geometry = new BoxGeometry(0.5, 0.5, 0.5);\n        break;\n    }\n\n    object = new Mesh(geometry, material);\n    object.castShadow = true;\n    object.receiveShadow = true;\n    \n    // Position based on current mode\n    if (currentMode === 'place') {\n      object.position.set(\n        (Math.random() - 0.5) * 6,\n        Math.random() * 3 - 1,\n        (Math.random() - 0.5) * 4\n      );\n    } else if (currentMode === 'interactive') {\n      // Place objects in a pattern for interaction\n      const angle = (objectCount * Math.PI * 2) / 8;\n      object.position.set(\n        Math.cos(angle) * 3,\n        0,\n        Math.sin(angle) * 3\n      );\n    } else {\n      // Animate mode - start from center\n      object.position.set(0, 0, 0);\n    }\n    \n    // Random rotation\n    object.rotation.set(\n      Math.random() * Math.PI,\n      Math.random() * Math.PI,\n      Math.random() * Math.PI\n    );\n\n    // Enhanced object data\n    const animationTypes = ['rotate', 'bounce', 'orbit', 'pulse'];\n    object.userData = { \n      animate: currentMode !== 'place',\n      animationType: animationTypes[Math.floor(Math.random() * animationTypes.length)],\n      type: currentObjectType,\n      createdAt: Date.now(),\n      id: Math.random().toString(36).substr(2, 9)\n    };\n\n    sceneRef.current.add(object);\n    objectsRef.current.push(object);\n    setObjectCount(prev => prev + 1);\n\n    // Cycle through object types\n    const types = ['cube', 'sphere', 'cylinder', 'octahedron'];\n    const currentIndex = types.indexOf(currentObjectType);\n    const nextIndex = (currentIndex + 1) % types.length;\n    setCurrentObjectType(types[nextIndex]);\n  };\n\n  const clearAllObjects = () => {\n    if (!sceneRef.current) return;\n\n    objectsRef.current.forEach(obj => {\n      sceneRef.current.remove(obj);\n      obj.geometry.dispose();\n      obj.material.dispose();\n    });\n    \n    objectsRef.current = [];\n    setObjectCount(0);\n  };\n\n  const changeMode = () => {\n    const modes = ['place', 'animate', 'interactive'];\n    const currentIndex = modes.indexOf(currentMode);\n    const nextIndex = (currentIndex + 1) % modes.length;\n    setCurrentMode(modes[nextIndex]);\n    \n    // Update existing objects based on mode\n    objectsRef.current.forEach(obj => {\n      obj.userData.animate = modes[nextIndex] !== 'place';\n    });\n  };\n\n  const changeAnimationSpeed = () => {\n    animationSpeedRef.current = animationSpeedRef.current >= 3 ? 0.5 : animationSpeedRef.current + 0.5;\n  };\n\n  if (hasPermission === null) {\n    return (\n      <View style={styles.container}>\n        <Text style={styles.text}>Requesting camera permissions...</Text>\n      </View>\n    );\n  }\n  \n  if (hasPermission === false) {\n    return (\n      <View style={styles.container}>\n        <Text style={styles.text}>No access to camera</Text>\n        <Text style={styles.subText}>Please grant camera permissions to use AR features</Text>\n      </View>\n    );\n  }\n\n  return (\n    <View style={styles.container}>\n      {/* Camera Background */}\n      <Camera\n        style={styles.camera}\n        type={Camera.Constants.Type.back}\n        ratio=\"16:9\"\n      >\n        {/* Enhanced 3D AR Overlay */}\n        <GLView\n          style={styles.glView}\n          onContextCreate={onContextCreate}\n          ref={glRef}\n        />\n        \n        {/* Enhanced Status Panel */}\n        {showStats && (\n          <View style={styles.statusContainer}>\n            <Text style={styles.statusText}>\n              🚀 Enhanced AR {isARActive ? 'Active' : 'Initializing...'}\n            </Text>\n            <Text style={styles.infoText}>\n              Objects: {objectCount} | Type: {currentObjectType}\n            </Text>\n            <Text style={styles.modeText}>\n              Mode: {currentMode.toUpperCase()} | Speed: {animationSpeedRef.current}x\n            </Text>\n          </View>\n        )}\n\n        {/* Enhanced Controls */}\n        <View style={styles.controlsContainer}>\n          <View style={styles.topControls}>\n            <TouchableOpacity\n              style={[styles.controlButton, styles.modeButton]}\n              onPress={changeMode}\n            >\n              <Text style={styles.buttonText}>Mode: {currentMode}</Text>\n            </TouchableOpacity>\n            \n            <TouchableOpacity\n              style={[styles.controlButton, styles.speedButton]}\n              onPress={changeAnimationSpeed}\n            >\n              <Text style={styles.buttonText}>Speed: {animationSpeedRef.current}x</Text>\n            </TouchableOpacity>\n            \n            <TouchableOpacity\n              style={[styles.controlButton, styles.statsButton]}\n              onPress={() => setShowStats(!showStats)}\n            >\n              <Text style={styles.buttonText}>{showStats ? '📊' : '👁️'}</Text>\n            </TouchableOpacity>\n          </View>\n          \n          <View style={styles.bottomControls}>\n            <TouchableOpacity\n              style={[styles.controlButton, styles.addButton]}\n              onPress={addObject}\n            >\n              <Text style={styles.buttonText}>Add {currentObjectType}</Text>\n            </TouchableOpacity>\n            \n            <TouchableOpacity\n              style={[styles.controlButton, styles.clearButton]}\n              onPress={clearAllObjects}\n              disabled={objectCount === 0}\n            >\n              <Text style={[styles.buttonText, objectCount === 0 && styles.disabledText]}>\n                Clear All ({objectCount})\n              </Text>\n            </TouchableOpacity>\n          </View>\n        </View>\n\n        {/* Enhanced Instructions */}\n        <View style={styles.instructionsContainer}>\n          <Text style={styles.instructionsText}>\n            {currentMode === 'place' && '🎯 Place Mode: Objects stay where placed'}\n            {currentMode === 'animate' && '✨ Animate Mode: Objects move and dance'}\n            {currentMode === 'interactive' && '🔗 Interactive Mode: Objects interact with each other'}\n          </Text>\n          <Text style={styles.instructionsSubText}>\n            Tap mode/speed buttons to change behavior • Enhanced lighting & materials\n          </Text>\n        </View>\n      </Camera>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    backgroundColor: '#000',\n  },\n  camera: {\n    flex: 1,\n  },\n  glView: {\n    flex: 1,\n    backgroundColor: 'transparent',\n  },\n  text: {\n    fontSize: 18,\n    color: 'white',\n    textAlign: 'center',\n    marginTop: 50,\n  },\n  subText: {\n    fontSize: 14,\n    color: '#ccc',\n    textAlign: 'center',\n    marginTop: 10,\n    paddingHorizontal: 20,\n  },\n  statusContainer: {\n    position: 'absolute',\n    top: 60,\n    left: 20,\n    right: 20,\n    backgroundColor: 'rgba(0, 0, 0, 0.8)',\n    borderRadius: 15,\n    padding: 15,\n    borderWidth: 1,\n    borderColor: 'rgba(255, 255, 255, 0.1)',\n  },\n  statusText: {\n    color: '#00ff88',\n    fontSize: 16,\n    fontWeight: 'bold',\n    textAlign: 'center',\n  },\n  infoText: {\n    color: 'white',\n    fontSize: 14,\n    textAlign: 'center',\n    marginTop: 5,\n  },\n  modeText: {\n    color: '#ffaa00',\n    fontSize: 12,\n    textAlign: 'center',\n    marginTop: 3,\n  },\n  controlsContainer: {\n    position: 'absolute',\n    bottom: 140,\n    left: 20,\n    right: 20,\n  },\n  topControls: {\n    flexDirection: 'row',\n    justifyContent: 'space-around',\n    marginBottom: 10,\n  },\n  bottomControls: {\n    flexDirection: 'row',\n    justifyContent: 'space-around',\n  },\n  controlButton: {\n    borderRadius: 20,\n    paddingVertical: 10,\n    paddingHorizontal: 15,\n    minWidth: 80,\n    borderWidth: 1,\n    borderColor: 'rgba(255, 255, 255, 0.3)',\n  },\n  addButton: {\n    backgroundColor: 'rgba(40, 167, 69, 0.8)',\n    minWidth: 120,\n  },\n  clearButton: {\n    backgroundColor: 'rgba(220, 53, 69, 0.8)',\n    minWidth: 120,\n  },\n  modeButton: {\n    backgroundColor: 'rgba(123, 104, 238, 0.8)',\n  },\n  speedButton: {\n    backgroundColor: 'rgba(255, 165, 0, 0.8)',\n  },\n  statsButton: {\n    backgroundColor: 'rgba(30, 144, 255, 0.8)',\n  },\n  buttonText: {\n    color: 'white',\n    fontSize: 12,\n    fontWeight: 'bold',\n    textAlign: 'center',\n  },\n  disabledText: {\n    color: '#666',\n  },\n  instructionsContainer: {\n    position: 'absolute',\n    bottom: 40,\n    left: 20,\n    right: 20,\n    backgroundColor: 'rgba(0, 0, 0, 0.8)',\n    borderRadius: 15,\n    padding: 15,\n    borderWidth: 1,\n    borderColor: 'rgba(255, 255, 255, 0.1)',\n  },\n  instructionsText: {\n    color: 'white',\n    fontSize: 14,\n    textAlign: 'center',\n    fontWeight: 'bold',\n  },\n  instructionsSubText: {\n    color: '#ccc',\n    fontSize: 11,\n    textAlign: 'center',\n    marginTop: 5,\n  },\n});

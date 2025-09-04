# Expo AR System 🚀

An Augmented Reality (AR) system built with **Expo**, **Three.js**, and **expo-gl** that works directly with **Expo Go** app!

## ✨ Features

### Core AR Functionality
- **Live Camera Feed**: Real-time camera background for AR experience
- **3D Object Placement**: Add cubes, spheres, cylinders, and octahedrons
- **Dynamic Lighting**: Ambient, directional, and colored point lights
- **Multiple Materials**: Basic, Phong, wireframe, and emissive materials

### Interactive Modes
- **🎯 Place Mode**: Objects stay where placed
- **✨ Animate Mode**: Objects move with different animation patterns
- **🔗 Interactive Mode**: Objects interact and react to each other

### Advanced Features
- **Animation Patterns**: Rotate, bounce, orbit, pulse
- **Variable Speed Control**: Adjust animation speed (0.5x to 3x)
- **Dynamic Point Lights**: Moving colored lights for enhanced visuals
- **Material Variety**: Random materials with transparency and effects
- **Stats Panel**: Toggle-able information display

## 📱 Quick Start with Expo Go

### Prerequisites
- **Expo Go** app installed on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Node.js** (v14 or higher)

### Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Scan QR Code**
   - Open Expo Go on your phone
   - Scan the QR code from your terminal/browser
   - Grant camera permissions when prompted

4. **Enjoy AR!**
   - The app will load directly in Expo Go
   - No need to build or deploy - it just works! 📱

## 🎮 How to Use

### Controls
- **Add Button**: Place new 3D objects in the scene
- **Mode Button**: Switch between Place/Animate/Interactive modes
- **Speed Button**: Change animation speed (0.5x, 1x, 1.5x, 2x, 2.5x, 3x)
- **Stats Button**: Show/hide information panel
- **Clear All**: Remove all objects from the scene

### Modes Explained
1. **Place Mode**: Objects appear randomly positioned and stay static
2. **Animate Mode**: Objects move with different patterns (rotate, bounce, orbit, pulse)
3. **Interactive Mode**: Objects are placed in patterns and react to each other

### Object Types
- **Cube**: Basic geometric cube
- **Sphere**: Smooth spherical object
- **Cylinder**: Tall cylindrical shape  
- **Octahedron**: Diamond-like geometric shape

## 🛠️ Technical Details

### Dependencies
- `expo-camera` - Camera access for AR background
- `expo-gl` - WebGL context for 3D rendering
- `expo-three` - Three.js integration for Expo
- `three` - 3D graphics library

### Architecture
```
components/
├── ExpoARSystem.jsx     # Main AR component
└── EnhancedExpoAR.jsx   # Advanced version (if available)

app/
├── (tabs)/
│   └── index.tsx        # Entry point
└── _layout.tsx          # App layout
```

### 3D Rendering Pipeline
1. **Camera Setup**: Expo Camera provides live feed
2. **GL Context**: expo-gl creates WebGL rendering context  
3. **Three.js Scene**: 3D scene with objects, lights, and camera
4. **Render Loop**: Continuous rendering with animations
5. **AR Overlay**: 3D content overlaid on camera feed

## 📊 Performance Notes

- **Optimized for Mobile**: Designed to run smoothly on phones
- **Efficient Rendering**: Uses requestAnimationFrame for smooth 60fps
- **Memory Management**: Proper disposal of geometries and materials
- **Lighting Balance**: Optimized lighting for performance vs. quality

## 🔧 Customization

### Adding New Object Types
```javascript
// In addObject() function, add new case:
case 'newShape':
  geometry = new YourGeometry(params);
  break;
```

### Creating New Animation Patterns
```javascript
// In render loop, add new animation type:
case 'newPattern':
  // Your animation logic here
  break;
```

### Adjusting Visual Settings
- **Colors**: Modify the `colors` array
- **Lighting**: Adjust light intensities and positions  
- **Materials**: Change opacity, shininess, wireframe settings

## 📱 Device Compatibility

### Supported Devices
- **iOS**: iPhone 6s and newer, iPad with iOS 10+
- **Android**: Devices with OpenGL ES 3.0 support, Android 6.0+
- **Camera**: Requires rear camera access

### Performance Tiers
- **High-end devices**: All features, 60fps, complex lighting
- **Mid-range devices**: Good performance, may reduce to 30fps
- **Older devices**: Basic features, simplified materials

## 🚨 Troubleshooting

### Common Issues

**Black Screen**
- Ensure camera permissions are granted
- Check if device supports OpenGL ES 3.0
- Try restarting Expo Go

**Poor Performance**  
- Reduce number of objects (recommended <20)
- Switch to Place mode for better performance
- Close other apps to free up memory

**Objects Not Appearing**
- Check console for Three.js errors
- Ensure proper GL context initialization
- Verify geometry and material creation

**AR Not Working in Expo Go**
- This is expected - true AR tracking requires native code
- This app provides "AR-like" experience with camera + 3D overlay
- For full AR with plane detection, use native development

## 🎯 Future Enhancements

- [ ] Touch interaction with 3D objects
- [ ] Physics simulation with object collisions
- [ ] Particle systems and visual effects
- [ ] Sound effects and spatial audio
- [ ] Save/load object configurations
- [ ] Multiplayer shared AR sessions
- [ ] Advanced post-processing effects

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- **Expo Team**: For amazing tools and platform
- **Three.js**: For powerful 3D graphics library
- **React Native Community**: For ecosystem support

---

**Ready to experience AR in Expo Go? Just scan and play! 🎉**

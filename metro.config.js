const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo projects
 * https://docs.expo.dev/guides/customizing-metro
 */
const config = getDefaultConfig(__dirname);

// Add support for GLB files and other 3D model formats
config.resolver.assetExts.push('glb', 'gltf', 'obj', 'dae', '3ds', 'fbx');

module.exports = config;

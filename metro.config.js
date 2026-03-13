const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Alias react-native-maps to @teovilla/react-native-web-maps strictly for Web builds
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return context.resolveRequest(
      context,
      "@teovilla/react-native-web-maps",
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

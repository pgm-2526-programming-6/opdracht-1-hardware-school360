module.exports = {
  expo: {
    name: "School-360",
    slug: "School-360",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/ios-light.png",
    scheme: "school360",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.habipbasboyuk.School360",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_IOS_KEY,
      },
    },
    android: {
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "POST_NOTIFICATIONS",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_ANDROID_KEY,
        },
      },
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./src/assets/images/ios-light.png",
        backgroundImage: "./src/assets/images/ios-light.png",
        monochromeImage: "./src/assets/images/ios-light.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.habipbasboyuk.School360",
    },
    web: {
      output: "static",
      favicon: "./src/assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/ios-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    updates: {
      enabled: false,
    },
    extra: {
      router: {},
      eas: {
        projectId: "28152762-2883-4125-863e-5f32546c58cb",
      },
    },
  },
};

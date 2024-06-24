import 'dotenv/config';

export default {
  expo: {
    name: "post-it",
    slug: "post-it",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.postit"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.yourcompany.postit"
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
};
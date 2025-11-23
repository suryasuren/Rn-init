import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Platform,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "../screens/SplashScreen";
import MainNavigator from "../navigation/MainNavigator";
import ToastProvider from "../components/ToastProvider";
import { AuthProvider, useAuth } from "../auth/AuthProvider";

const UPLOADED_CHAT_PATH = "file:///mnt/data/960aa3cf-da43-4d5a-8e1f-348470b806e8.png";

function AppInner({ splashBackgroundSource }: { splashBackgroundSource: ImageSourcePropType }) {
  const [splashDone, setSplashDone] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [unmounted, setUnmounted] = useState<boolean>(false);
  const auth = useAuth();

  useEffect(() => {
    if (!splashDone) return;
    if (auth.status === "loading") return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      setUnmounted(true);
    });
  }, [splashDone, auth.status, fadeAnim]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      <MainNavigator />
      {!unmounted && (
        <Animated.View
          pointerEvents={splashDone && auth.status !== "loading" ? "none" : "auto"}
          style={[StyleSheet.absoluteFill, { opacity: fadeAnim, zIndex: 9999 }]}
        >
          <SplashScreen
            title="CinemaSquad"
            subtitle="Play. Book. Enjoy."
            backgroundSource={splashBackgroundSource}
            onReady={() => setSplashDone(true)}
          />
        </Animated.View>
      )}
    </View>
  );
}

export default function App() {
  const splashBackgroundSource = useMemo<ImageSourcePropType>(() => {
    try {
      return require("../assets/splash/splash_bg.png") as ImageSourcePropType;
    } catch {
      return { uri: UPLOADED_CHAT_PATH };
    }
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <AppInner splashBackgroundSource={splashBackgroundSource} />
        </SafeAreaProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
});

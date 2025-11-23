import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  StatusBar,
  Dimensions,
  View,
  Text,
  Animated,
  InteractionManager,
  Platform,
  Easing,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SwipeUpCard from '../components/SwipeUpCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AppStackParamList = {
  Home: undefined;
  Login: undefined;
};

const PACKAGED_BG = require('../assets/welcome-bg.png');
const FALLBACK_BG = { uri: 'file:///mnt/data/e0413fa1-e54a-470a-823f-5c1b3e62078e.png' };
const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ isLoggedIn }: { isLoggedIn?: boolean }) {
   const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const bgSource = PACKAGED_BG || FALLBACK_BG;

  useEffect(() => {
    if (isLoggedIn) navigation.replace("Home");
  }, [isLoggedIn, navigation]);

  // Animated refs
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;

  // Control flags
  const runningRef = useRef(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const runFadeLift = (duration = 300) =>
    new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: reduceMotion ? 140 : duration,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: reduceMotion ? -6 : -18,
          duration: reduceMotion ? 140 : duration,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });

  const handleSwipeUp = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setOverlayActive(true);

    Promise.resolve()
      .then(() => runFadeLift(reduceMotion ? 140 : 300))
      .then(
        () =>
          new Promise<void>((res) => {
            InteractionManager.runAfterInteractions(() => res());
          }),
      )
      .then(() => {
        try {
          navigation.replace('Login');
        } catch {
          navigation.navigate('Login');
        }
      })
      .finally(() => {
        overlayOpacity.setValue(0);
        contentTranslateY.setValue(0);
        setOverlayActive(false);
        runningRef.current = false;
      });
  }, [navigation, overlayOpacity, contentTranslateY, reduceMotion]);

  return (
    <View style={styles.root}>
      <ImageBackground source={bgSource} style={styles.bg} resizeMode="cover">
        <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

        <Animated.View style={[styles.content, { transform: [{ translateY: contentTranslateY }] }]}>
          <Text style={styles.hello}>Hello!</Text>
          <Text style={styles.welcome}>Welcome to Cinesquad</Text>
        </Animated.View>

        <SwipeUpCard onSwipeUp={handleSwipeUp} />

        <Animated.View
          pointerEvents={overlayActive ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, styles.overlayContainer, { opacity: overlayOpacity }]}
          accessibilityElementsHidden={!overlayActive}
          importantForAccessibility={overlayActive ? 'yes' : 'no-hide-descendants'}
        >
          <ImageBackground source={bgSource} style={styles.bg} resizeMode="cover" />
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, width: '100%', height: '100%' },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.18,
    justifyContent: 'flex-start',
  },

  hello: {
    fontSize: Math.round(Math.min(width, height) * 0.12),
    lineHeight: Math.round(Math.min(width, height) * 0.11),
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '700',
  },

  welcome: {
    fontSize: Math.round(Math.min(width, height) * 0.035),
    lineHeight: Math.round(Math.min(width, height) * 0.04),
    color: 'rgba(255,255,255,0.95)',
  },

  overlayContainer: {
    zIndex: Platform.OS === 'android' ? 9999 : 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // image covers background
  },
});

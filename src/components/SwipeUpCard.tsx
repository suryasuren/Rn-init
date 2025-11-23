import React, { useRef, useCallback, useState } from 'react';
import {
  Animated,
  PanResponder,
  View,
  Text,
  Platform,
  InteractionManager,
  AccessibilityRole,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SCREEN_HEIGHT } from '../styles/global';

type Props = {
  onSwipeUp?: () => void; 
  label?: string;
  triggerThreshold?: number;
};

export default function SwipeUpCard({
  onSwipeUp,
  label = 'LOGIN / REGISTER',
  triggerThreshold = -120,
}: Props) {

  const translateY = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const overlayTranslate = translateY.interpolate({
    inputRange: [-SCREEN_HEIGHT, 0],
    outputRange: [0, SCREEN_HEIGHT],
    extrapolate: 'clamp',
  });

  const overlayOpacity = translateY.interpolate({
    inputRange: [-SCREEN_HEIGHT * 0.9, -SCREEN_HEIGHT * 0.3, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const cardOpacity = translateY.interpolate({
    inputRange: [-SCREEN_HEIGHT * 0.6, 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        !isAnimating && Math.abs(gestureState.dy) > 6 && gestureState.dy < 0,
      onPanResponderMove: (_, gestureState) => {
        const y = Math.max(-SCREEN_HEIGHT, Math.min(0, gestureState.dy));
        translateY.setValue(y);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy <= triggerThreshold) {
          setIsAnimating(true);

          Animated.timing(translateY, {
            toValue: -SCREEN_HEIGHT,
            duration: 350,
            useNativeDriver: true,
          }).start(() => {
            InteractionManager.runAfterInteractions(() => {
              try {
                onSwipeUp && onSwipeUp();
              } finally {

                translateY.setValue(0);
                setIsAnimating(false);
              }
            });
          });
        } else {

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  useFocusEffect(
    useCallback(() => {
      translateY.setValue(0);
      setIsAnimating(false);
      return undefined;
    }, [translateY])
  );

  return (
    <View
      style={{
        ...StyleSheetAbsoluteFillBottom,
      }}
      pointerEvents="box-none"
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: SCREEN_HEIGHT,
          backgroundColor: '#fff',
          zIndex: 60,
          transform: [{ translateY: overlayTranslate }],
          opacity: overlayOpacity,
        }}
      />

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: '100%',
          alignItems: 'center',
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 0,
          right: 0,
          zIndex: 70,
          transform: [{ translateY }],
          opacity: cardOpacity,
        }}
        accessibilityRole={'adjustable' as AccessibilityRole}
        accessible
      >
        <View
          style={{
            width: '92%',
            paddingVertical: 18,
            paddingHorizontal: 18,
            borderRadius: 18,
            backgroundColor: '#ffffff',
            elevation: 6,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 10,
            alignItems: 'center',
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, lineHeight: 20, color: '#8b0f0f' }}>⌃⌃</Text>
          </View>

          <Text style={{ fontSize: 12, marginTop: 2, opacity: 0.8, color: '#222' }}>Swipe Up to</Text>
          <Text style={{ fontSize: 16, marginTop: 6, fontWeight: '800', color: '#7a0000', letterSpacing: 0.8 }}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const StyleSheetAbsoluteFillBottom = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'flex-end' as const,
  alignItems: 'center' as const,
  zIndex: 50,
};

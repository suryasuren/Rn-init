import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';

const PACKAGED_BG = require('../assets/welcome-bg.png') as ImageSourcePropType;

type Props = {
  children?: React.ReactNode;
  source?: ImageSourcePropType;
};

export default function WelcomeBackGround({ children, source }: Props) {
  const bg: ImageSourcePropType = source ?? PACKAGED_BG;

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      <View style={styles.inner}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    paddingTop: 24,
  },
});

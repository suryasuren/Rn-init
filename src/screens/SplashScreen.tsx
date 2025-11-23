import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  ImageSourcePropType,
  StyleSheet,
} from "react-native";

const { width, height } = Dimensions.get("window");

const FALLBACK_BG: ImageSourcePropType = {
  uri: "file:///mnt/data/2326d4f2-ff2c-4113-be35-fc3b5b8003ed.png",
};

type SplashProps = {
  title?: string;
  subtitle?: string;
  backgroundSource?: ImageSourcePropType | null;
  onReady?: () => void;
  autoHideMs?: number;
  logoSizePct?: number;
  fontFamily?: string | null;
};

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export default function SplashScreen({
  title = "CinemaSquad",
  subtitle = "Play. Book. Enjoy.",
  backgroundSource = null,
  onReady = () => {},
  autoHideMs = 2800,
  logoSizePct = 0.2,
  fontFamily = "Poppins-Black",
}: SplashProps) {
  const mountedRef = useRef(true);

  // Entrance group
  const groupTranslateY = useRef(new Animated.Value(12)).current;
  const groupOpacity = useRef(new Animated.Value(0)).current;

  // Logo entrance
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoTranslateY = useRef(new Animated.Value(8)).current;

  // Subtitle animation
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleScale = useRef(new Animated.Value(0.98)).current;

  // Title chars + display
  const titleChars = title.split("");
  const [displayChars, setDisplayChars] = useState<string[]>(
    titleChars.map(() => "")
  );
  const displayRef = useRef<string[]>(displayChars);
  // keep ref in sync
  useEffect(() => {
    displayRef.current = displayChars;
  }, [displayChars]);

  // Per-char anims (native-driver safe)
  const charScaleAnims = useRef<Animated.Value[]>(
    titleChars.map(() => new Animated.Value(0.92))
  ).current;
  const charOpacityAnims = useRef<Animated.Value[]>(
    titleChars.map(() => new Animated.Value(0.4))
  ).current;

  // timers / refs
  const intervalRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  // tuned timings for slow, smooth & neat shuffle
  const tickMs = 120; 
  const baseRevealDelay = 320;
  const perCharStagger = 110;
  const jitterMax = 40;
  const changeChance = 0.28; 

  const randomLetter = (targetChar: string) => {
    if (targetChar === " ") return " ";
    const rnd = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    return targetChar === targetChar.toUpperCase() ? rnd.toUpperCase() : rnd;
  };

  const animateCharReveal = (idx: number) => {
    const s = charScaleAnims[idx];
    const o = charOpacityAnims[idx];
    s.setValue(1.06);
    o.setValue(1);
    Animated.parallel([
      Animated.timing(s, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(o, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    mountedRef.current = true;

    const start = Date.now();
    const revealTimes = titleChars.map((_, idx) => {
      const jitter = Math.floor((Math.random() - 0.5) * jitterMax);
      return start + baseRevealDelay + idx * perCharStagger + jitter;
    });

    const initial = titleChars.map((t) => (t === " " ? " " : randomLetter(t)));
    setDisplayChars(initial);
    displayRef.current = initial;


    intervalRef.current = (setInterval(() => {
      if (!mountedRef.current) return;
      const now = Date.now();
      const next = displayRef.current.slice();
      let allRevealed = true;

      for (let i = 0; i < titleChars.length; i++) {
        if (now >= revealTimes[i]) {
          if (next[i] !== titleChars[i]) {
            next[i] = titleChars[i];
            animateCharReveal(i);
          }
        } else {
          allRevealed = false;
          if (Math.random() < changeChance || next[i] === "" || next[i] === titleChars[i]) {
            next[i] = randomLetter(titleChars[i]);
          }
        }
      }

      setDisplayChars(() => {
        displayRef.current = next;
        return next;
      });

      if (allRevealed && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, tickMs) as unknown) as number;

    hideTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      onReady && onReady();
    }, autoHideMs);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(groupOpacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(groupTranslateY, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 420, easing: Easing.out(Easing.back(0.6)), useNativeDriver: true }),
      ]),
      Animated.delay(120),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(subtitleScale, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }),
      ]).start();
    });

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

  }, []);

  const bgSource = backgroundSource ?? FALLBACK_BG;
  const logoSize = Math.round(Math.min(width, height) * logoSizePct);
  const titleFontSize = Math.round(Math.min(width, height) * 0.076);
  const subtitleFontSize = Math.round(Math.min(width, height) * 0.028);

  return (
    <ImageBackground source={bgSource} resizeMode="cover" style={styles.background}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />

      <AnimatedView style={[styles.centerContainer, { opacity: groupOpacity, transform: [{ translateY: groupTranslateY }] }]}>
        <AnimatedView
          style={[
            styles.logoWrap,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: Math.round(logoSize / 2),
              transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
            },
          ]}
        >
          <View style={styles.logoInner} />
        </AnimatedView>

        <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
          <View style={styles.titleRow}>
            {displayChars.map((ch, i) => {
              const scaleVal = charScaleAnims[i];
              const opVal = charOpacityAnims[i];
              return (
                <AnimatedText
                  key={`c-${i}`}
                  style={[
                    {
                      color: "#fff",
                      fontSize: titleFontSize,
                      fontWeight: "900",
                      letterSpacing: 1.0,
                      textAlign: "center",
                      marginHorizontal: titleChars[i] === " " ? 8 : 0,
                      transform: [{ scale: scaleVal }],
                      opacity: opVal,
                      textShadowColor: "rgba(0,0,0,0.55)",
                      textShadowOffset: { width: 0, height: 6 },
                      textShadowRadius: 12,
                      fontFamily: fontFamily || undefined,
                    },
                  ]}
                  accessibilityRole={i === 0 ? "header" : undefined}
                >
                  {ch || " "}
                </AnimatedText>
              );
            })}
          </View>
        </View>

        <AnimatedText
          style={{
            marginTop: 10,
            color: "rgba(255,255,255,0.95)",
            fontSize: subtitleFontSize,
            fontWeight: "700",
            letterSpacing: 0.28,
            textAlign: "center",
            opacity: subtitleOpacity,
            transform: [{ scale: subtitleScale }],
            fontFamily: fontFamily ? fontFamily.replace(/-Black|-ExtraBold|-Black/, "-SemiBold") : undefined,
          }}
          numberOfLines={1}
        >
          {subtitle}
        </AnimatedText>
      </AnimatedView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.34)" },
  centerContainer: { alignItems: "center", justifyContent: "center", paddingHorizontal: 26 },
  logoWrap: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 22, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowRadius: 20, elevation: 14 },
  logoInner: { width: "60%", height: "60%", backgroundColor: "#000", opacity: 0.06, borderRadius: 999 },
  titleRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center" },
});

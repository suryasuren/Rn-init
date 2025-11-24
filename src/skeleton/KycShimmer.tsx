import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";
import { KycSkeletonProps } from "../types/types";

export default function KycShimmer({ style, size = "normal", variant = "form" }: KycSkeletonProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const rowHeight = size === "large" ? 20 : 14;
  const spacer = size === "large" ? 14 : 10;

  return (
    <View style={[styles.container, style]}>
      {/* Header (small avatar / title) */}
      <View style={styles.headerRow}>
        <View style={[styles.avatar, size === "large" ? styles.avatarLarge : undefined]} />
        <View style={styles.headerText}>
          <View style={[styles.line, { width: "56%", height: rowHeight, marginBottom: 6 }]} />
          <View style={[styles.line, { width: "36%", height: rowHeight * 0.9 }]} />
        </View>
      </View>

      {/* One or two card blocks, each with title + 3 lines (simulating inputs) */}
      <View style={styles.card}>
        <View style={[styles.cardTitle, { height: rowHeight, marginBottom: spacer / 2 }]} />
        <View style={[styles.input, { height: rowHeight, marginBottom: spacer }]} />
        <View style={[styles.input, { height: rowHeight, marginBottom: spacer }]} />
        <View style={[styles.input, { height: rowHeight }]} />
      </View>

      <View style={styles.card}>
        <View style={[styles.cardTitle, { height: rowHeight, marginBottom: spacer / 2 }]} />
        <View style={[styles.input, { height: rowHeight, marginBottom: spacer }]} />
        <View style={[styles.input, { height: rowHeight, marginBottom: spacer }]} />
        <View style={[styles.input, { height: rowHeight }]} />
      </View>

      {/* Contact card */}
      <View style={styles.card}>
        <View style={[styles.cardTitle, { height: rowHeight, marginBottom: spacer / 2 }]} />
        <View style={[styles.input, { height: rowHeight, marginBottom: spacer }]} />
        <View style={[styles.input, { height: rowHeight }]} />
      </View>

      {/* Shimmer stripe overlay - positioned absolute and covers whole component */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
          // make the stripe slightly taller on large variant
          size === "large" ? { height: 160 } : undefined,
        ]}
      />
    </View>
  );
}

const BASE = "#EFEFEF";
const HIGHLIGHT = "rgba(255,255,255,0.7)";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: BASE,
    marginRight: 12,
  },
  avatarLarge: { width: 72, height: 72, borderRadius: 12 },

  headerText: {
    flex: 1,
  },

  line: {
    backgroundColor: BASE,
    borderRadius: 8,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    // subtle shadow for parity with real card
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    width: "40%",
    backgroundColor: BASE,
    borderRadius: 8,
  },

  input: {
    width: "100%",
    backgroundColor: BASE,
    borderRadius: 8,
  },

  shimmer: {
    position: "absolute",
    left: -300,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: HIGHLIGHT,
    opacity: 0.95,
    // rotate slightly for a natural look (optional)
    transform: [{ rotate: "8deg" }],
  },
});

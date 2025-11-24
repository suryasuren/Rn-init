import React, { useEffect, useRef } from "react";
import { View, SafeAreaView, ScrollView, Animated, Easing, Platform, StyleSheet, ViewStyle, StyleProp } from "react-native";

export function Shimmer({ style }: { style?: StyleProp<ViewStyle> }) {
  const translate = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    let mounted = true;
    const run = () => {
      if (!mounted) return;
      translate.setValue(-1);
      Animated.timing(translate, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (mounted) run();
      });
    };
    run();
    return () => {
      mounted = false;
      translate.stopAnimation();
    };
  }, [translate]);

  const shimmerStyle = {
    transform: [
      {
        translateX: translate.interpolate({
          inputRange: [-1, 1],
          outputRange: [-220, 220],
        }),
      },
    ],
  };

  return <Animated.View pointerEvents="none" style={[styles.shimmer, style, shimmerStyle]} />;
}

export function SkeletonProfile({ avatarSize, contentPadding }: { avatarSize: number; contentPadding: number }) {
  const blockHeight = 44;
  const smallBlock = 28;
  const gap = 12;

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === "android" ? 8 : 0 }]}>
      <View style={{ paddingHorizontal: contentPadding, paddingTop: 14 }}>
        <View style={styles.titleSkeleton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: contentPadding, paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.centeredTop, { marginBottom: 18 }]}>
          <View
            style={[
              styles.avatarSkeleton,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: Math.max(12, Math.floor(avatarSize * 0.15)),
              },
            ]}
          />
          <View style={{ height: 12 }} />
          <View style={[styles.skelBlock, { width: Math.min(220, avatarSize * 2), height: smallBlock }]} />
        </View>

        {/* contact card */}
        <View style={[styles.sectionCard]}>
          <View style={{ position: "relative", overflow: "hidden" }}>
            <View style={[styles.skelBlock, { width: "50%", height: blockHeight }]} />
            <View style={[styles.skelBlock, { width: "100%", height: blockHeight, marginTop: gap }]} />
            <Shimmer style={{ position: "absolute", left: -120, top: 0, bottom: 0, right: -120 }} />
          </View>
        </View>

        {/* personal card */}
        <View style={[styles.sectionCard]}>
          <View style={{ position: "relative", overflow: "hidden" }}>
            <View style={[styles.skelBlock, { width: "40%", height: smallBlock }]} />
            <View style={[styles.rowVertical, { marginTop: gap }]}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={[styles.skelBlock, { flex: 1, height: blockHeight }]} />
                <View style={[styles.skelBlock, { flex: 1, height: blockHeight }]} />
              </View>
              <View style={[styles.skelBlock, { width: "70%", height: blockHeight, marginTop: gap }]} />
              <View style={{ flexDirection: "row", gap: 12, marginTop: gap }}>
                <View style={[styles.skelBlock, { flex: 1, height: blockHeight }]} />
                <View style={[styles.skelBlock, { flex: 1, height: blockHeight }]} />
                <View style={[styles.skelBlock, { flex: 1, height: blockHeight }]} />
              </View>
            </View>

            <Shimmer style={{ position: "absolute", left: -160, top: 0, bottom: 0, right: -160 }} />
          </View>
        </View>

        {/* address card */}
        <View style={[styles.sectionCard]}>
          <View style={{ position: "relative", overflow: "hidden" }}>
            <View style={[styles.skelBlock, { width: "55%", height: smallBlock }]} />
            <View style={{ marginTop: gap }} />
            <View style={[styles.skelBlock, { height: blockHeight }]} />
            <View style={{ height: gap }} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={[styles.skelBlock, { flex: 1, height: blockHeight }]} />
              <View style={[styles.skelBlock, { flex: 1, height: blockHeight }]} />
            </View>
            <View style={{ height: gap }} />
            <View style={[styles.skelBlock, { width: "45%", height: blockHeight }]} />

            <Shimmer style={{ position: "absolute", left: -160, top: 0, bottom: 0, right: -160 }} />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* fixed save button skeleton */}
      <View style={[styles.fixedBottom, { bottom: Platform.OS === "ios" ? 20 : 12, paddingHorizontal: contentPadding }]}>
        <View style={[styles.saveBtn, { width: Math.min(540, 220), height: 52, borderRadius: 26, backgroundColor: "#E8E8E8" }]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F8" },
  scrollContent: { paddingBottom: 140 },

  centeredTop: {
    width: "100%",
    alignItems: "center",
  },

  /* skeleton styles */
  titleSkeleton: {
    width: 160,
    height: 22,
    borderRadius: 8,
    backgroundColor: "#EAEAEA",
  },
  avatarSkeleton: {
    backgroundColor: "#EAEAEA",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  skelBlock: {
    backgroundColor: "#EAEAEA",
    borderRadius: 8,
  },

  shimmer: {
    backgroundColor: "rgba(255,255,255,0.6)",
    width: 120,
    height: "100%",
    opacity: 0.9,
  },

  sectionCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  rowVertical: { flexDirection: "column", gap: 12 },

  fixedBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  saveBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
});

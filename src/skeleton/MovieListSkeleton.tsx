import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from "react-native";
import { MovieListSkeletonProps } from "../types/types";



function Shimmer({ style }: { style?: StyleProp<ViewStyle> }) {
  const translate = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = () => {
      translate.setValue(-1);
      Animated.timing(translate, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }).start(loop);
    };
    loop();
  }, []);

  const x = translate.interpolate({
    inputRange: [-1, 1],
    outputRange: [-320, 320],
  });

  return (
    <Animated.View
      style={[
        wrapperStyles.shimmer,   // <-- FIXED
        style,
        { transform: [{ translateX: x }] },
      ]}
      pointerEvents="none"
    />
  );
}

export default function MovieListSkeleton({ cardWidth, columns, small }: MovieListSkeletonProps) {
  const rows = small ? 1 : 4;
  const GAP = 16;

  const posterW = Math.max(80, Math.floor(cardWidth - 12));
  const posterH = Math.round(posterW * 1.25);

  return (
    <View style={wrapperStyles.wrap}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <View key={rIdx} style={[wrapperStyles.row, { marginBottom: GAP }]}>
          {Array.from({ length: columns }).map((__, cIdx) => (
            <View
              key={cIdx}
              style={[
                wrapperStyles.cardSkel,
                { width: cardWidth, marginRight: cIdx === columns - 1 ? 0 : GAP },
              ]}
            >
              <View style={[wrapperStyles.posterSkel, { width: posterW, height: posterH }]} />
              <View style={wrapperStyles.textShort} />
              <View style={wrapperStyles.textLong} />
              <Shimmer style={wrapperStyles.shimmerOverlay} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const wrapperStyles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    backgroundColor: "#FBFBFB",
  },

  row: {
    flexDirection: "row",
  },

  cardSkel: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    overflow: "hidden",
  },

  posterSkel: {
    backgroundColor: "#E7E7E7",
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "center",
  },

  textShort: {
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginTop: 10,
    marginHorizontal: 8,
    width: "58%",
  },

  textLong: {
    height: 10,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginTop: 8,
    marginHorizontal: 8,
    width: "40%",
    marginBottom: 3,
  },

  shimmer: {
    position: "absolute",
    width: 260,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.55)",
  },

  shimmerOverlay: {
    position: "absolute",
    left: -320,
    right: -320,
    top: 0,
    bottom: 0,
  },
});

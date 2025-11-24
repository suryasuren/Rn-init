import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// SVG - Icons (must accept fill/stroke props)
import HomeIcon from "../assets/svg/Home";
import ContestIcon from "../assets/svg/MyContest";
import CoinsIcon from "../assets/svg/Coins";
import ReportsIcon from "../assets/svg/Reports";
import { CustomTabBarExtraProps, TabDescriptor } from "./types";

const ICON_SIZE = 22;
const TAB_HEIGHT = 66;



export default React.memo(function CustomTabBar(
  props: BottomTabBarProps & CustomTabBarExtraProps
) {
  const { state, descriptors, navigation, activeColor = "#914c4c", inactiveColor = "#757575", backgroundColor = "#FFFFFF" } = props;

  const insets = useSafeAreaInsets();
  const focusedIndex = state.index;

  const scalesRef = useRef<Animated.Value[]>(
    state.routes.map((_, i) => new Animated.Value(i === focusedIndex ? 1.08 : 1))
  );

  React.useEffect(() => {
    scalesRef.current.forEach((v, i) => {
      Animated.timing(v, {
        toValue: i === focusedIndex ? 1.08 : 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    });
  }, [focusedIndex]);

  const tabs: TabDescriptor[] = useMemo(
    () => [
      { key: "Home", name: "Home", Icon: HomeIcon, label: "Home" },
      { key: "Contest", name: "Contest", Icon: ContestIcon, label: "My Contest" },
      { key: "Coins", name: "Coins", Icon: CoinsIcon, label: "Coins" },
      { key: "Reports", name: "Reports", Icon: ReportsIcon, label: "Reports" },
    ],
    []
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
          height: TAB_HEIGHT + insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.inner, { backgroundColor }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const descriptor = descriptors[route.key];
          const { options } = descriptor;

          const TabMeta = tabs.find((t) => t.name === route.name);
          const Icon = TabMeta?.Icon ?? HomeIcon;
          const label = (options.title ?? TabMeta?.label ?? route.name) as string;
          const animatedScale = scalesRef.current[index];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () =>
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });

          const color = isFocused ? activeColor : inactiveColor;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              hitSlop={8}
            >
              <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                <View style={styles.iconWrap}>
                  <Icon width={ICON_SIZE} height={ICON_SIZE} fill={color} stroke={color} />
                </View>
              </Animated.View>

              <Text style={[styles.label, isFocused ? { color: activeColor, fontWeight: "600" } : { color: inactiveColor }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -10,
    // left: 16,
    // right: 16,
    // bottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  inner: {
    flexDirection: "row",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 11,
  },
});

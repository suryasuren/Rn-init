import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  View,
  Easing,
  TouchableOpacity,
  Platform,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Colors } from "../constants/constants";
import { subscribeToast, ToastPayload } from "../utils/Toast";

type ToastType = "success" | "error" | "info";

type ToastMessage = {
  id: number;
  type: ToastType;
  text: string;
};

type ToastContextType = {
  show: (type: ToastType, text: string) => number;
};

const ToastContext = createContext<ToastContextType | null>(null);
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastProvider is missing. Wrap your app with <ToastProvider/>");
  return ctx;
};

const ICON_URI = "file:///mnt/data/8908c0ca-3a1f-4d59-b21c-cc84f1c43e98.png";
const ICON_SOURCE: ImageSourcePropType = { uri: ICON_URI };

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const animated = useRef<Record<number, Animated.Value>>({}).current;

  type TimerId = ReturnType<typeof setTimeout>;
  const hideTimers = useRef<Record<number, TimerId>>({}).current;

  const show = (type: ToastType, text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    animated[id] = new Animated.Value(0);
    setToasts((prev) => [...prev, { id, type, text }]);

    Animated.timing(animated[id], {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const DURATION = 2400;
    const timer = setTimeout(() => hide(id), DURATION);
    hideTimers[id] = timer;
    return id;
  };

  const hide = (id: number) => {
    const t = hideTimers[id];
    if (t !== undefined) {
      clearTimeout(t);
      delete hideTimers[id];
    }

    const anim = animated[id];
    if (!anim) {
      setToasts((prev) => prev.filter((t2) => t2.id !== id));
      return;
    }

    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setToasts((prev) => prev.filter((t2) => t2.id !== id));
      delete animated[id];
    });
  };

  useEffect(() => {
    const unsub = subscribeToast((payload: ToastPayload) => {
      show(payload.type, payload.text);
    });

    return () => {
      unsub();
      Object.values(hideTimers).forEach((t) => clearTimeout(t));
      Object.keys(animated).forEach((k) => {
        const n = Number(k);
        if (!Number.isNaN(n)) delete animated[n];
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topOffset = Platform.OS === "ios" ? 44 : 20;

  const getColor = (key: "primary" | "error" | "secondary", fallback: string) => {
    const colors = Colors as unknown as Record<string, string | undefined>;
    return colors[key] ?? fallback;
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View pointerEvents="box-none" style={styles.container}>
        {toasts.map((t, index) => {
          const anim = animated[t.id] ?? new Animated.Value(1);
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
          const opacity = anim;

          const backgroundColor =
            t.type === "success"
              ? getColor("primary", "#1E88E5")
              : t.type === "error"
              ? getColor("error", "#E53935")
              : getColor("secondary", "#333");

          return (
            <Animated.View
              key={t.id}
              style={[
                styles.toast,
                { backgroundColor },
                {
                  opacity,
                  transform: [{ translateY }],
                  top: topOffset + index * 64,
                },
              ]}
            >
              <Image source={ICON_SOURCE} style={styles.icon} />
              <Text style={styles.toastText} numberOfLines={1} ellipsizeMode="tail" accessibilityRole="text">
                {t.text}
              </Text>
              <TouchableOpacity onPress={() => hide(t.id)} activeOpacity={0.7} style={styles.dismissBtn}>
                <Text style={styles.dismissText}>×</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 8,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10000,
    pointerEvents: "box-none",
  },
  toast: {
    minWidth: "72%",
    maxWidth: "92%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 8,
    resizeMode: "cover",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  toastText: {
    color: Colors.white ?? "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    flexShrink: 1,
    paddingRight: 6,
  },
  dismissBtn: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    lineHeight: 20,
  },
});

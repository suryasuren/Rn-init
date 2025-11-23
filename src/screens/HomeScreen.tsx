// HomeScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import { Colors } from "../constants/constants";

const { width, height } = Dimensions.get("window");

// scaling utilities
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export default function HomeScreen() {
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // clears tokens, triggers navigation re-render
    } catch (err) {
      console.warn("signOut failed", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home 👋</Text>

      <Text style={styles.subtitle}>
        You are now logged in successfully.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// --------------------
// STYLES
// --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(20),
  },

  title: {
    fontSize: moderateScale(26),
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: verticalScale(10),
  },

  subtitle: {
    fontSize: moderateScale(14),
    color: Colors.grayDark,
    textAlign: "center",
    marginBottom: verticalScale(20),
  },

  button: {
    backgroundColor: Colors.primary,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: Colors.white,
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
});


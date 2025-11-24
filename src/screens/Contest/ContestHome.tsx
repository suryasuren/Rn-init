import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ContestHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contest Home</Text>
      <Text style={styles.subtitle}>Your contests will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#555",
  },
});

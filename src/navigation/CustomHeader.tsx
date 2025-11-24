import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import NotifyIcon from "../assets/svg/Notify";
import { NavProp } from "./types";

const AVATAR_URI = require('../assets/profile.png');

export default function CustomHeader() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        
        {/* LEFT - Hamburger */}
        <Pressable style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
          <View style={styles.line} />
          <View style={styles.line} />
          <View style={styles.line} />
        </Pressable>

        {/* RIGHT - Notify + Avatar */}
        <View style={styles.right}>
          <NotifyIcon stroke="#8A8E91" height={20} width={20} />
          <Image source={AVATAR_URI} style={styles.avatar} />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 48 : 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",   // ✅ forces left & right extreme positions
    width: "100%",
  },

  menuBtn: {
    padding: 6,
    paddingRight: 10,
  },

  line: {
    width: 22,
    height: 2,
    backgroundColor: "#333",
    marginVertical: 2,
    borderRadius: 2,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 17,
  },
});

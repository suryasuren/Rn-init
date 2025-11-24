// src/navigation/DrawerNavigator.tsx
import React, { JSX } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";

import AppNavigator from "./AppNavigator";
import SideDrawerBar from "../components/DrawerSection/SideDrawerBar";
import KYCPage from "../screens/MenuScreens/Accounts/KYCPage";
import Permissions from "../screens/MenuScreens/Accounts/Permissions";
import CustomHeader from "./CustomHeader";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { DrawerParamList } from "./types";

const Drawer = createDrawerNavigator<DrawerParamList>();

// Local background image (uploaded file)
const DRAWER_BG = require("../assets/menu-bg.png");

export default function DrawerNavigator(): JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />

      <Drawer.Navigator
        initialRouteName="HomeTabs"
        drawerContent={(props) => (
          <SideDrawerBar {...props} backgroundImage={DRAWER_BG} />
        )}
        screenOptions={{
          drawerType: "front",
          drawerStyle: { backgroundColor: "transparent" },
          swipeEdgeWidth: 40,
        }}
      >
        {/* HomeTabs shows the custom header (only for tabs) */}
        <Drawer.Screen
          name="HomeTabs"
          component={AppNavigator}
          options={{
            header: () => <CustomHeader />,
          }}
        />

        {/* Other drawer screens - no header */}
        <Drawer.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Drawer.Screen name="KYCPage" component={KYCPage} options={{ headerShown: false }} />
        <Drawer.Screen name="Permissions" component={Permissions} options={{ headerShown: false }} />
      </Drawer.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

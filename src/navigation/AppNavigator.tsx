import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MovieStackNavigator from "./MovieStackNavigator";
import ContestStackNavigator from "./ContestStackNavigator";
import Coins from "../screens/Coins";
import Reports from "../screens/Reports";
import CustomTabBar from "./CustomTabBar";
import { AppTabParamList } from "./types";

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          activeColor="#914c4c"
          inactiveColor="#757575"
          backgroundColor="#ffffff"
          
        />
      )}
    >
      <Tab.Screen name="Home" component={MovieStackNavigator} />
      <Tab.Screen name="Contest" component={ContestStackNavigator} options={{ title: "My Contest" }} />
      <Tab.Screen name="Coins" component={Coins} />
      <Tab.Screen name="Reports" component={Reports} />
    </Tab.Navigator>
  );
}

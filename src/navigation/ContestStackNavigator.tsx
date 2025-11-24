import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContestHome from "../screens/Contest/ContestHome";
import { ContestStackParamList } from "./types";

const Stack = createNativeStackNavigator<ContestStackParamList>();

export default function ContestStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContestHome" component={ContestHome} />
    </Stack.Navigator>
  );
}

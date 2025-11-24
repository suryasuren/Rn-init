import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MovieList from "../screens/Movie/MovieList";
import { MovieStackParamList } from "./types";

const Stack = createNativeStackNavigator<MovieStackParamList>();

export default function MovieStackNavigator() {
  return (
    <Stack.Navigator  screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FBFBFB" }, }}>
      <Stack.Screen name="MovieList" component={MovieList} />
    </Stack.Navigator>
  );
}

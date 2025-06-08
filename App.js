import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./Screens/HomeScreen";
import NewLogScreen from "./Screens/NewlogScreen";
import DetailsScreen from "./Screens/DetailsScreen";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "MyDrone Journal" }}
        />
        <Stack.Screen
          name="NewLog"
          component={NewLogScreen}
          options={{ title: "Ny Observation" }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: "Observationsdetaljer" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "../global.css";
import { store } from './redux/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider className="flex-1 bg-white">
      <Provider store={store}>
        <Stack screenOptions={{ headerShown: false }} />
      </Provider>
    </SafeAreaProvider>
  );
}

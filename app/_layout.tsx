import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Appearance } from "react-native";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useEffect(() => {
    Appearance.setColorScheme("light");
    SystemUI.setBackgroundColorAsync("#F5F5F5");
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="requests" options={{ headerShown: false }} />
        <Stack.Screen name="createRequest" options={{ headerShown: false }} />
        <Stack.Screen name="viewRequestForm" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style="light" backgroundColor="#148248" />
    </ThemeProvider>
  );
}
import AuthProvider from "@functional/auth/AuthProvider";
import useAuth from "@functional/auth/useAuth";
import { ThemeProvider } from "@react-navigation/native";
import { DefaultScreenOptions, Theme } from "@style/theme";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Temporarily commented out until fonts are added
  // const [loaded] = useFonts({
  //   [Fonts.regular]: require("@assets/fonts/FiraSans-Regular.ttf"),
  //   [Fonts.semiBold]: require("@assets/fonts/FiraSans-SemiBold.ttf"),
  //   [Fonts.bold]: require("@assets/fonts/FiraSans-Bold.ttf"),
  // });

  // // Expo boilerplate code
  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  // if (!loaded) {
  //   return null;
  // }

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
const AuthGate = () => {
  const { isLoggedIn } = useAuth();
  return (
    <ThemeProvider value={Theme}>
      <Stack screenOptions={{ ...DefaultScreenOptions, headerShown: false }}>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
};



import { AttendancePromptModal } from "@functional/attendance/AttendancePromptModal";
import { AttendanceProvider } from "@functional/attendance/AttendanceProvider";
import { NotificationListener } from "@functional/attendance/NotificationListener";
import AuthProvider from "@functional/auth/AuthProvider";
import useAuth from "@functional/auth/useAuth";
import { LocationProvider } from "@functional/location/LocationProvider";
import { SettingsProvider } from "@functional/settings/SettingsContext";
import { ThemeProvider } from "@react-navigation/native";
import { DefaultScreenOptions, Theme } from "@style/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <AuthGate />
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const AuthGate = () => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {

    if (!isLoggedIn) {
      // Redirect to login when logged out
      router.replace("/(auth)/login");
    } else if (isLoggedIn) {
      // Redirect to app when logged in
      router.replace("/(app)/(tabs)/home");
    }
  }, [isLoggedIn]);

  return (
    <ThemeProvider value={Theme}>
      {isLoggedIn ? (
        // ✅ LocationProvider ONLY when logged in
        <LocationProvider>
          <AttendanceProvider>
            <Stack
              screenOptions={{ ...DefaultScreenOptions, headerShown: false }}
            >
              <Stack.Screen name="(app)" />
            </Stack>
            <NotificationListener />
            <AttendancePromptModal />
          </AttendanceProvider>
        </LocationProvider>
      ) : (
        // ✅ No LocationProvider when not logged in
        <Stack screenOptions={{ ...DefaultScreenOptions, headerShown: false }}>
          <Stack.Screen name="(auth)" />
        </Stack>
      )}
    </ThemeProvider>
  );
};

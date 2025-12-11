import { AttendancePromptModal } from "@functional/attendance/AttendancePromptModal";
import { AttendanceProvider } from "@functional/attendance/AttendanceProvider";
import { NotificationListener } from "@functional/attendance/NotificationListener";
import { LocationProvider } from "@functional/location/LocationProvider";
import AuthProvider from "@functional/auth/AuthProvider";
import useAuth from "@functional/auth/useAuth";
import { ThemeProvider } from "@react-navigation/native";
import { DefaultScreenOptions, Theme } from "@style/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
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
        <LocationProvider>
          <AttendanceProvider>
            <AuthGate />
          </AttendanceProvider>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const AuthGate = () => {
  const { isLoggedIn } = useAuth();

  return (
    <ThemeProvider value={Theme}>
      <Stack screenOptions={{ ...DefaultScreenOptions, headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="(auth)" />
        ) : (
          <Stack.Screen name="(app)" />
        )}
      </Stack>
      {isLoggedIn && <NotificationListener />}
      <AttendancePromptModal />
    </ThemeProvider>
  );
};

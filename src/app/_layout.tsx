import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        redirect
        options={{ href: "/(app)/index" }}
      />
    </Stack>
  );
}


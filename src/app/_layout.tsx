import { Stack } from "expo-router";
import { useState } from "react";
export default function RootLayout() {
  const [isAuth, setIsAuth] = useState(true);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Protected guard={isAuth}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuth}>
        <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

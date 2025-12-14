import { getCurrentAuth, login, logout } from "@core/modules/auth/api.auth";
import { Auth, LoginBody } from "@core/modules/auth/types.auth";
import { API } from "@core/network/supabase/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { resetTaskDefined } from "@functional/location/LocationProvider";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

const GEOFENCE_TASK_NAME = "CALCULATE_RADIUS";

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [auth, setAuth] = useState<Auth | null>(null);

  const fetchAuth = useCallback(async () => {
    try {
      const auth = await getCurrentAuth();
      setAuth(auth);
    } catch {
      setAuth(null);
    }
  }, []);

  useEffect(() => {
    // 1. Bij opstarten app = is user ingelogd of niet?
    const initAuth = async () => {
      try {
        const auth = await getCurrentAuth();
        setAuth(auth);

        // ✅ CRITICAL: If user is NOT logged in at startup, stop any running geofences
        if (!auth?.user?.id) {
          console.log(
            "AuthProvider: User not logged in at startup, clearing geofences"
          );
          await stopGeofences();
        }
      } catch {
        setAuth(null);
        // ✅ Clear geofences on error too
        await stopGeofences();
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();

    // 2. "Watchen" -> is user nog steeds ingelogd of gewijzigd?
    API.auth.onAuthStateChange((event: AuthChangeEvent) => {
      switch (event) {
        case "USER_UPDATED":
        case "TOKEN_REFRESHED":
          fetchAuth();
          break;

        case "SIGNED_OUT":
          setAuth(null);
          // ✅ Stop geofences when user logs out
          stopGeofences();
          break;
      }
    });
  }, [fetchAuth]);

  const handleLogin = async (data: LoginBody) => {
    const auth = await login(data);
    setAuth(auth);
    return auth;
  };

  const handleLogout = async () => {
    // ✅ Stop geofences BEFORE logout
    await stopGeofences();
    await logout();
    setAuth(null);
  };

  const stopGeofences = async () => {
    try {
      console.log("AuthProvider: Stopping geofences...");

      // ✅ Reset task flag FIRST
      resetTaskDefined();

      // ✅ 1. Stop geofencing
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(
        GEOFENCE_TASK_NAME
      );

      if (isTaskRegistered) {
        await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
        console.log("AuthProvider: Geofences stopped");

        // ✅ 2. Unregister the task COMPLETELY
        await TaskManager.unregisterTaskAsync(GEOFENCE_TASK_NAME);
        console.log("AuthProvider: Geofence task unregistered");
      }

      // ✅ 3. Clear ALL user data from AsyncStorage
      await AsyncStorage.removeItem("@userId");
      await AsyncStorage.removeItem("@geofenceDebounce");

      console.log("AuthProvider: All geofence data cleared");
    } catch (error) {
      console.error("Failed to stop geofences:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        isLoggedIn: !!auth,
        auth,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

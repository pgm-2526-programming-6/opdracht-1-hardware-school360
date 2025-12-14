import { getCurrentAuth, login, logout } from "@core/modules/auth/api.auth";
import { Auth, LoginBody } from "@core/modules/auth/types.auth";
import { API } from "@core/network/supabase/api";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

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
    fetchAuth().finally(() => setIsInitialized(true));

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
    await logout();
    setAuth(null);
    // ✅ Stop geofences when user logs out
    stopGeofences();
  };

  const stopGeofences = async () => {
    try {
      const GEOFENCE_TASK_NAME = "CALCULATE_RADIUS";
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(
        GEOFENCE_TASK_NAME
      );
      if (isTaskRegistered) {
        await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
        console.log("Geofences stopped");
      }
    } catch (error) {
      console.warn("Failed to stop geofences:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized: true,
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

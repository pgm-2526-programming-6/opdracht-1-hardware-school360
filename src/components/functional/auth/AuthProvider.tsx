import { getCurrentAuth, login } from "@core/modules/auth/api.auth";
import { Auth, LoginBody } from "@core/modules/auth/types.auth";
import { API } from "@core/network/supabase/api";
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
          break;
      }
    });
  }, [fetchAuth]);

  const handleLogin = async (data: LoginBody) => {
    const auth = await login(data);
    setAuth(auth);
    return auth;
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized: true,
        isLoggedIn: !!auth,
        auth,
        login: handleLogin,
      }}
    >
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

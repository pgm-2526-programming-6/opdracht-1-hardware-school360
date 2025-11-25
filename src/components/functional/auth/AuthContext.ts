import { Auth, LoginBody } from "@core/modules/auth/types.auth";
import { createContext } from "react";

type AuthContextType = {
  isInitialized: boolean;
  isLoggedIn: boolean;
  auth: Auth | null;
  login: (data: LoginBody) => Promise<Auth | null>;
};

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  isLoggedIn: false,
  auth: null,
  login: (data: LoginBody) => Promise.resolve(null),
});
export default AuthContext;

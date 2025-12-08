import { API } from "@core/network/supabase/api";
import { Auth, CreateUserBody, LoginBody } from "./types.auth";

export const registerUser = (user: CreateUserBody) => {
  const { email, password, first_name, last_name } = user;
  return API.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
    },
  });
};

export const getCurrentAuth = async (): Promise<Auth | null> => {
  const {
    data: { session },
  } = await API.auth.getSession();

  if (!session || !session.user) {
    return null;
  }

  const { user } = session;
  const first_name = user.user_metadata?.first_name || "";
  const last_name = user.user_metadata?.last_name || "";

  return {
    user: {
      email: user.email ?? "",
      first_name,
      last_name,
    },
    session,
  };
};

export const login = async ({ email, password }: LoginBody): Promise<Auth> => {
  // 1. Inloggen bij Supabase
  const { data, error } = await API.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data || !data.user) {
    throw new Error("User not found after login");
  }

  // 2. Ook profile informatie opvragen
  const auth = await getCurrentAuth();

  if (!auth) {
    throw new Error("Failed to retrieve auth after login");
  }

  return auth;
};

export const logout = async () => {
  return API.auth.signOut();
};

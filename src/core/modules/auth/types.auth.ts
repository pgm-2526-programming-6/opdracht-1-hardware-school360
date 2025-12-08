import { Session } from "@supabase/supabase-js";

export type Auth = {
  session: Session;
  user: User;
};

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type CreateUserBody = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

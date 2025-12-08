import { API } from "../../network/supabase/api";

export const getProfile = async (profileId: string) => {
  const response = await API.from("profile")
    .select("first_name, last_name")
    .eq("id", profileId)
    .single();
  if (response && response.data) {
    return response.data;
  }
  return null;
};

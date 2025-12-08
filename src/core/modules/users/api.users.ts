import { API } from "../../network/supabase/api";

export const getProfileById = async () => {
  const {
    data: { session },
  } = await API.auth.getSession();
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("User is not authenticated");
  }
  const response = await API.from("profile")
    .select("*")
    .eq("id", userId)
    .single();
  if (response.error) {
    console.error("Error fetching profile:", response.error);
    throw response.error;
  }
  return response.data;
};

export const userSettings = async (
  name: string,
  settings: {
    sounds: boolean;
    vibrations: boolean;
  }
) => {
  const {
    data: { session },
  } = await API.auth.getSession();
  const userId = session?.user.id;
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  if (name === "sounds") {
    const response = await API.from("settings")
      .update({
        profile_id: userId,
        sounds: settings.sounds,
      })
      .eq("profile_id", userId);
    if (response.error) {
      console.error("Error updating settings:", response.error);
      throw response.error;
    }
    return response.data;
  } else if (name === "vibrations") {
    const response = await API.from("settings")
      .update({
        profile_id: userId,
        vibrations: settings.vibrations,
      })
      .eq("profile_id", userId);
    if (response.error) {
      console.error("Error updating settings:", response.error);
      throw response.error;
    }
    return response.data;
  }
};

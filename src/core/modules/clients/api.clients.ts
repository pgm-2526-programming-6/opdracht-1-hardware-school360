import { API } from "../../network/supabase/api";

export const getCampuses = async () => {
  const response = await API.from("Campuses").select("*");
  if (response) {
    console.log("getCampuses response", response.data[0]);
    console.log("Aantal Campussen:", response.data.length);
  }
  return response.data ?? [];
};

export const getAttendanceSessions = async () => {
  const response = await API.from("AttendanceSessions").select(`*,
      profile:profile_id ( first_name, last_name ),
      campus:campus_id ( name )`);
  if (response && response.data) {
    console.log("getAttendanceSessions response", response.data[0]);
    return response.data;
  }
  return [];
};

export const getProfileById = async () => {
  const {
    data: { user },
  } = await API.auth.getUser();
  const userId = user?.id;
  const response = await API.from("profile")
    .select("*")
    .eq("id", userId)
    .single();
  if (response && response.data) {
    console.log("getProfileById response", response.data);
    return response.data;
  }
  return null;
};

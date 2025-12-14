import { API } from "../../network/supabase/api";

export const getCampuses = async () => {
  const response = await API.from("Campuses").select("*");
  return response.data ?? [];
};

export const getAttendanceSessions = async () => {
  const response = await API.from("AttendanceSessions").select(`*,
      profile:profile_id ( first_name, last_name ),
      campus:campus_id ( name )`);
  if (response && response.data) {
    return response.data;
  }
  return [];
};

export const postAttendanceSession = async (
  profileId: string,
  campusId: string
) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeOnly = now.toISOString().split("T")[1].split(".")[0]; // "18:31:35"

  const { data, error } = await API.from("AttendanceSessions").insert([
    {
      profile_id: profileId,
      campus_id: Number(campusId),
      date: today,
      arrival_time: timeOnly,
    },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Failed to insert attendance");
  }

  return data ?? [];
};

export const updateDepartureTime = async (
  profileId: string,
  campusId: string
) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeOnly = now.toISOString().split("T")[1].split(".")[0];

  const { data, error } = await API.from("AttendanceSessions")
    .update({ departure_time: timeOnly })
    .eq("profile_id", profileId)
    .eq("campus_id", Number(campusId))
    .eq("date", today)
    .order("arrival_time", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Supabase update error:", error);
    throw new Error(error.message || "Failed to update departure time");
  }

  return data ?? [];
};

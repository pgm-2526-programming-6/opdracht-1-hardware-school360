import { API } from "../../network/supabase/api";

export const getAttendanceSessions = async () => {
  const response = await API.from("AttendanceSessions").select(`
    id,
    date,
    arrival_time,
    departure_time,
    profile_id,
    campus_id,
    profile:profile_id ( first_name, last_name ),
    campus:campus_id ( name )
  `);
  if (response && response.data) {
    return response.data;
  }
  return [];
};

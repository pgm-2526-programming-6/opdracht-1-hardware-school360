import { API } from "../../network/supabase/api";

export const getCampuses = async () => {
  const response = await API.from("Campuses").select("*");
  if (response) {
    console.log("getCampuses response", response.data[0]);
    console.log("Aantal Campussen:", response.data.length);
  }
  return response.data ?? [];
};
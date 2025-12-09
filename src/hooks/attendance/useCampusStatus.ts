import { API } from "@/src/core/network/supabase/api";
import { useQuery } from "@tanstack/react-query";

export const useCampusStatus = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["campusStatus", userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await API.from("AttendanceSessions")
        .select("*")
        .eq("profile_id", userId)
        .order("arrival_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data && data.departure_time === null;
    },
    enabled: !!userId,
  });
};

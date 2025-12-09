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
        .is("departure_time", null)
        .order("arrival_time", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return !!data;
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
};

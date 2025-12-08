import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { useEffect, useState } from "react";

export const useTotalAttendance = (userId?: string) => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTotalAttendance = async () => {
      try {
        setLoading(true);
        const sessions = await getAttendanceSessions();

        // Filter sessions for current user (all time)
        const userTotalSessions = sessions.filter((session: any) => {
          return session.profile_id === userId;
        });

        setTotalCount(userTotalSessions.length);
      } catch (error) {
        console.error("Error fetching total attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalAttendance();
  }, [userId]);

  return { totalCount, loading };
};

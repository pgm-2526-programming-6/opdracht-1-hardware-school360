import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { useEffect, useState } from "react";

export const useMonthlyAttendance = (userId?: string) => {
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMonthlyAttendance = async () => {
      try {
        setLoading(true);
        const sessions = await getAttendanceSessions();

        // Get the start and end of the current month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        lastDayOfMonth.setHours(23, 59, 59, 999);

        // Filter sessions for current user and current month
        const userMonthlySessions = sessions.filter((session: any) => {
          if (!session.profile_id || !session.date) return false;

          const sessionDate = new Date(session.date);
          return (
            session.profile_id === userId &&
            sessionDate >= firstDayOfMonth &&
            sessionDate <= lastDayOfMonth
          );
        });

        setMonthlyCount(userMonthlySessions.length);
      } catch (error) {
        console.error("Error fetching monthly attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyAttendance();
  }, [userId]);

  return { monthlyCount, loading };
};

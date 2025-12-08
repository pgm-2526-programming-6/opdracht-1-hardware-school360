import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { useEffect, useState } from "react";

export const useWeeklyAttendance = (userId?: string) => {
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [attendedDays, setAttendedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchWeeklyAttendance = async () => {
      try {
        setLoading(true);
        const sessions = await getAttendanceSessions();

        // Get the start of the current week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday
        const monday = new Date(now);
        monday.setDate(now.getDate() + diff);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // Filter sessions for current user and current week
        const userWeeklySessions = sessions.filter((session: any) => {
          if (!session.profile_id || !session.date) return false;

          const sessionDate = new Date(session.date);
          return (
            session.profile_id === userId &&
            sessionDate >= monday &&
            sessionDate <= sunday
          );
        });

        setWeeklyCount(userWeeklySessions.length);

        // Get attended days of the week (0 = Monday, 1 = Tuesday, etc.)
        const daysAttended = userWeeklySessions
          .map((session: any) => {
            const sessionDate = new Date(session.date);
            sessionDate.setHours(0, 0, 0, 0);

            const diffTime = sessionDate.getTime() - monday.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < 5) {
              return diffDays;
            }
            return -1;
          })
          .filter((day: number) => day !== -1);

        setAttendedDays([...new Set(daysAttended)]); // Remove duplicates
      } catch (error) {
        console.error("Error fetching weekly attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyAttendance();
  }, [userId]);

  return { weeklyCount, attendedDays, loading };
};

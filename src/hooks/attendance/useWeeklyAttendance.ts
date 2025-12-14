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
            const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            
            // Convert to our week format: 0 = Monday, 1 = Tuesday, ..., 4 = Friday
            // getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              return -1; // Skip weekends
            }
            
            return dayOfWeek - 1; // Monday (1) -> 0, Tuesday (2) -> 1, etc.
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

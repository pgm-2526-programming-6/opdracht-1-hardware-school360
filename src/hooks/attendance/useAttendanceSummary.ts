import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { useQuery } from "@tanstack/react-query";

export type AttendanceSummary = {
  weeklyCount: number;
  monthlyCount: number;
  totalCount: number;
  attendedDays: number[]; // 0=Mon..4=Fri
};

export const useAttendanceSummary = (userId?: string) => {
  return useQuery<AttendanceSummary>({
    queryKey: ["attendanceSummary", userId],
    enabled: !!userId,
    queryFn: async () => {
      const sessions = await getAttendanceSessions();

      const now = new Date();

      // Month range
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);

      // Week range: Monday..Sunday
      const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const userSessions = sessions.filter((s: any) => s.profile_id === userId);

      const weeklySessions = userSessions.filter((s: any) => {
        const d = new Date(s.date);
        return d >= monday && d <= sunday;
      });

      const monthlySessions = userSessions.filter((s: any) => {
        const d = new Date(s.date);
        return d >= firstDayOfMonth && d <= lastDayOfMonth;
      });

      const daysAttended = weeklySessions
        .filter((s: any) => s.arrival_time && s.departure_time)
        .map((s: any) => {
          const d = new Date(s.date).getDay(); // 0=Sun..6=Sat
          if (d === 0 || d === 6) return -1; // skip weekends
          return d - 1; // 1=Mon->0 .. 5=Fri->4
        })
        .filter((i: number) => i !== -1);

      return {
        weeklyCount: weeklySessions.length,
        monthlyCount: monthlySessions.length,
        totalCount: userSessions.length,
        attendedDays: [...new Set(daysAttended)],
      };
    },
  });
};
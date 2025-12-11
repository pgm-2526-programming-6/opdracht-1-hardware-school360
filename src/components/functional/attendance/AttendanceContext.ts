import { createContext, useContext } from "react";

export interface AttendancePrompt {
  id?: string;
  name?: string;
}

export interface AttendanceContextType {
  activePrompt: AttendancePrompt | null;
  setActivePrompt: (prompt: AttendancePrompt | null) => void;
}

export const AttendanceContext = createContext<
  AttendanceContextType | undefined
>(undefined);

export const useAttendancePrompt = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error(
      "useAttendancePrompt must be used within AttendanceProvider"
    );
  }
  return context;
};

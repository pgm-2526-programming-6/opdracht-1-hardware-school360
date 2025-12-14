import React, { useState } from "react";
import { AttendanceContext, AttendancePrompt } from "./AttendanceContext";

interface AttendanceProviderProps {
  children: React.ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({
  children,
}) => {
  const [activePrompt, setActivePrompt] = useState<AttendancePrompt | null>(
    null
  );

  return (
    <AttendanceContext.Provider value={{ activePrompt, setActivePrompt }}>
      {children}
    </AttendanceContext.Provider>
  );
};

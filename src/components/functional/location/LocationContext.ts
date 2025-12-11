import { createContext, useContext } from "react";

export interface LocationContextType {
  isLocationEnabled: boolean;
  currentLocation: { latitude: number; longitude: number } | null;
  loading: boolean;
  error: string | null;
}

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
};

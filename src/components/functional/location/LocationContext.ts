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
    // ✅ Return default values instead of throwing error
    return {
      isLocationEnabled: false,
      currentLocation: null,
      loading: true,
      error: "LocationProvider not initialized yet",
    };
  }
  return context;
};

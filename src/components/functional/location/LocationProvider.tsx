import {
    getAttendanceSessions,
    getCampuses,
    updateDepartureTime,
} from "@/src/core/modules/campus/api.campus";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useState } from "react";
import { LocationContext, LocationContextType } from "./LocationContext";

const GEOFENCE_TASK_NAME = "CALCULATE_RADIUS";
let lastGeofenceTime: { [key: string]: number } = {};
const GEOFENCE_DEBOUNCE_MS = 30000;
let campusNameMap: { [key: string]: string } = {};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<LocationContextType>({
    isLocationEnabled: false,
    currentLocation: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    let watchRef: any = null;

    const setupLocation = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setState((prev) => ({
            ...prev,
            error: "Location permission not granted",
            loading: false,
          }));
          return;
        }

        const { status: bgStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== "granted") {
          console.warn("Background location permission not granted");
        }

        // Get initial position
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        if (!mounted) return;

        setState((prev) => ({
          ...prev,
          isLocationEnabled: true,
          currentLocation: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          loading: false,
        }));

        // Setup geofences
        const campusData = await getCampuses();
        await registerGeofences(campusData);

        // Watch location changes
        watchRef = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 2000,
            distanceInterval: 0,
          },
          (p) => {
            if (mounted) {
              setState((prev) => ({
                ...prev,
                currentLocation: {
                  latitude: p.coords.latitude,
                  longitude: p.coords.longitude,
                },
              }));
            }
          }
        );
      } catch (error) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            error: (error as Error).message,
            loading: false,
          }));
        }
      }
    };

    setupLocation();

    return () => {
      mounted = false;
      if (watchRef && typeof watchRef.remove === "function") {
        watchRef.remove();
      }
    };
  }, []);

  return (
    <LocationContext.Provider value={state}>
      {children}
    </LocationContext.Provider>
  );
};

const registerGeofences = async (campusData: any[]) => {
  try {
    campusData.forEach((campus) => {
      const id = campus.id != null ? String(campus.id) : campus.name;
      campusNameMap[id] = campus.name;
    });

    const regions = campusData.map((campus) => ({
      latitude: Number(campus.latitude),
      longitude: Number(campus.longitude),
      radius: campus.radius_meters || 50,
      notifyOnEnter: true,
      notifyOnExit: true,
      identifier: campus.id != null ? String(campus.id) : campus.name,
    }));

    if (regions.length > 0) {
      await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
    }
  } catch (error) {
    console.error("Failed to register geofences:", error);
  }
};

// Define geofence task globally
TaskManager.defineTask(
  GEOFENCE_TASK_NAME,
  async ({ data: { eventType, region }, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
      const campusId = region.identifier || "campus";
      const campusName = campusNameMap[campusId] || `Campus ${campusId}`;
      const eventKey = `enter-${campusId}`;
      const now = Date.now();
      const lastTime = lastGeofenceTime[eventKey] || 0;

      if (now - lastTime < GEOFENCE_DEBOUNCE_MS) {
        console.log(`Skipping notification (debounced): ${campusName}`);
        return;
      }

      lastGeofenceTime[eventKey] = now;
      console.log(`Je bent aangekomen bij: ${campusName}`);

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Aangekomen bij ${campusName}`,
            body: "Ben je aanwezig? Antwoord Ja of Nee",
            data: { campusId, campusName, action: "enter" },
            categoryId: "ATTENDANCE",
          },
          trigger: null,
        });
      } catch (e) {
        console.warn("Failed to schedule notification", e);
      }
    }

    if (eventType === Location.GeofencingEventType.Exit) {
      const campusId = region.identifier || "campus";
      const eventKey = `exit-${campusId}`;
      const now = Date.now();
      const lastTime = lastGeofenceTime[eventKey] || 0;

      if (now - lastTime < GEOFENCE_DEBOUNCE_MS) {
        console.log(`Skipping exit notification (debounced)`);
        return;
      }

      lastGeofenceTime[eventKey] = now;
      const campusName = campusNameMap[campusId] || `Campus ${campusId}`;
      console.log(`Je hebt ${campusName} verlaten - processing...`);

      setTimeout(async () => {
        try {
          const userId = await AsyncStorage.getItem("@userId");

          if (userId && campusId) {
            const attendances = await getAttendanceSessions();
            const today = new Date().toISOString().split("T")[0];

            const campusAttendancesToday = attendances
              .filter(
                (a: any) =>
                  a.profile_id === userId &&
                  a.campus_id === Number(campusId) &&
                  a.date === today
              )
              .sort((a: any, b: any) => {
                return (b.arrival_time || "").localeCompare(
                  a.arrival_time || ""
                );
              });

            const activeAttendance = campusAttendancesToday[0];

            if (activeAttendance && !activeAttendance.departure_time) {
              await updateDepartureTime(userId, campusId);

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `${campusName} verlaten`,
                  body: "Je vertrektijd is geregistreerd",
                  data: { campusId, campusName, action: "exit" },
                },
                trigger: null,
              });
              console.log(`Exit notification shown for ${campusName}`);
            }
          }
        } catch (e) {
          console.warn("Failed to handle exit notification", e);
        }
      }, 5000);
    }
  }
);

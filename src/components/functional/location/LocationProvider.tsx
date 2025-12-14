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
const GEOFENCE_DEBOUNCE_MS = 30000;
const GEOFENCE_DEBOUNCE_KEY = "@geofenceDebounce";
let campusNameMap: { [key: string]: string } = {};

// ✅ Get debounce data from AsyncStorage instead of in-memory
const getLastGeofenceTime = async (eventKey: string): Promise<number> => {
  try {
    const data = await AsyncStorage.getItem(GEOFENCE_DEBOUNCE_KEY);
    const debounceMap = data ? JSON.parse(data) : {};
    return debounceMap[eventKey] || 0;
  } catch (e) {
    return 0;
  }
};

const setLastGeofenceTime = async (eventKey: string, time: number) => {
  try {
    const data = await AsyncStorage.getItem(GEOFENCE_DEBOUNCE_KEY);
    const debounceMap = data ? JSON.parse(data) : {};
    debounceMap[eventKey] = time;
    await AsyncStorage.setItem(
      GEOFENCE_DEBOUNCE_KEY,
      JSON.stringify(debounceMap)
    );
  } catch (e) {
    console.warn("Failed to save debounce data", e);
  }
};

// ✅ Define geofence task ONLY once at module load
let taskDefined = false;

const defineGeofenceTask = () => {
  if (taskDefined) return;
  taskDefined = true;

  TaskManager.defineTask(
    GEOFENCE_TASK_NAME,
    async ({ data: { eventType, region }, error }) => {
      if (error) {
        console.log(error);
        return;
      }

      if (eventType === Location.GeofencingEventType.Enter) {
        const campusId = region.identifier || "campus";
        const campusName = campusNameMap[campusId] || `Campus ${campusId}`;
        const eventKey = `enter-${campusId}`;
        const now = Date.now();
        const lastTime = await getLastGeofenceTime(eventKey);

        if (now - lastTime < GEOFENCE_DEBOUNCE_MS) {
          console.log(`Skipping notification (debounced): ${campusName}`);
          return;
        }

        await setLastGeofenceTime(eventKey, now);
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
        const lastTime = await getLastGeofenceTime(eventKey);

        if (now - lastTime < GEOFENCE_DEBOUNCE_MS) {
          console.log(`Skipping exit notification (debounced)`);
          return;
        }

        await setLastGeofenceTime(eventKey, now);
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
};

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
        // ✅ Define geofence task first
        defineGeofenceTask();
        console.log("LocationProvider: Starting location setup...");

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
          setState((prev) => ({
            ...prev,
            error: "Background location permission needed for notifications",
            loading: false,
          }));
          return;
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

        // ✅ Setup geofences
        const campusData = await getCampuses();
        console.log("LocationProvider: Registering geofences...");
        await registerGeofences(campusData);
        console.log("LocationProvider: Geofences registered successfully");

        // Watch location changes
        let lastLocationUpdate = Date.now();
        const MIN_LOCATION_UPDATE_INTERVAL = 1000; // Min 1 second between updates

        watchRef = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 2000,
            distanceInterval: 0,
          },
          (p) => {
            if (!mounted) return;

            // ✅ Debounce location updates to prevent excessive re-renders
            const now = Date.now();
            if (now - lastLocationUpdate < MIN_LOCATION_UPDATE_INTERVAL) {
              return;
            }
            lastLocationUpdate = now;

            setState((prev) => ({
              ...prev,
              currentLocation: {
                latitude: p.coords.latitude,
                longitude: p.coords.longitude,
              },
            }));
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

import useAuth from "@/src/components/functional/auth/useAuth";
import {
  getAttendanceSessions,
  getCampuses,
  postAttendanceSession,
  updateDepartureTime,
} from "@/src/core/modules/clients/api.clients";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../style/colors";

// Dynamically require react-native-maps to avoid bundler/runtime errors in plain Expo Go
let MapsModule: any = null;
try {
  MapsModule = require("react-native-maps");
} catch (err) {
  MapsModule = null;
  console.warn(err);
}

const MapView = MapsModule ? MapsModule.default ?? MapsModule.MapView : null;
const Marker = MapsModule
  ? MapsModule.Marker ?? MapsModule.default?.Marker
  : null;
const PROVIDER_GOOGLE = MapsModule ? MapsModule.PROVIDER_GOOGLE : undefined;
const GEOFENCE_TASK_NAME = "CALCULATE_RADIUS";
const { width } = Dimensions.get("window");

// Track recent geofence events to prevent duplicate notifications
let lastGeofenceTime: { [key: string]: number } = {};
const GEOFENCE_DEBOUNCE_MS = 30000; // 30 seconds

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

TaskManager.defineTask(
  GEOFENCE_TASK_NAME,
  async ({ data: { eventType, region }, error }) => {
    if (error) {
      console.log(error);
      return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
      const campusId = region.identifier || "campus";
      const campusName = region.identifier || "campus";
      const eventKey = `enter-${campusId}`;
      const now = Date.now();
      const lastTime = lastGeofenceTime[eventKey] || 0;

      // Only trigger if 30 seconds have passed since last notification
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
        console.warn("Failed to schedule notification from geofence task", e);
      }
    }

    if (eventType === Location.GeofencingEventType.Exit) {
      const campusId = region.identifier || "campus";
      const eventKey = `exit-${campusId}`;
      const now = Date.now();
      const lastTime = lastGeofenceTime[eventKey] || 0;

      // Only trigger if 30 seconds have passed since last notification
      if (now - lastTime < GEOFENCE_DEBOUNCE_MS) {
        console.log(`Skipping exit notification (debounced)`);
        return;
      }

      lastGeofenceTime[eventKey] = now;
      const campusName = region.identifier || "campus";
      console.log(`Je hebt ${campusName} verlaten - processing...`);

      // Wait 5 seconds, then update departure time and show exit notification
      setTimeout(async () => {
        try {
          // Get userId from AsyncStorage to check if user is actually checked in
          const userId = await AsyncStorage.getItem("@userId");

          if (userId && campusId) {
            // Get attendance data from database
            const attendances = await getAttendanceSessions();

            // Check if there's an active attendance for this campus today
            const today = new Date().toISOString().split("T")[0];

            // Filter attendances for this campus today, then get the most recent one
            const campusAttendancesToday = attendances
              .filter(
                (a: any) =>
                  a.profile_id === userId &&
                  a.campus_id === Number(campusId) &&
                  a.date === today
              )
              .sort((a: any, b: any) => {
                // Sort by arrival_time descending (most recent first)
                return (b.arrival_time || "").localeCompare(
                  a.arrival_time || ""
                );
              });

            // Get the most recent attendance
            const activeAttendance = campusAttendancesToday[0];

            // Only update if user is actually checked in (no departure_time yet)
            if (activeAttendance && !activeAttendance.departure_time) {
              // Update departure time in database
              await updateDepartureTime(userId, campusId);
              console.log(
                `Departure time updated for ${campusName}, userId: ${userId}`
              );

              // Show notification
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `${campusName} verlaten`,
                  body: "Je vertrektijd is geregistreerd",
                  data: { campusId, campusName, action: "exit" },
                },
                trigger: null,
              });
              console.log(`Exit notification shown for ${campusName}`);
            } else {
              console.log(
                `No active attendance for ${campusName}, skipping notification and update`
              );
            }
          }
        } catch (e) {
          console.warn("Failed to handle exit notification", e);
        }
      }, 5000);
    }
  }
);
export default function Campuses() {
  const { auth } = useAuth();
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [activePrompt, setActivePrompt] = useState<{
    id?: string;
    name?: string;
  } | null>(null);
  const mapRef = useRef<any>(null);
  const watchRef = useRef<any>(null);
  const lastCoordsRef = useRef<{ latitude: number; longitude: number } | null>(
    null
  );

  // Haversine distance (meters) between two lat/lng points
  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // meters
  };

  const formatDistance = (meters: number) => {
    if (!Number.isFinite(meters)) return "—";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `≈ ${(meters / 1000).toFixed(1)} km`;
  };

  useEffect(() => {
    // Register notification category and response listener
    let respSub: any = null;
    const setupNotifications = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("Notification permission status:", status);

        if (status !== "granted") {
          console.warn("Notification permissions not granted");
        }

        // Define actions for attendance prompt
        await Notifications.setNotificationCategoryAsync("ATTENDANCE", [
          {
            identifier: "YES",
            buttonTitle: "Ja",
            options: { opensAppToForeground: true },
          },
          {
            identifier: "NO",
            buttonTitle: "Nee",
            options: { opensAppToForeground: true },
          },
        ]);

        console.log("Notification category set");

        respSub = Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            const actionId = response.actionIdentifier;
            const data = response.notification.request.content.data || {};

            // Handle exit event (automatic departure time update)
            if (data.action === "exit") {
              const userId = auth?.user?.id;
              if (userId && data.campusId) {
                try {
                  await updateDepartureTime(userId, data.campusId);
                  console.log("Departure time updated");
                } catch (e) {
                  console.error("Failed to update departure time", e);
                }
              }
              return;
            }

            // Handle enter event actions
            if (actionId === "YES") {
              console.log("Gebruiker kiest JA voor aanwezig:", data);
              // TODO: stuur naar API of bewaar lokaal
            } else if (actionId === "NO") {
              console.log("Gebruiker kiest NEE voor aanwezig:", data);
            } else {
              // gebruiker tikte op notificatie body -> toon in-app prompt
              setActivePrompt({ id: data.campusId, name: data.campusName });
            }
          }
        );
      } catch (e) {
        console.warn("Notification setup failed", e);
      }
    };
    setupNotifications();

    let mounted = true;

    const setup = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (!mounted) return;
        const newRegion = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setLoading(false);

        try {
          const campusData = await getCampuses();
          console.log("getCampuses result count:", campusData.length);

          if (mounted && Array.isArray(campusData)) {
            setCampuses(campusData);

            // Registreer geofences met campus data
            await registerGeofences(campusData);

            // Try to fit the map to coordinates after campuses are set.
            // Build a coordinates array with numeric lat/lng, supporting different DB field names.
            try {
              const coords = campusData
                .map((c: any) => {
                  const latitude = c.latitude;
                  const longitude = c.longitude;
                  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
                    return null;
                  return { latitude, longitude };
                })
                .filter(Boolean) as { latitude: number; longitude: number }[];

              if (
                coords.length &&
                mapRef.current &&
                typeof mapRef.current.fitToCoordinates === "function"
              ) {
                // Delay slightly to let the map mount/update
                setTimeout(() => {
                  try {
                    mapRef.current.fitToCoordinates(coords, {
                      edgePadding: {
                        top: 80,
                        right: 80,
                        bottom: 180,
                        left: 80,
                      },
                      animated: true,
                    });
                  } catch (e) {
                    console.warn("fitToCoordinates failed", e);
                  }
                }, 400);
              }
            } catch (e) {
              console.warn("compute coords error", e);
            }
          }
        } catch (err) {
          console.warn("getCampuses error", err);
        }

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            // update roughly every 2 seconds
            timeInterval: 2000,
            // small distance interval to still get frequent updates
            distanceInterval: 0,
          },
          (p: any) => {
            if (!mounted) return;

            const newLat = p.coords.latitude;
            const newLng = p.coords.longitude;

            // Only update region state when location changed meaningfully
            const last = lastCoordsRef.current;
            if (last) {
              const moved = haversineDistance(
                last.latitude,
                last.longitude,
                newLat,
                newLng
              );
              // if moved less than 0.5 meter, skip state update to avoid churn
              if (moved < 0.5) return;
            }

            lastCoordsRef.current = { latitude: newLat, longitude: newLng };

            setRegion((r) =>
              r
                ? {
                    ...r,
                    latitude: newLat,
                    longitude: newLng,
                  }
                : {
                    latitude: newLat,
                    longitude: newLng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            );
          }
        );
        watchRef.current = sub;
      } catch (e) {
        console.warn("expo-location error", e);
        setLoading(false);
      }
    };

    setup();

    return () => {
      mounted = false;
      try {
        if (watchRef.current && typeof watchRef.current.remove === "function")
          watchRef.current.remove();
      } catch (e) {
        // ignore
      }
      try {
        if (respSub && typeof respSub.remove === "function") respSub.remove();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const registerGeofences = async (campusData) => {
    try {
      // 1. Vraag background location permission
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        console.warn("Foreground location permission not granted");
        return;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        console.warn("Background location permission not granted");
        return;
      }

      console.log("Location permissions granted");

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
        console.log(`Succesvol ${regions.length} geofences geregistreerd.`);
      }
    } catch (error) {
      console.error("Failed to register geofences:", error);
    }
  };

  const handlePromptAnswer = async (answer: "YES" | "NO") => {
    if (!activePrompt) return;

    if (answer === "YES") {
      try {
        const userId = auth?.user?.id;
        const campusId = activePrompt.id;

        if (!userId) {
          console.warn("User not logged in");
          return;
        }

        // Save userId to AsyncStorage for use in background tasks
        await AsyncStorage.setItem("@userId", userId);

        await postAttendanceSession(userId, campusId);
      } catch (e) {
        console.error("Failed to register attendance", e);
      }
    }
    setActivePrompt(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrap}>
        {MapView && region ? (
          // @ts-ignore
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.mapWrap}
            showsUserLocation={true}
            region={region || undefined}
            initialRegion={
              region || {
                latitude: 50.8503,
                longitude: 4.3517,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }
            }
          >
            {campuses.map((campus: any) => {
              // Support multiple possible DB field names and coerce to Number
              const latitude = campus.latitude;
              const longitude = campus.longitude;

              return (
                // @ts-ignore
                <Marker
                  key={campus.id}
                  coordinate={{ latitude, longitude }}
                  title={campus.name}
                >
                  {/* Hier komt je gestylde component */}
                  <View>
                    <Image
                      source={require("../../../assets/images/ios-light.png")}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    />
                  </View>
                </Marker>
              );
            })}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Text style={{ textAlign: "center", padding: 18 }}>
                  Waiting for location… Zorg dat je toestemming geeft en dat
                  locatie aanstaat.
                </Text>
                <View style={[styles.pin, { left: 40, top: 24 }]}>
                  <Entypo name="location-pin" size={28} color="#fff" />
                </View>
                <View style={[styles.pin, { left: width / 2 - 24, top: 8 }]}>
                  <Entypo name="location-pin" size={28} color="#fff" />
                </View>
                <View style={[styles.pin, { right: 48, top: 64 }]}>
                  <Entypo name="location-pin" size={28} color="#fff" />
                </View>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.panel}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>School Campuses</Text>
          <Text style={styles.subtitle}>Select a campus to view details</Text>

          {campuses.map((campus: any) => {
            // Compute distance to user's current region if available
            let distanceStr = "—";
            if (region) {
              const meters = haversineDistance(
                region.latitude,
                region.longitude,
                campus.latitude,
                campus.longitude
              );
              distanceStr = formatDistance(meters);
            }

            return (
              <TouchableOpacity
                key={campus.id}
                style={styles.card}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.iconBox}>
                    <Entypo name="location" size={20} color={COLORS.primary} />
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardTitle}>Campus {campus.name}</Text>
                  <Text style={styles.cardMeta}>Adressinformations</Text>
                  <Text style={styles.distance}>{distanceStr}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* In-app prompt shown when user taps notification */}
      {activePrompt && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
          pointerEvents="box-none"
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 18,
              borderRadius: 10,
              width: "90%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>
              Ben je aanwezig bij {activePrompt.name}?
            </Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => handlePromptAnswer("YES")}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Ja</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePromptAnswer("NO")}
                style={{
                  backgroundColor: "#eee",
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Nee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapWrap: {
    height: 500,
    backgroundColor: COLORS.primaryLight,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  pin: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 0,
    paddingTop: 18,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardLeft: {
    width: 56,
    alignItems: "center",
    marginRight: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardRight: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  distance: {
    marginTop: 6,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});

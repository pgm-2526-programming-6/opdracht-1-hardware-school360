import { useAttendancePrompt } from "@/src/components/functional/attendance/AttendanceContext";
import { useLocation } from "@/src/components/functional/location/LocationContext";
import useAuth from "@/src/components/functional/auth/useAuth";
import { getCampuses } from "@/src/core/modules/campus/api.campus";
import { Entypo } from "@expo/vector-icons";
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
const { width } = Dimensions.get("window");
export default function Campuses() {
  const { auth } = useAuth();
  const { currentLocation, loading } = useLocation();
  const { setActivePrompt } = useAttendancePrompt();
  const [campuses, setCampuses] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
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
    // Fetch campuses data
    const fetchCampuses = async () => {
      try {
        const data = await getCampuses();
        setCampuses(data);

        // Try to fit map to campus coordinates
        if (data.length > 0 && mapRef.current) {
          const coords = data
            .map((c: any) => ({
              latitude: Number(c.latitude),
              longitude: Number(c.longitude),
            }))
            .filter(
              (c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
            );

          if (coords.length > 0) {
            setTimeout(() => {
              try {
                mapRef.current?.fitToCoordinates(coords, {
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
        }
      } catch (err) {
        console.warn("getCampuses error", err);
      }
    };

    fetchCampuses();
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

      // Populate campus name mapping for use in notifications
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
        {MapView && currentLocation ? (
          // @ts-ignore
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.mapWrap}
            showsUserLocation={true}
            region={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {campuses.map((campus: any) => {
              const latitude = campus.latitude;
              const longitude = campus.longitude;

              return (
                // @ts-ignore
                <Marker
                  key={campus.id}
                  coordinate={{ latitude, longitude }}
                  title={campus.name}
                >
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
            // Compute distance to user's current location if available
            let distanceStr = "—";
            if (currentLocation) {
              const meters = haversineDistance(
                currentLocation.latitude,
                currentLocation.longitude,
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

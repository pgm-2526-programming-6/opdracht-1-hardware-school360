import React, { useEffect, useRef, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { COLORS } from "../../../style/colors";
import { getCampuses } from "@/src/core/modules/clients/api.clients";
import * as TaskManager from "expo-task-manager";

// Dynamically require react-native-maps to avoid bundler/runtime errors in plain Expo Go
let MapsModule: any = null;
try {
  MapsModule = require("react-native-maps");
} catch (err) {
  MapsModule = null;
}

const MapView = MapsModule ? MapsModule.default ?? MapsModule.MapView : null;
const Marker = MapsModule
  ? MapsModule.Marker ?? MapsModule.default?.Marker
  : null;
const PROVIDER_GOOGLE = MapsModule ? MapsModule.PROVIDER_GOOGLE : undefined;
const GEOFENCE_TASK_NAME = "CALCULATE_RADIUS";
const { width } = Dimensions.get("window");

TaskManager.defineTask(
  GEOFENCE_TASK_NAME,
  ({ data: { eventType, region }, error }) => {
    if (error) {
      console.log(error);
      return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
      const campusName = region.identifier || "campus";
      console.log(`Je bent aangekomen bij: ${campusName}`);
    }
  }
);
export default function Campuses() {
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [campuses, setCampuses] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
  const watchRef = useRef<any>(null);

  useEffect(() => {
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
          const res = await getCampuses();
          const data = Array.isArray(res) ? res : res?.data ?? [];
          console.log(
            "getCampuses result count:",
            Array.isArray(data) ? data.length : 0
          );
          if (mounted) {
            setCampuses(data);
            if (mounted && res && Array.isArray(res.data)) {
              const campusData = res.data;
              setCampuses(campusData);

              // 2. Hier registreren we de Geofences!
              await registerGeofences(campusData);
            }
            // Try to fit the map to coordinates after campuses are set.
            // Build a coordinates array with numeric lat/lng, supporting different DB field names.
            try {
              const coords = data
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
            timeInterval: 5000,
            distanceInterval: 1,
          },
          (p: any) => {
            if (!mounted) return;
            setRegion((r) =>
              r
                ? {
                    ...r,
                    latitude: p.coords.latitude,
                    longitude: p.coords.longitude,
                  }
                : {
                    latitude: p.coords.latitude,
                    longitude: p.coords.longitude,
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
      if (watchRef.current && typeof watchRef.current.remove === "function")
        watchRef.current.remove();
      if (
        watchRef.current &&
        typeof watchRef.current.remove === "undefined" &&
        typeof watchRef.current === "object" &&
        typeof watchRef.current.remove === "function"
      )
        watchRef.current.remove();
    };
  }, []);

  const registerGeofences = async (campusData) => {
    // Vraag notificatie permissies (vereist voor notificaties)

    const regions = campusData.map(campus => ({
        latitude: campus.longitude,
        longitude: campus.latitude,
        radius: campus.radius_meters,
        notifyOnEnter: true,
        notifyOnExit: false,
        identifier: campus.name
    }));

    if (regions.length > 0) {
        await Location.startGeofencingAsync(
            GEOFENCE_TASK_NAME, 
            regions
        );
        console.log(`Succesvol ${regions.length} geofences geregistreerd.`);
    }
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
          {campuses.map((campus: any) => (
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
                <Text style={styles.distance}>≈ 2.3km</Text>
              </View>
            </TouchableOpacity>
          ))}
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

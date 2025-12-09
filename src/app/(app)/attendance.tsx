import AttendanceBottomNav from "@/src/components/design/AttendanceBottomNav";
import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Attendance() {
  const router = useRouter();
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const fetchAttendanceSessions = async () => {
    const data = await getAttendanceSessions();

    // todays date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Filter to only show today's attendance sessions
    const todaysSessions = (data ?? []).filter(
      (session: any) => session.date === today
    );

    setAttendanceSessions(todaysSessions);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceSessions();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAttendanceSessions();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Today&apos;s Attendance Sessions</Text>
          <FlatList
            data={attendanceSessions}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.name}>
                  {item.profile?.first_name ?? "Unknown"}
                  {item.profile?.last_name ?? ""}
                </Text>
                <Text style={styles.campus}>
                  Campus: {item.campus?.name ?? "Unknown campus"}
                </Text>
                <Text style={styles.date}>Date: {item.date ?? "-"}</Text>
                <Text>
                  Arrival: {item.arrival_time ?? "-"} | Departure:{" "}
                  {item.departure_time ?? "-"}
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text>No attendance sessions found.</Text>}
          />
        </View>
      </SafeAreaView>
      <AttendanceBottomNav onGoBack={handleGoBack} />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f6f8" },
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  campus: { fontSize: 16, color: "#333" },
  date: { fontSize: 14, color: "#888" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export { getAttendanceSessions };

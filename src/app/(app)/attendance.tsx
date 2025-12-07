import AttendanceBottomNav from "@/src/components/design/AttendanceBottomNav";
import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Attendance() {
  const router = useRouter();
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePreviousDay = () => {
    // TODO: Add logic to fetch previous day's attendance
    console.log("Previous day");
  };

  const handleNextDay = () => {
    // TODO: Add logic to fetch next day's attendance
    console.log("Next day");
  };

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    const fetchAttendanceSessions = async () => {
      const data = await getAttendanceSessions();
      setAttendanceSessions(data ?? []);
      setLoading(false);
    };
    fetchAttendanceSessions();
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
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>All Attendance Sessions</Text>
        <FlatList
          data={attendanceSessions}
          keyExtractor={(item) => item.id.toString()}
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
      <AttendanceBottomNav
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onGoBack={handleGoBack}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f6f8" },
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

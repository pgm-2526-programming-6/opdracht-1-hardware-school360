import { getAttendanceSessions } from "@/src/core/modules/clients/api.clients";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Attendance() {
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Attendance Sessions</Text>
      <FlatList
        data={attendanceSessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>
              {item.profile?.first_name ?? "Unknown"}{" "}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", padding: 16 },
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

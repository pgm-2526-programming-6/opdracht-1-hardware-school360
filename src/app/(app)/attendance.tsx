import AttendanceBottomNav from "@/src/components/design/AttendanceBottomNav";
import useAuth from "@/src/components/functional/auth/useAuth";
import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Attendance() {
  const router = useRouter();
  const { auth } = useAuth();
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [notOnCampusModalVisible, setNotOnCampusModalVisible] = useState(false);
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

    // Find current user's session for today
    const currentUserSession = todaysSessions.find(
      (session: any) =>
        session.profile_id === auth?.user?.id && session.departure_time === null
    );

    if (!currentUserSession) {
      setNotOnCampusModalVisible(true);
      setAttendanceSessions([]);
      return;
    }

    const userCampusId = currentUserSession.campus_id;
    setNotOnCampusModalVisible(false);

    const activeCampusSessions = todaysSessions.filter(
      (session: any) =>
        session.campus_id === userCampusId && session.departure_time === null
    );

    setAttendanceSessions(activeCampusSessions);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

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
          <Text style={styles.title}>Active Students on Campus</Text>
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
                <Text style={styles.arrival}>
                  Arrival: {item.arrival_time ?? "-"}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No active students on campus right now.
              </Text>
            }
          />
        </View>
      </SafeAreaView>
      <AttendanceBottomNav onGoBack={handleGoBack} />

      <Modal
        visible={notOnCampusModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Not On Campus</Text>
            <Text style={styles.modalMessage}>
              You&apos;re not currently on a campus, so you can&apos;t see any
              attendances.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleGoBack}>
              <Text style={styles.modalButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  campus: { fontSize: 16, color: "#333", marginBottom: 2 },
  date: { fontSize: 14, color: "#888", marginBottom: 2 },
  arrival: { fontSize: 14, color: "#888" },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 40,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#f2994a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export { getAttendanceSessions };

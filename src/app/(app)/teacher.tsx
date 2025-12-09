import AttendanceBottomNav from "@/src/components/design/AttendanceBottomNav";
import { getAttendanceSessions } from "@/src/core/modules/attendance/api.attendance";
import { getCampuses } from "@/src/core/modules/clients/api.clients";
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

export default function TeacherPage() {
  const router = useRouter();
    const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
    const [campuses, setCampuses] = useState<any[]>([]);
    const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
  
    const handleGoBack = () => {
      router.back();
    };
  
    const fetchAttendanceSessions = async () => {
      const data = await getAttendanceSessions();
  
      const today = new Date().toISOString().split("T")[0];
  
      const todaysSessions = (data ?? []).filter(
        (session: any) => session.date === today && !session.departure_time
      );
  
      setAttendanceSessions(todaysSessions);
      setFilteredSessions(todaysSessions);
    };

    const fetchCampuses = async () => {
      const data = await getCampuses();
      setCampuses(data ?? []);
    };

    const handleCampusFilter = (campusId: string | null) => {
      setSelectedCampus(campusId);
      setDropdownOpen(false);
      console.log('Filtering by campus:', campusId);
      console.log('Total sessions:', attendanceSessions.length);
      if (campusId === null) {
        setFilteredSessions(attendanceSessions);
      } else {
        const filtered = attendanceSessions.filter(
          (session: any) => {
            console.log('Session campus_id:', session.campus_id, 'campus?.id:', session.campus?.id, 'Match:', session.campus_id === campusId);
            return session.campus_id === campusId;
          }
        );
        console.log('Filtered sessions:', filtered.length);
        setFilteredSessions(filtered);
      }
    };
  
    const onRefresh = async () => {
      setRefreshing(true);
      await fetchAttendanceSessions();
      setRefreshing(false);
    };
  
    useEffect(() => {
      const loadData = async () => {
        await Promise.all([fetchAttendanceSessions(), fetchCampuses()]);
        setLoading(false);
      };
      loadData();
    }, []);

    useEffect(() => {
      handleCampusFilter(selectedCampus);
    }, [attendanceSessions]);
  
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
                <Text style={styles.title}>Currently On Campus</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setDropdownOpen(true)}
                >
                  <Text style={styles.dropdownText}>
                    {selectedCampus === null
                      ? "All Campuses"
                      : campuses.find((c) => c.id === selectedCampus)?.name ?? "Select Campus"}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                <Modal
                  visible={dropdownOpen}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setDropdownOpen(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownOpen(false)}
                  >
                    <View style={styles.modalContent}>
                      <TouchableOpacity
                        style={[
                          styles.modalItem,
                          selectedCampus === null && styles.modalItemActive,
                        ]}
                        onPress={() => handleCampusFilter(null)}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            selectedCampus === null && styles.modalItemTextActive,
                          ]}
                        >
                          All Campuses
                        </Text>
                      </TouchableOpacity>
                      {campuses.map((campus) => (
                        <TouchableOpacity
                          key={campus.id}
                          style={[
                            styles.modalItem,
                            selectedCampus === campus.id && styles.modalItemActive,
                          ]}
                          onPress={() => handleCampusFilter(campus.id)}
                        >
                          <Text
                            style={[
                              styles.modalItemText,
                              selectedCampus === campus.id && styles.modalItemTextActive,
                            ]}
                          >
                            {campus.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>

                <FlatList
                  data={filteredSessions}
                  keyExtractor={(item) => item.id.toString()}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                  renderItem={({ item }) => {
                    const arrivalHour = item.arrival_time 
                      ? new Date(`1970-01-01T${item.arrival_time}`).getHours() 
                      : null;
                    
                    return (
                      <View style={styles.item}>
                        <View style={styles.header}>
                          <Text style={styles.name}>
                            {item.profile?.first_name ?? "Unknown"} {item.profile?.last_name ?? ""}
                          </Text>
                          {arrivalHour !== null && (
                            <Text style={styles.hourBadge}>{arrivalHour}:00</Text>
                          )}
                        </View>
                        <Text style={styles.campus}>
                          Campus: {item.campus?.name ?? "Unknown campus"}
                        </Text>
                        <Text style={styles.date}>
                          Date: {item.date ?? "-"} | Arrival: {item.arrival_time ?? "-"}
                        </Text>
                        <Text style={styles.status}>Status: On Campus</Text>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No students currently on campus.</Text>
                  }
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    maxHeight: "70%",
    paddingVertical: 8,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemActive: {
    backgroundColor: "#E3F2FD",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalItemTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: { fontSize: 18, fontWeight: "bold", flex: 1 },
  hourBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  campus: { fontSize: 16, color: "#333", marginBottom: 4 },
  date: { fontSize: 14, color: "#888", marginBottom: 4 },
  status: { fontSize: 14, color: "#34C759", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#888", marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

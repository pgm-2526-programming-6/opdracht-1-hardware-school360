import { getProfileById } from "@/src/core/modules/users/api.users";
import useAuth from "@functional/auth/useAuth";
import useUserRole from "@functional/auth/useUserRole";
import { useHaptics } from "@functional/settings/useHaptics";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileCard from "../../../components/design/ProfileCard";
import SettingsCard from "../../../components/design/SettingsCard";
import { COLORS } from "../../../style/colors";

export default function Account() {
  const router = useRouter();
  const { logout } = useAuth();
  const { isTeacher, loading } = useUserRole();
  const haptics = useHaptics();
  const [response, setResponse] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileById();
        setResponse(res);
      } catch (error) {
        console.error("Error getting current auth:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleTestNotification = async () => {
    try {
      haptics.light();
      
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please enable notifications in settings");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "Testing sound settings",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
      Alert.alert("Error", "Failed to send notification");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Account</Text>

        <ProfileCard
          name={response.first_name + " " + response.last_name}
          id={response.id}
          email={response.email}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(app)/attendance")}
        >
          <Text style={styles.buttonText}>View Attendance List</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Settings</Text>

        <SettingsCard
          name="Sounds"
          description="In-app soundeffects"
          icon="volume-high"
          variant="toggle"
        />
        <SettingsCard
          name="Vibrations"
          description="Haptic Feedback"
          icon="phone-portrait-outline"
          variant="toggle"
        />

        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestNotification}
        >
          <Text style={styles.testButtonText}>🔔 Test Sound</Text>
        </TouchableOpacity>

        <SettingsCard name="Privacy & Security" variant="link" />
        <SettingsCard name="Help & Support" variant="link" />

        <TouchableOpacity
          style={[
            styles.teacherButton,
            (!isTeacher || loading) && styles.teacherButtonDisabled,
          ]}
          onPress={() => router.push("/(app)/teacher" as any)}
          disabled={!isTeacher || loading}
        >
          <Text style={styles.teacherButtonText}>
            {loading ? "Loading..." : "Teacher Dashboard"}
          </Text>
          {!isTeacher && !loading && (
            <Text style={styles.teacherButtonSubtext}>(Teachers only)</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#111",
  },
  button: {
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "#f2994a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  testButton: {
    marginTop: 8,
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  testButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  teacherButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  teacherButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.5,
  },
  teacherButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  teacherButtonSubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});

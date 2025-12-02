import useAuth from "@functional/auth/useAuth";
import { useRouter } from "expo-router";
import React from "react";
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
          name="school360"
          id={360245}
          email="school.360@student.arteveldehs.be"
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
          icon="vibrate"
          variant="toggle"
        />
        <SettingsCard name="Privacy & Security" variant="link" />
        <SettingsCard name="Help & Support" variant="link" />

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
});

import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileCard from "../../components/design/ProfileCard";
import SettingsCard from "../../components/design/SettingsCard";
import { COLORS } from "../../style/colors";

export default function Account() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Account</Text>

        <ProfileCard
          name="school360"
          id={360245}
          email="school.360@student.arteveldehs.be"
        />

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
});

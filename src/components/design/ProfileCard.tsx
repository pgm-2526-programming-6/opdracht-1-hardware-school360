import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../style/colors";

type Props = {
  name?: string;
  id?: string | number;
  email?: string;
};

export default function ProfileCard({
  name = "{name}",
  id = "360245",
  email = "school.360@student.arteveldehs.be",
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, { backgroundColor: COLORS.cardBackground }]}> 
        <View style={styles.topRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={28} color="#fff" />
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.studentId}>Student ID: {id}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.emailRow}>
          <MaterialIcons name="email" size={18} color="#555" />
          <Text style={styles.emailText}>{email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  studentId: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailText: {
    marginLeft: 8,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
});

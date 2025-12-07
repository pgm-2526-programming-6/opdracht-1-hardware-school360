import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AttendanceBottomNavProps {
  onPreviousDay: () => void;
  onNextDay: () => void;
  onGoBack: () => void;
}

export default function AttendanceBottomNav({
  onPreviousDay,
  onNextDay,
  onGoBack,
}: AttendanceBottomNavProps) {
  return (
    <View style={styles.bottomBanner}>
      <TouchableOpacity style={styles.navButton} onPress={onPreviousDay}>
        <Text style={styles.navButtonText}>← Previous</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <Text style={styles.backButtonText}>Back to Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={onNextDay}>
        <Text style={styles.navButtonText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f2994a",
    borderRadius: 8,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f2994a",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#f2994a",
    fontWeight: "bold",
    fontSize: 14,
  },
});

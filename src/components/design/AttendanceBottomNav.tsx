import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AttendanceBottomNavProps {
  onGoBack: () => void;
}

export default function AttendanceBottomNav({
  onGoBack,
}: AttendanceBottomNavProps) {
  return (
    <View style={styles.bottomBanner}>
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <Text style={styles.backButtonText}>Back to Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#f2994a",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

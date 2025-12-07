import { Text, View } from "react-native";

export default function TeacherPage() {
  return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Teacher Dashboard
        </Text>
        <Text>This page is only accessible to teachers.</Text>
      </View>
  );
}

import HomeView from "@/src/screens/Home/HomeView";
import { View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <HomeView />
    </View>
  );
}

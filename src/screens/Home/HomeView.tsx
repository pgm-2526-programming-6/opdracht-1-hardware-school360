import { Image, Text, View } from "react-native";

const HomeView = () => {
  return (
    <View>
      {/* title header */}
      <View>
        <Text>Welcome, nameUser</Text>
        <Text>Your attendance is automatically tracked.</Text>
      </View>

      {/* attendance status */}
      {/* if user was present than the color is darker orange else light orange */}
      <View>
        <Text>Ma</Text>
        <Text>Di</Text>
        <Text>Woe</Text>
        <Text>Do</Text>
        <Text>Vr</Text>
      </View>

      <View>
        <Text>This week</Text>
        <Text>0</Text>
        <Image source={require("src/assets/icons/calendar-icon.png")} />
      </View>

      <View>
        <Text>This Month</Text>
        <Text>0</Text>
        <Image source={require("src/assets/icons/graph.png")} />
      </View>

      <View>
        <Text>Total Attendances</Text>
        <Text>0</Text>
        <Image source={require("src/assets/icons/total.png")} />
      </View>
    </View>
  );
};

export default HomeView;

import useAuth from "@/src/components/functional/auth/useAuth";
import { getProfile } from "@/src/core/modules/home/api.home";
import { useMonthlyAttendance } from "@/src/core/utils/useMonthlyAttendance";
import { useWeeklyAttendance } from "@/src/core/utils/useWeeklyAttendance";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeView = () => {
  const [profile, setProfile] = useState<any>(null);
  const { auth } = useAuth();
  const { weeklyCount, attendedDays, loading } = useWeeklyAttendance(
    auth?.user?.id
  );
  const { monthlyCount, loading: monthlyLoading } = useMonthlyAttendance(
    auth?.user?.id
  );

  useEffect(() => {
    if (auth?.user?.id) {
      const fetchProfile = async () => {
        const data = await getProfile(auth.user.id);
        setProfile(data);
      };
      fetchProfile();
    }
  }, [auth]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>At Campus</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>
          Welcome, {profile ? `${profile.first_name}` : "Loading..."}
        </Text>
        <Text style={styles.subtitle}>
          Your attendance is automatically tracked
        </Text>
      </View>

      <View style={styles.weekdays}>
        {["Ma", "Di", "Woe", "Do", "Vr"].map((day, i) => (
          <View
            key={i}
            style={[
              styles.dayPill,
              attendedDays.includes(i) ? styles.dayActive : null,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                attendedDays.includes(i) ? styles.dayTextActive : null,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.cardTitle}>This Week</Text>
          <Text style={styles.cardNumber}>{loading ? "..." : weeklyCount}</Text>
        </View>
        <View style={styles.cardContainer}>
          <Image
            source={require("../../../assets/icons/callender-icon.png")}
            style={styles.cardIcon}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.cardTitle}>This Month</Text>
          <Text style={styles.cardNumber}>{monthlyLoading ? "..." : monthlyCount}</Text>
        </View>
        <View style={styles.cardContainer}>
          <Image
            source={require("../../../assets/icons/graph.png")}
            style={styles.cardIcon}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.cardTitle}>Total</Text>
          <Text style={styles.cardNumber}>0</Text>
        </View>
        <View style={styles.cardContainer}>
          <Image
            source={require("../../../assets/icons/total.png")}
            style={styles.cardIcon}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeView;

const ORANGE = "#F79A32";
const LIGHT_ORANGE = "#FFE4C7";
const TEXT_GRAY = "#757575";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 100,
  },

  statusBadge: {
    marginTop: 10,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: ORANGE,
  },
  statusText: {
    color: ORANGE,
    fontWeight: "600",
  },

  header: {
    marginTop: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: TEXT_GRAY,
  },

  weekdays: {
    flexDirection: "row",
    marginTop: 25,
    gap: 10,
  },
  dayPill: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: LIGHT_ORANGE,
    borderRadius: 8,
  },
  dayActive: {
    backgroundColor: ORANGE,
  },
  dayText: {
    fontWeight: "700",
    color: ORANGE,
  },
  dayTextActive: {
    color: "#FFF",
  },

  card: {
    marginTop: 25,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0ECF8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 125,
    width: 300,
  },
  cardTitle: {
    fontSize: 20,
    color: TEXT_GRAY,
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: "700",
  },
  cardContainer: {
    backgroundColor: "#fde6ce",
    borderRadius: 10,
    padding: 5,
  },
  cardIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});

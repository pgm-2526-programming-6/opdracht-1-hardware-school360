import { Entypo } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../style/colors";

const { width } = Dimensions.get("window");

export default function Campuses() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Map / header area - placeholder for Google Maps */}
      <View style={styles.mapWrap}>
        <View style={styles.mapPlaceholder}>
          {/* Decorative pins to match design; replace this View with a MapView later */}
          <View style={[styles.pin, { left: 40, top: 24 }]}>
            <Entypo name="location-pin" size={28} color="#fff" />
          </View>
          <View style={[styles.pin, { left: width / 2 - 24, top: 8 }]}>
            <Entypo name="location-pin" size={28} color="#fff" />
          </View>
          <View style={[styles.pin, { right: 48, top: 64 }]}>
            <Entypo name="location-pin" size={28} color="#fff" />
          </View>
          <View style={[styles.pin, { left: 56, top: 108 }]}>
            <Entypo name="location-pin" size={28} color="#fff" />
          </View>
        </View>
      </View>

      {/* Content panel */}
      <View style={styles.panel}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>School Campuses</Text>
          <Text style={styles.subtitle}>Select a campus to view details</Text>

          {/* Example campus cards */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Entypo name="location" size={20} color={COLORS.primary} />
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardTitle}>Campus Leeuwstraat</Text>
              <Text style={styles.cardMeta}>Adressinformations</Text>
              <Text style={styles.distance}>≈ 2.3km</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Entypo name="location" size={20} color={COLORS.primary} />
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardTitle}>Campus Kantienberg</Text>
              <Text style={styles.cardMeta}>Adressinformations</Text>
              <Text style={styles.distance}>≈ 2.3km</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapWrap: {
    height: 220,
    backgroundColor: COLORS.primaryLight,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    position: "relative",
  },
  pin: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -24,
    paddingTop: 18,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardLeft: {
    width: 56,
    alignItems: "center",
    marginRight: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardRight: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  distance: {
    marginTop: 6,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});

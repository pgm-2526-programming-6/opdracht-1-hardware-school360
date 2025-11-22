import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  name: string;
  description?: string;
  icon?: any;
  variant?: "toggle" | "link";
  initialValue?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
};

export default function SettingsCard({
  name,
  description,
  icon = "notifications-outline",
  variant = "toggle",
  initialValue = true,
  onPress,
}: Props) {
  const [enabled, setEnabled] = useState(initialValue);

  const handleToggle = () => setEnabled((v) => !v);

  if (variant === "link") {
    return (
      <TouchableOpacity
        style={styles.linkRow}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={styles.leftIconBox}>
          <View style={styles.iconInner}>
            <Ionicons name={icon} size={20} color="#f57c00" />
          </View>
        </View>

        <View style={styles.center}>
          <Text style={styles.title}>{name}</Text>
        </View>

        <View style={styles.rightIcon}>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.leftIconBox}>
        <View style={styles.iconInner}>
          <Ionicons name={icon} size={20} color="#f57c00" />
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{name}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>

      <View style={styles.switchBox}>
        <Switch
          trackColor={{ false: "#dcdcdc", true: "#ffd6b3" }}
          thumbColor={enabled ? "#f57c00" : "#fff"}
          ios_backgroundColor="#dcdcdc"
          onValueChange={handleToggle}
          value={enabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  leftIconBox: {
    paddingRight: 8,
  },
  iconInner: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#fff6ee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fde6cf",
  },
  center: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    color: "#7a7a7a",
  },
  rightIcon: {
    marginLeft: 8,
  },
  switchBox: {
    marginLeft: 8,
  },
});

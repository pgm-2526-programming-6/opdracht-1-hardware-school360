import useAuth from "@/src/components/functional/auth/useAuth";
import { postAttendanceSession } from "@/src/core/modules/campus/api.campus";
import { COLORS } from "@/src/style/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Text, TouchableOpacity, View } from "react-native";
import { useAttendancePrompt } from "./AttendanceContext";

export const AttendancePromptModal: React.FC = () => {
  const { auth } = useAuth();
  const { activePrompt, setActivePrompt } = useAttendancePrompt();
  const queryClient = useQueryClient();

  const handlePromptAnswer = async (answer: "YES" | "NO") => {
    if (!activePrompt) return;

    if (answer === "YES") {
      try {
        const userId = auth?.user?.id;
        const campusId = activePrompt.id;

        if (!userId) {
          console.warn("User not logged in");
          return;
        }

        // Save userId to AsyncStorage for use in background tasks
        await AsyncStorage.setItem("@userId", userId);

        await postAttendanceSession(userId, campusId);
        // ✅ Invalidate home summary + campus status
        queryClient.invalidateQueries({
          queryKey: ["attendanceSummary", userId],
        });
        queryClient.invalidateQueries({ queryKey: ["campusStatus", userId] });
      } catch (e) {
        console.error("Failed to register attendance", e);
      }
    }
    setActivePrompt(null);
  };

  if (!activePrompt) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        backgroundColor: "rgba(0,0,0,0.35)",
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 10,
          width: "90%",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          Ben je aanwezig bij {activePrompt.name}?
        </Text>
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => handlePromptAnswer("YES")}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Ja</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlePromptAnswer("NO")}
            style={{
              backgroundColor: "#eee",
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Nee</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

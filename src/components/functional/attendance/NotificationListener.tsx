import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useAttendancePrompt } from "./AttendanceContext";
import useAuth from "../auth/useAuth";
import { updateDepartureTime } from "@/src/core/modules/campus/api.campus";

export const NotificationListener: React.FC = () => {
  const { setActivePrompt } = useAttendancePrompt();
  const { auth } = useAuth();

  useEffect(() => {
    // Setup notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Setup notification category
    const setupCategory = async () => {
      await Notifications.setNotificationCategoryAsync("ATTENDANCE", [
        {
          identifier: "YES",
          buttonTitle: "Ja",
          options: { opensAppToForeground: true },
        },
        {
          identifier: "NO",
          buttonTitle: "Nee",
          options: { opensAppToForeground: true },
        },
      ]);
    };

    setupCategory();

    // Listen to notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const actionId = response.actionIdentifier;
        const data = response.notification.request.content.data || {};

        console.log("Notification response received:", { actionId, data });

        // Handle exit event (automatic departure time update)
        if (data.action === "exit") {
          const userId = auth?.user?.id;
          if (userId && data.campusId) {
            try {
              await updateDepartureTime(userId, data.campusId);
              console.log("Departure time updated from notification");
            } catch (e) {
              console.error("Failed to update departure time", e);
            }
          }
          return;
        }

        // Handle enter event actions
        if (actionId === "YES") {
          console.log("Gebruiker kiest JA voor aanwezig:", data);
          // Show the in-app prompt
          setActivePrompt({ id: data.campusId, name: data.campusName });
        } else if (actionId === "NO") {
          console.log("Gebruiker kiest NEE voor aanwezig:", data);
        } else {
          // User tapped notification body -> show in-app prompt
          setActivePrompt({ id: data.campusId, name: data.campusName });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [auth, setActivePrompt]);

  return null;
};

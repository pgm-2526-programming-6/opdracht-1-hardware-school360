import { userSettings } from "@/src/core/modules/users/api.users";
import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, useState } from "react";
import { API } from "../../../core/network/supabase/api";

type Settings = {
  sounds: boolean;
  vibrations: boolean;
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (key: "sounds" | "vibrations", value: boolean) => Promise<void>;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>({
    sounds: true,
    vibrations: true,
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const {
          data: { session },
        } = await API.auth.getSession();
        if (session?.user?.id) {
          const response = await API.from("settings")
            .select("sounds, vibrations")
            .eq("profile_id", session.user.id)
            .single();

          if (response.data) {
            const newSettings = {
              sounds: response.data.sounds ?? true,
              vibrations: response.data.vibrations ?? true,
            };
            setSettings(newSettings);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update notification handler when settings change
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: settings.sounds,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, [settings.sounds]);

  const updateSettings = async (
    key: "sounds" | "vibrations",
    value: boolean
  ) => {
    try {
      // Update local state immediately for responsiveness
      setSettings((prev) => ({ ...prev, [key]: value }));

      // Update database
      await userSettings(key, { [key]: value } as Settings);
    } catch (error) {
      console.error("Failed to update settings:", error);
      // Revert on error
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

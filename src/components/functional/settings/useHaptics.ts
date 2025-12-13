import * as Haptics from "expo-haptics";
import { useSettings } from "./SettingsContext";

export const useHaptics = () => {
  const { settings } = useSettings();

  const light = () => {
    if (settings.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const medium = () => {
    if (settings.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const heavy = () => {
    if (settings.vibrations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const selection = () => {
    if (settings.vibrations) {
      Haptics.selectionAsync();
    }
  };

  const notification = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (settings.vibrations) {
      Haptics.notificationAsync(type);
    }
  };

  return {
    light,
    medium,
    heavy,
    selection,
    notification,
  };
};

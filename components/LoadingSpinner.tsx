import { type ActivityIndicatorProps, ActivityIndicator } from "react-native";

import { colors } from "@/assets/Themes/colors";

export function LoadingSpinner(props: ActivityIndicatorProps) {
  return <ActivityIndicator color={colors.accentColor} {...props} />;
}

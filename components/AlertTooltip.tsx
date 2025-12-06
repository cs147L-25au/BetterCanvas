import { useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Tooltip } from "@rneui/themed";
import { Text } from "react-native";

import { colors } from "@/assets/Themes/colors";

type AlertTooltipProps = {
  message: string;
  width?: number;
};

export function AlertTooltip({ message, width = 150 }: AlertTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip
      visible={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      animationType="fade"
      width={width}
      withPointer={false}
      containerStyle={{
        backgroundColor: colors.backgroundContrast,
        boxShadow: colors.boxShadow,
      }}
      popover={<Text style={{ color: colors.textContrast }}>{message}</Text>}
    >
      <Ionicons name="warning-outline" size={24} color={colors.alertIcon} />
    </Tooltip>
  );
}

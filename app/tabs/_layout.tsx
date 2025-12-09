import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  return (
    <GestureHandlerRootView>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Label>Agenda</Label>
          <Icon
            sf="list.bullet.below.rectangle"
            drawable="custom_android_drawable"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="calendar">
          <Icon sf="calendar" drawable="custom_settings_drawable" />
          <Label>Calendar</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="courses">
          <Label>My Courses</Label>
          <Icon
            sf="rectangle.grid.3x2.fill"
            drawable="custom_android_drawable"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </GestureHandlerRootView>
  );
}

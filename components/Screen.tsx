import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
};

export function Screen(props: Props) {
  const { children } = props;

  return (
    <SafeAreaView>
      {children}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

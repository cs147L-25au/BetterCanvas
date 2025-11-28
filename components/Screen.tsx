import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "styled-components/native";

type Props = {
  children: React.ReactNode;
};

export function Screen(props: Props) {
  const { children } = props;

  return (
    <StyledSafeAreaView>
      {children}
      <StatusBar style="auto" />
    </StyledSafeAreaView>
  );
}

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
`;

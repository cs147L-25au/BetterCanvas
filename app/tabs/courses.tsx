import React from "react";

import { useRouter } from "expo-router";
import { Alert, Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";
import { Screen } from "@/components/Screen";
import { signOut } from "@/utils/auth";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function CoursesScreen() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Error", "Failed to sign out");
    } else {
      router.replace("/login");
    }
  }

  return (
    <Screen>
      <Header>
        <HeaderText>My Profile</HeaderText>
      </Header>
      <Content>
        <LogoutButton onPress={handleLogout}>
          <LogoutButtonText>Log Out</LogoutButtonText>
        </LogoutButton>
      </Content>
    </Screen>
  );
}

const Header = styled.View`
  height: ${windowHeight * 0.1}px;
  background-color: ${colors.background};
  justify-content: center;
  padding-left: ${windowWidth * 0.05}px;
`;

const HeaderText = styled.Text`
  font-size: ${windowHeight * 0.04}px;
  font-weight: bold;
  color: ${colors.accentColor};
`;

const Content = styled.View`
  flex: 1;
  padding: ${windowWidth * 0.05}px;
`;

const LogoutButton = styled.Pressable`
  background-color: ${colors.accentColor};
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  margin-top: 20px;
`;

const LogoutButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

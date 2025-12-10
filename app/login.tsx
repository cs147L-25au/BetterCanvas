import { useState } from "react";

import { useRouter } from "expo-router";
import { Alert, Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";
import { signIn, signUp } from "@/utils/auth";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else {
        router.replace("/courseSelection");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert("Login Error", error.message);
      } else {
        router.replace("/");
      }
    }

    setLoading(false);
  }

  return (
    <Container>
      <Logo source={require("@/assets/logo.png")} resizeMode="contain" />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={colors.textSecondary}
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={colors.textSecondary}
      />

      <Button onPress={handleAuth} disabled={loading}>
        <ButtonText>
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </ButtonText>
      </Button>

      <ToggleButton onPress={() => setIsSignUp(!isSignUp)}>
        <ToggleText>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </ToggleText>
      </ToggleButton>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 20px;
  background-color: ${colors.background};
`;

const Logo = styled.Image`
  width: ${windowWidth * 0.55}px;
  height: ${windowWidth * 0.55}px;
  align-self: center;
  margin-bottom: ${windowHeight * 0.01}px;
`;

const Input = styled.TextInput`
  background-color: ${colors.backgroundSecondary};
  color: ${colors.textPrimary};
  padding: ${windowHeight * 0.02}px;
  border-radius: ${windowHeight * 0.01}px;
  margin-bottom: ${windowHeight * 0.015}px;
  font-size: ${windowHeight * 0.02}px;
`;

const Button = styled.Pressable`
  background-color: ${colors.accentColor};
  padding: ${windowHeight * 0.02}px;
  border-radius: ${windowHeight * 0.01}px;
  margin-top: ${windowHeight * 0.01}px;
`;

const ButtonText = styled.Text`
  color: white;
  text-align: center;
  font-size: ${windowHeight * 0.02}px;
  font-weight: 600;
`;

const ToggleButton = styled.Pressable`
  margin-top: ${windowHeight * 0.02}px;
`;

const ToggleText = styled.Text`
  color: ${colors.accentColor};
  text-align: center;
  font-size: ${windowHeight * 0.018}px;
`;

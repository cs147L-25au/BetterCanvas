import { useState } from "react";

import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";
import { signIn, signUp } from "@/utils/auth";

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
        Alert.alert("Success!");
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
      <Title>BetterCanvas</Title>
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

const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${colors.textPrimary};
  text-align: center;
  margin-bottom: 40px;
`;

const Input = styled.TextInput`
  background-color: ${colors.backgroundSecondary};
  color: ${colors.textPrimary};
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 16px;
`;

const Button = styled.Pressable`
  background-color: ${colors.accentColor};
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
`;

const ButtonText = styled.Text`
  color: white;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
`;

const ToggleButton = styled.Pressable`
  margin-top: 20px;
`;

const ToggleText = styled.Text`
  color: ${colors.accentColor};
  text-align: center;
  font-size: 14px;
`;

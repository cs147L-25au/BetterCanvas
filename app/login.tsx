import { useEffect, useRef, useState } from "react";

import { useRouter } from "expo-router";
import { Alert, Animated, Dimensions } from "react-native";
import { styled } from "styled-components/native";

import { colors } from "@/assets/Themes/colors";
import { signIn, signUp } from "@/utils/auth";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Toggle between sign in and sign up mode
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  // Animate logo pulse
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [scaleAnim]);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      // Sign up flow: Create new account and redirect to course selection
      const { error } = await signUp(email, password);
      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else {
        // Redirect to course selection after successful sign up
        router.replace("/courseSelection");
      }
    } else {
      // Login existing user and redirect to main app
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
      <AnimatedLogo
        source={require("@/assets/logo.png")}
        resizeMode="contain"
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      />

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

const AnimatedLogo = Animated.createAnimatedComponent(styled.Image`
  width: ${windowWidth * 0.55}px;
  height: ${windowWidth * 0.55}px;
  align-self: center;
  margin-bottom: ${windowHeight * 0.01}px;
`);

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

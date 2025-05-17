import React, { useState } from "react";
import { colors, typography } from "../theme/WebTheme";
import { useUser } from "../context/UserContext";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "../components/WebCompatUI";

import { Feather } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const { user, loading } = useUser();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
    setEmail("");
    setPassword("");
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    if (!isLoginMode && password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isLoginMode) {
        if (email === "admin@example.com" && password === "admin123") {
          console.log("Admin logged in");
        } else {
          console.log("User logged in");
        }
      } else {
        console.log("New user registered");
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800&q=80",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>PharmaCos</Text>
          <Text style={styles.appTagline}>Your Health & Beauty Partner</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLoginMode
              ? "Sign in to access your account"
              : "Register to start shopping"}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={20}
              color={colors.onSurfaceVariant}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.onSurfaceVariant + "80"}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color={colors.onSurfaceVariant}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              placeholderTextColor={colors.onSurfaceVariant + "80"}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.visibilityIcon}
            >
              {isPasswordVisible ? (
                <Feather
                  name="eye-off"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              ) : (
                <Feather name="eye" size={20} color={colors.onSurfaceVariant} />
              )}
            </TouchableOpacity>
          </View>

          {isLoginMode && (
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLoginMode ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Feather name="github" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.socialButtonText}>
              {isLoginMode ? "Sign In" : "Sign Up"} with GitHub
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Feather name="twitter" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.socialButtonText}>
              {isLoginMode ? "Sign In" : "Sign Up"} with Twitter
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchModeContainer}
          onPress={toggleAuthMode}
        >
          <Text style={styles.switchModeText}>
            {isLoginMode
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  appName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: 8,
  },
  appTagline: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
    opacity: 0.7,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.error,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    display: "flex",
    backgroundColor: colors.surfaceVariant + "20",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
  },
  visibilityIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    display: "flex",
  },
  submitButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    display: "flex",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceVariant,
  },
  dividerText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    borderRadius: 8,
    height: 48,
    marginBottom: 16,
    display: "flex",
  },
  socialButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
    marginLeft: 12,
  },
  switchModeContainer: {
    alignItems: "center",
    marginTop: 24,
    display: "flex",
  },
  switchModeText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.primary,
  },
});

export default LoginScreen;

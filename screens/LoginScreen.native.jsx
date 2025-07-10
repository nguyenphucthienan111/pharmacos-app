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
  Alert,
} from "../components/WebCompatUI";
import { Feather } from "@expo/vector-icons";

// Component để chọn ngày, tháng, năm
const DatePicker = ({ label, value, onChangeText, placeholder, maxLength, keyboardType = 'numeric' }) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.dateLabel}>{label}</Text>
    <TextInput
      style={styles.dateInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      maxLength={maxLength}
      keyboardType={keyboardType}
      placeholderTextColor={colors.onSurfaceVariant + "80"}
    />
  </View>
);

const LoginScreen = ({navigation}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // States cho đăng nhập
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // States cho đăng ký
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regGender, setRegGender] = useState("male");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const { login, register } = useUser();

  const clearForm = () => {
    setError("");
    setSuccess("");
    setLoginUsername("");
    setLoginPassword("");
    setRegUsername("");
    setRegPassword("");
    setRegName("");
    setRegEmail("");
    setYear("");
    setMonth("");
    setDay("");
  };

  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    clearForm();
  };

  const validateRegisterForm = () => {
    if (!regUsername || !regName || !regEmail || !regPassword || !year || !month || !day) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!regEmail.includes("@")) {
      setError("Please enter a valid email.");
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = async () => {
    if (!validateRegisterForm()) return;
    setIsLoading(true);
    setError("");

    const userData = {
      username: regUsername,
      password: regPassword,
      name: regName,
      email: regEmail,
      gender: regGender,
      dateOfBirth: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    };

    const result = await register(userData);
    if (result.success) {
      // Đăng ký thành công, chuyển hướng đến màn hình xác thực
      Alert.alert(
        "Registration Successful",
        "A verification token has been sent to your email. Please check and enter it on the next screen.",
        [{ text: "OK", onPress: () => navigation.navigate('VerifyEmail') }]
      );
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleLoginSubmit = async () => {
    if (!loginUsername || !loginPassword) {
      setError("Username and password are required.");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await login(loginUsername, loginPassword);
    if (!result.success) {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to access your account</Text>
      <View style={styles.inputContainer}>
        <Feather name="user" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
        {/* Áp dụng style 'input' cho tất cả TextInput */}
        <TextInput style={styles.input} placeholder="Username" value={loginUsername} onChangeText={setLoginUsername} autoCapitalize="none" />
      </View>
      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color={colors.onSurfaceVariant} style={styles.inputIcon} />
        <TextInput
          // Kết hợp style cơ bản và style riêng cho password
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.visibilityIcon}
        >
          <Feather
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={20}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleLoginSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Sign In</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Fill in the details to register</Text>
      <TextInput style={styles.input} placeholder="Username" value={regUsername} onChangeText={setRegUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Full Name" value={regName} onChangeText={setRegName} autoCapitalize="words" />
      <TextInput style={styles.input} placeholder="Email" value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={regPassword} onChangeText={setRegPassword} secureTextEntry autoCapitalize="none" />
      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderContainer}>
        {['male', 'female', 'other'].map(g => (
          <TouchableOpacity key={g} style={[styles.genderButton, regGender === g && styles.genderButtonActive]} onPress={() => setRegGender(g)}>
            <Text style={[styles.genderButtonText, regGender === g && styles.genderButtonTextActive]}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.dateContainer}>
        <DatePicker label="Year" value={year} onChangeText={setYear} placeholder="YYYY" maxLength={4} />
        <DatePicker label="Month" value={month} onChangeText={setMonth} placeholder="MM" maxLength={2} />
        <DatePicker label="Day" value={day} onChangeText={setDay} placeholder="DD" maxLength={2} />
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleRegisterSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Create Account</Text>}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800&q=80" }} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>PharmaCos</Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}
        {isLoginMode ? renderLoginForm() : renderRegisterForm()}
        <TouchableOpacity style={styles.switchModeContainer} onPress={toggleAuthMode}>
          <Text style={styles.switchModeText}>
            {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  appName: { fontSize: typography.fontSize.xlarge, fontWeight: typography.fontWeight.bold, color: colors.primary },
  formContainer: { backgroundColor: colors.surface, borderRadius: 12, padding: 24, width: "100%", },
  title: { fontSize: typography.fontSize.large, fontWeight: typography.fontWeight.bold, color: colors.onSurfaceVariant, marginBottom: 4 },
  subtitle: { fontSize: typography.fontSize.medium, color: colors.onSurfaceVariant, marginBottom: 20, opacity: 0.7 },
  errorText: { color: colors.error, textAlign: "center", marginBottom: 15, fontSize: typography.fontSize.medium },
  successText: { color: 'green', textAlign: "center", marginBottom: 15, fontSize: typography.fontSize.medium },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.surfaceVariant, borderRadius: 8, marginBottom: 16, position: 'relative' },
  inputIcon: { paddingLeft: 12, marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: typography.fontSize.medium, color: colors.onSurfaceVariant, paddingVertical: 10, },
  passwordInput: {
    paddingRight: 40, // Tạo không gian cho icon
  },
  visibilityIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  submitButton: { backgroundColor: colors.primary, borderRadius: 8, height: 48, justifyContent: "center", alignItems: "center", marginTop: 10 },
  submitButtonText: { fontSize: typography.fontSize.medium, fontWeight: typography.fontWeight.medium, color: "#FFFFFF" },
  switchModeContainer: { alignItems: "center", marginTop: 24 },
  switchModeText: { fontSize: typography.fontSize.medium, color: colors.primary },
  label: { fontSize: typography.fontSize.small, color: colors.onSurfaceVariant, marginBottom: 8, marginTop: 4 },
  genderContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  genderButton: { flex: 1, marginHorizontal: 4, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: colors.surfaceVariant, borderRadius: 8 },
  genderButtonActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  genderButtonText: { color: colors.onSurfaceVariant },
  genderButtonTextActive: { color: colors.onPrimaryContainer, fontWeight: "bold" },
  dateContainer: { flexDirection: "row", gap: 10, marginBottom: 16 },
  dateLabel: { fontSize: typography.fontSize.small, color: colors.onSurfaceVariant, marginBottom: 4, textAlign: 'center' },
  dateInput: { height: 48, borderWidth: 1, borderColor: colors.surfaceVariant, borderRadius: 8, paddingHorizontal: 10, textAlign: 'center' }
});

export default LoginScreen;
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "../components/WebCompatUI";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

// Component con cho ô nhập mật khẩu
const PasswordInput = ({ label, value, onChangeText, secureTextEntry, onToggleVisibility, placeholder }) => {
  const { colors } = useTheme();
  const styles = createPasswordStyles(colors);

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.eyeButton} onPress={onToggleVisibility}>
          <Feather name={secureTextEntry ? "eye-off" : "eye"} size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createPasswordStyles = (colors) => ({
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#40484C', marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE4E9', borderRadius: 8 },
  input: { flex: 1, padding: 12, fontSize: 16, color: '#40484C' },
  eyeButton: { padding: 12 },
});

const ChangePasswordScreen = ({ navigation }) => {
  const { updatePassword, loading: contextLoading } = useUser();
  const { colors, typography } = useTheme();

  // Define styles inside the component
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFE' },
    content: { padding: 20 },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#40484C', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#40484C', opacity: 0.7 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: '#40484C', marginBottom: 8, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE4E9', borderRadius: 8 },
    input: { flex: 1, padding: 12, fontSize: 16, color: '#40484C' },
    eyeButton: { padding: 12 },
    errorText: { color: '#BA1A1A', fontSize: 14, textAlign: 'center', marginBottom: 16 },
    buttonContainer: { marginTop: 24 },
    saveButton: { backgroundColor: '#006782', borderRadius: 8, padding: 16, alignItems: 'center' },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const [error, setError] = useState('');

  const validateForm = () => {
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return false;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return false;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from the old password.");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    const result = await updatePassword(currentPassword, newPassword);

    if (result.success) {
      Alert.alert("Success", result.message);
      // Không cần điều hướng, vì context đã xử lý việc logout và navigator sẽ tự động chuyển màn hình
    } else {
      setError(result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different from previous used passwords.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={showCurrentPassword}
            onToggleVisibility={() => setShowCurrentPassword(prev => !prev)}
            placeholder="Enter your current password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={showNewPassword}
            onToggleVisibility={() => setShowNewPassword(prev => !prev)}
            placeholder="Enter your new password"
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword(prev => !prev)}
            placeholder="Confirm your new password"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
              disabled={contextLoading}
            >
              {contextLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
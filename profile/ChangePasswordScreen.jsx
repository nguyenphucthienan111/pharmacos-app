import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "../components/WebCompatUI"; // <-- FIXED: remove .native
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

const ChangePasswordScreen = ({ navigation }) => {
  const { updatePassword, validatePassword } = useUser();
  const { colors, typography } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: typography.fontSize.medium,
      color: colors.onSurfaceVariant,
      opacity: 0.7,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: typography.fontSize.small,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    input: {
      flex: 1,
      padding: 12,
      fontSize: typography.fontSize.medium,
      color: colors.onSurfaceVariant,
    },
    eyeButton: {
      padding: 8,
    },
    errorText: {
      color: colors.error,
      fontSize: typography.fontSize.small,
      marginTop: 4,
    },
    passwordRequirements: {
      marginTop: 24,
      marginBottom: 16,
    },
    requirementTitle: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.onSurfaceVariant,
      marginBottom: 12,
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    requirementText: {
      fontSize: typography.fontSize.small,
      color: colors.onSurfaceVariant,
      marginLeft: 8,
    },
    buttonContainer: {
      marginTop: 24,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
    },
    saveButtonText: {
      color: colors.onPrimary || "#FFFFFF",
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
    },
    cancelButton: {
      marginTop: 12,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    cancelButtonText: {
      color: colors.onSurfaceVariant,
      fontSize: typography.fontSize.medium,
    },
  });

  const validateForm = async () => {
    let isValid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else {
      const isPasswordValid = await validatePassword(newPassword);
      if (!isPasswordValid) {
        newErrors.newPassword =
          "Password must be at least 8 characters with uppercase, lowercase, and number";
        isValid = false;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    const result = await updatePassword(currentPassword, newPassword);
    setIsLoading(false);

    if (result.success) {
      Alert.alert("Success", result.message, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const checkPasswordRequirement = (requirement, password) => {
    switch (requirement) {
      case "length":
        return password.length >= 8;
      case "uppercase":
        return /[A-Z]/.test(password);
      case "lowercase":
        return /[a-z]/.test(password);
      case "number":
        return /\d/.test(password);
      default:
        return false;
    }
  };

  const PasswordRequirement = ({ requirement, text }) => {
    const isMet = checkPasswordRequirement(requirement, newPassword);
    return (
      <View style={styles.requirementItem}>
        <Feather
          name={isMet ? "check-circle" : "circle"}
          size={16}
          color={isMet ? colors.primary : colors.onSurfaceVariant}
        />
        <Text
          style={[styles.requirementText, isMet && { color: colors.primary }]}
        >
          {text}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Create a new password that is secure and different from previous
            passwords.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder="Enter your current password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Feather
                name={showCurrentPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          {errors.currentPassword ? (
            <Text style={styles.errorText}>{errors.currentPassword}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholder="Enter your new password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Feather
                name={showNewPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          {errors.newPassword ? (
            <Text style={styles.errorText}>{errors.newPassword}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm your new password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Feather
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementTitle}>Password Requirements</Text>
          <PasswordRequirement
            requirement="length"
            text="At least 8 characters"
          />
          <PasswordRequirement
            requirement="uppercase"
            text="At least one uppercase letter"
          />
          <PasswordRequirement
            requirement="lowercase"
            text="At least one lowercase letter"
          />
          <PasswordRequirement
            requirement="number"
            text="At least one number"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ChangePasswordScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

const PersonalInfoScreen = ({ navigation }) => {
  const { user, updateUserInfo } = useUser();
  const { colors, typography } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    // Initialize form with user data
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
  }, [user]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: colors.onSurfaceVariant,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    editButtonText: {
      fontSize: typography.fontSize.medium,
      color: colors.primary,
      marginLeft: 4,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: typography.fontSize.small,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      padding: 12,
      fontSize: typography.fontSize.medium,
      color: colors.onSurfaceVariant,
    },
    inputDisabled: {
      backgroundColor: colors.surfaceVariant,
      opacity: 0.7,
    },
    errorText: {
      color: colors.error,
      fontSize: typography.fontSize.small,
      marginTop: 4,
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", phone: "" };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await updateUserInfo(name, email, phone);
    setIsLoading(false);

    if (result.success) {
      Alert.alert("Success", result.message);
      setIsEditing(false);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Personal Information</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={isEditing}
            placeholder="Enter your full name"
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          {errors.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
          ) : null}
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setName(user.name);
                setEmail(user.email);
                setPhone(user.phone);
                setErrors({ name: "", email: "", phone: "" });
              }}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PersonalInfoScreen;

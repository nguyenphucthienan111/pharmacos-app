import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const { user } = useUser();
  const { colors, typography } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 30,
      paddingHorizontal: 20,
      alignItems: "center",
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    avatarText: {
      fontSize: typography.fontSize.xlarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.onPrimaryContainer,
    },
    userName: {
      fontSize: typography.fontSize.large,
      fontWeight: typography.fontWeight.bold,
      color: colors.onPrimary || "#FFFFFF",
      marginBottom: 4,
    },
    userEmail: {
      fontSize: typography.fontSize.medium,
      color: colors.onPrimary || "#FFFFFF",
      opacity: 0.8,
    },
    content: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
      color: colors.onSurfaceVariant,
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    menuItemText: {
      flex: 1,
      fontSize: typography.fontSize.medium,
      color: colors.onSurfaceVariant,
      marginLeft: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
    },
    chevron: {
      color: colors.onSurfaceVariant,
    },
  });

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("PersonalInfo")}
        >
          <View style={styles.iconContainer}>
            <Feather name="user" size={20} color={colors.onPrimaryContainer} />
          </View>
          <Text style={styles.menuItemText}>Personal Information</Text>
          <Feather name="chevron-right" size={20} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.iconContainer}>
            <Feather name="lock" size={20} color={colors.onPrimaryContainer} />
          </View>
          <Text style={styles.menuItemText}>Change Password</Text>
          <Feather name="chevron-right" size={20} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <Feather name="bell" size={20} color={colors.onPrimaryContainer} />
          </View>
          <Text style={styles.menuItemText}>Notifications</Text>
          <Feather name="chevron-right" size={20} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <Feather
              name="help-circle"
              size={20}
              color={colors.onPrimaryContainer}
            />
          </View>
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Feather name="chevron-right" size={20} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <Feather
              name="log-out"
              size={20}
              color={colors.onPrimaryContainer}
            />
          </View>
          <Text style={styles.menuItemText}>Log Out</Text>
          <Feather name="chevron-right" size={20} style={styles.chevron} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

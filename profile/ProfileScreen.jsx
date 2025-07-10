import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "../components/WebCompatUI";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useUser();
  const { colors, typography } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", onPress: logout, style: "destructive" },
      ],
      { cancelable: false }
    );
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Nếu chưa có user hoặc profile, hiển thị màn hình trống để tránh lỗi
  if (!user || !user.profile) {
    return (
      <View style={styles.container}>
        {/* Có thể thêm một ActivityIndicator ở đây nếu muốn */}
      </View>
    );
  }

  // --- CÁC STYLE GIỮ NGUYÊN ---
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
    logoutMenuItem: {
      backgroundColor: colors.errorContainer,
    },
    logoutMenuItemText: {
      color: colors.onErrorContainer,
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
    logoutIconContainer: {
      backgroundColor: colors.error,
    },
    chevron: {
      color: colors.onSurfaceVariant,
    },
  });


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Truy cập thông tin qua user.profile */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(user.profile.name)}</Text>
        </View>
        <Text style={styles.userName}>{user.profile.name}</Text>
        <Text style={styles.userEmail}>{user.profile.email}</Text>
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
          onPress={() => navigation.navigate("AddressBook")}
        >
          <View style={styles.iconContainer}>
            <Feather name="map-pin" size={20} color={colors.onPrimaryContainer} />
          </View>
          <Text style={styles.menuItemText}>Address Book</Text>
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

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("MyOrders")}>
          <View style={styles.iconContainer}>
            <Feather name="shopping-cart" size={20} color={colors.onPrimaryContainer} />
          </View>
          <Text style={styles.menuItemText}>My Orders</Text>
          <Feather name="chevron-right" size={20} style={styles.chevron} />
        </TouchableOpacity>
{/* 
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
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutMenuItem]}
          onPress={handleLogout}
        >
          <View style={[styles.iconContainer, styles.logoutIconContainer]}>
            <Feather name="log-out" size={20} color={colors.onError} />
          </View>
          <Text style={[styles.menuItemText, styles.logoutMenuItemText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
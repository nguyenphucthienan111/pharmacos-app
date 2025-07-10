import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert, // Import Alert để tạo hộp thoại xác nhận
} from "../components/WebCompatUI";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  // Lấy user và hàm logout từ UserContext
  const { user, logout } = useUser();
  const { colors, typography } = useTheme();

  // Hàm xử lý khi nhấn nút đăng xuất
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout", // Tiêu đề
      "Are you sure you want to log out?", // Nội dung
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout canceled"),
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: () => logout(), // Gọi hàm logout từ context
          style: "destructive",
        },
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

  // Tránh lỗi nếu user chưa được tải xong
  if (!user) {
    return null;
  }

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
      backgroundColor: colors.errorContainer, // Màu nền khác cho nút đăng xuất
    },
    logoutMenuItemText: {
      color: colors.onErrorContainer, // Màu chữ khác
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

        {/* --- NÚT ĐĂNG XUẤT ĐÃ HOÀN THIỆN --- */}
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutMenuItem]}
          onPress={handleLogout}
        >
          <View style={[styles.iconContainer, styles.logoutIconContainer]}>
            <Feather
              name="log-out"
              size={20}
              color={colors.onError}
            />
          </View>
          <Text style={[styles.menuItemText, styles.logoutMenuItemText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
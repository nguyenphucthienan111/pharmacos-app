import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "../components/WebCompatUI";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

// Styles được tạo bởi một hàm để có thể truy cập theme
const createStyles = (colors, typography) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: typography.fontSize.large, fontWeight: typography.fontWeight.bold, color: colors.onSurfaceVariant },
  editButton: { flexDirection: 'row', alignItems: 'center' },
  editButtonText: { fontSize: typography.fontSize.medium, color: colors.primary, marginLeft: 4 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: typography.fontSize.small, color: colors.onSurfaceVariant, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceVariant, borderRadius: 8, padding: 12, fontSize: typography.fontSize.medium, color: colors.onSurfaceVariant },
  inputDisabled: { backgroundColor: colors.surfaceVariant + '40', color: colors.onSurfaceVariant + '80' },
  buttonContainer: { marginTop: 24 },
  saveButton: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center' },
  saveButtonText: { color: "#FFFFFF", fontSize: typography.fontSize.medium, fontWeight: '500' },
  cancelButton: { marginTop: 12, borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.surfaceVariant },
  cancelButtonText: { color: colors.onSurfaceVariant, fontSize: typography.fontSize.medium }
});

// Component con cho ô nhập liệu
const InfoInput = ({ label, value, onChangeText, editable, ...props }) => {
  const { colors, typography } = useTheme();
  const styles = createStyles(colors, typography);

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor={colors.onSurfaceVariant + '80'}
        {...props}
      />
    </View>
  );
};

const PersonalInfoScreen = ({ navigation }) => {
  const { user, fetchUserProfile, updateUserProfile, loading: contextLoading } = useUser();
  const { colors, typography } = useTheme();
  const styles = createStyles(colors, typography);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(user?.profile || {});

  // Tải dữ liệu profile mới nhất khi màn hình được mở
  useEffect(() => {
    const loadProfile = async () => {
      const latestUser = await fetchUserProfile();
      if (latestUser) {
        setProfileData(latestUser.profile);
      }
    };
    loadProfile();
  }, []);

  // Cập nhật state nội bộ khi user context thay đổi
  useEffect(() => {
    setProfileData(user?.profile || {});
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Loại bỏ các trường không cần thiết trước khi gửi
    const { _id, accountId, createdAt, updatedAt, __v, ...dataToUpdate } = profileData;

    const result = await updateUserProfile(dataToUpdate);
    if (result.success) {
      Alert.alert("Success", result.message);
      setIsEditing(false);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleCancel = () => {
    setProfileData(user?.profile || {}); // Hoàn tác thay đổi
    setIsEditing(false);
  }

  // Định dạng ngày sinh để hiển thị
  const formattedBirthday = profileData.dateOfBirth
    ? new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN') // Ví dụ: 02/07/2003
    : "";

  if (contextLoading && !user) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Personal Information</Text>
          {!isEditing && (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Feather name="edit-2" size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <InfoInput label="Full Name" value={profileData.name || ''} onChangeText={val => handleInputChange('name', val)} editable={isEditing} />
        <InfoInput label="Email Address" value={profileData.email || ''} editable={false} />
        <InfoInput label="Phone Number" value={profileData.phone || ''} onChangeText={val => handleInputChange('phone', val)} editable={isEditing} keyboardType="phone-pad" />
        <InfoInput label="Gender" value={profileData.gender || ''} onChangeText={val => handleInputChange('gender', val)} editable={isEditing} />
        <InfoInput label="Birthday" value={formattedBirthday} editable={false} />
        {/* <InfoInput label="Address" value={profileData.address || ''} onChangeText={val => handleInputChange('address', val)} editable={isEditing} />
        <InfoInput label="City" value={profileData.city || ''} onChangeText={val => handleInputChange('city', val)} editable={isEditing} />
        <InfoInput label="District" value={profileData.district || ''} onChangeText={val => handleInputChange('district', val)} editable={isEditing} />
        <InfoInput label="Ward" value={profileData.ward || ''} onChangeText={val => handleInputChange('ward', val)} editable={isEditing} /> */}

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={contextLoading}>
              <Text style={styles.saveButtonText}>{contextLoading ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={contextLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PersonalInfoScreen;
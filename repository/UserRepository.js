import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../models/User";

class UserRepository {
  constructor() {
    this.USER_KEY = "user_data";
    // Xóa bỏ việc khởi tạo người dùng mặc định
  }

  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      // Trả về null nếu không có người dùng nào được lưu trữ
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null; // Trả về null khi có lỗi
    }
  }

  async saveUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        // Xóa thông tin người dùng khi đăng xuất
        await AsyncStorage.removeItem(this.USER_KEY);
      }
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  }

  async updateUserInfo(name, email, phone) {
    try {
      const user = await this.getUser();
      if (!user) return false; // Không cập nhật nếu không có người dùng

      user.name = name;
      user.email = email;
      user.phone = phone;
      await this.saveUser(user);
      return true;
    } catch (error) {
      console.error("Error updating user info:", error);
      return false;
    }
  }

  async updatePassword(currentPassword, newPassword) {
    try {
      const user = await this.getUser();
      if (!user) {
        return { success: false, message: "No user is logged in." };
      }

      if (user.password === currentPassword) {
        user.password = newPassword;
        await this.saveUser(user);
        return { success: true, message: "Password updated successfully" };
      } else {
        return { success: false, message: "Current password is incorrect" };
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, message: "An error occurred" };
    }
  }

  async validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
}

export default new UserRepository();
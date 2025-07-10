import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../models/User";

class UserRepository {
  constructor() {
    this.USER_KEY = "user_data";
    this.TOKEN_KEY = "auth_token"; // Thêm khóa cho token
  }

  // --- Lấy thông tin người dùng ---
  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  // --- Lưu thông tin người dùng ---
  async saveUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(this.USER_KEY);
      }
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  }

  // --- Lấy token ---
  async getToken() {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // --- Lưu token ---
  async saveToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(this.TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(this.TOKEN_KEY);
      }
      return true;
    } catch (error) {
      console.error("Error saving token:", error);
      return false;
    }
  }
  
  // --- Xóa cả user và token khi đăng xuất ---
  async clearAll() {
      try {
          await AsyncStorage.removeItem(this.USER_KEY);
          await AsyncStorage.removeItem(this.TOKEN_KEY);
          return true;
      } catch(error) {
          console.error("Error clearing all data:", error);
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../models/User";

class UserRepository {
  constructor() {
    this.USER_KEY = "user_data";
    // Initialize with default user for demo purposes
    this.initializeUser();
  }

  async initializeUser() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      if (!userData) {
        const defaultUser = new User(
          "John Doe",
          "john.doe@example.com",
          "+1234567890",
          "Password123"
        );
        await this.saveUser(defaultUser);
      }
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  }

  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return new User();
    } catch (error) {
      console.error("Error getting user:", error);
      return new User();
    }
  }

  async saveUser(user) {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  }

  async updateUserInfo(name, email, phone) {
    try {
      const user = await this.getUser();
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
    // Password must be at least 8 characters, contain at least one uppercase letter,
    // one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
}

export default new UserRepository();

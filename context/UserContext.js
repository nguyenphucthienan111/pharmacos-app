// New folder/context/UserContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import UserRepository from "../repository/UserRepository";
import { User } from "../models/User";
import { ApiEndpoints } from "../config/apiConfig"; // Import cấu hình API

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const userData = await UserRepository.getUser();
    if (userData) {
      const userInstance = new User(
        userData.name,
        userData.email,
        userData.phone,
        "",
        userData.isAdmin
      );
      setUser(userInstance);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(ApiEndpoints.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      const loggedInUser = new User(
        data.user.name,
        data.user.email,
        data.user.phone,
        "",
        data.user.role?.toLowerCase() === "admin"
      );
      await UserRepository.saveUser(loggedInUser);
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM REGISTER ĐÃ ĐƯỢC CẬP NHẬT ---
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(ApiEndpoints.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true, message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực." };

    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  // --- KẾT THÚC CẬP NHẬT ---

  const logout = async () => {
    await UserRepository.saveUser(null);
    setUser(null);
  };

  // Các hàm khác giữ nguyên
  const updateUserInfo = async (name, email, phone) => { /* ... */ };
  const updatePassword = async (currentPassword, newPassword) => { /* ... */ };
  const validatePassword = async (password) => { /* ... */ };


  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserInfo,
        updatePassword,
        validatePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
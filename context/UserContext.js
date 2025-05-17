import React, { createContext, useContext, useState, useEffect } from "react";
import UserRepository from "../repository/UserRepository";
import { User } from "../models/User";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(new User());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await UserRepository.getUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError("Failed to load user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = async (name, email, phone) => {
    try {
      setLoading(true);
      const success = await UserRepository.updateUserInfo(name, email, phone);
      if (success) {
        await loadUser();
        return { success: true, message: "Profile updated successfully" };
      }
      return { success: false, message: "Failed to update profile" };
    } catch (err) {
      setError("Failed to update user data");
      console.error(err);
      return { success: false, message: "An error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const result = await UserRepository.updatePassword(
        currentPassword,
        newPassword
      );
      if (result.success) {
        await loadUser();
      }
      return result;
    } catch (err) {
      setError("Failed to update password");
      console.error(err);
      return { success: false, message: "An error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = async (password) => {
    return await UserRepository.validatePassword(password);
  };

  const logout = () => {
    // Implement logout logic here, e.g., clear user data, tokens, etc.
    setUser(new User());
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        updateUserInfo,
        updatePassword,
        validatePassword,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };

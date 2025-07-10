import React, { createContext, useContext, useState, useEffect } from "react";
import UserRepository from "../repository/UserRepository";
import { User } from "../models/User";
import { ApiEndpoints } from "../config/apiConfig";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const userData = await UserRepository.getUser();
    const storedToken = await UserRepository.getToken();
    if (userData && storedToken) {
      setUser(new User(userData));
      setToken(storedToken);
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(ApiEndpoints.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      const loggedInUser = new User(data.user);

      await UserRepository.saveUser(loggedInUser);
      await UserRepository.saveToken(data.token);

      setUser(loggedInUser);
      setToken(data.token);

      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await UserRepository.clearAll();
    setUser(null);
    setToken(null);
  };

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

  // --- HÀM MỚI: LẤY THÔNG TIN PROFILE TỪ SERVER ---
  const fetchUserProfile = async () => {
    if (!token) return; // Không thực hiện nếu không có token
    setLoading(true);
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.GET_PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch profile");

      // Cập nhật lại user trong state và local storage
      const updatedUser = new User({ ...user, profile: data });
      await UserRepository.saveUser(updatedUser);
      setUser(updatedUser);

      return updatedUser;
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM MỚI: CẬP NHẬT PROFILE ---
  const updateUserProfile = async (profileData) => {
    if (!token) return { success: false, message: 'Not authenticated' };

    setLoading(true);
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.UPDATE_PROFILE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      // Đọc phản hồi dưới dạng văn bản trước
      const responseText = await response.text();

      if (!response.ok) {
        // In ra nội dung lỗi HTML nếu có
        console.error("Server returned an error page:", responseText);
        // Cố gắng parse JSON để lấy message, nếu không được thì hiển thị lỗi chung
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.message || "Failed to update profile");
        } catch (e) {
          throw new Error("Failed to update profile. Server returned a non-JSON response.");
        }
      }

      // Cập nhật lại state sau khi lưu thành công
      await fetchUserProfile();

      return { success: true, message: 'Profile updated successfully!' };
    } catch (err) {
      console.error("Update profile error:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    if (!token) return { success: false, message: 'Not authenticated' };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.CHANGE_PASSWORD, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password.');
      }

      // Đăng xuất người dùng sau khi đổi mật khẩu thành công để họ đăng nhập lại
      await logout();

      return { success: true, message: 'Password changed successfully! Please log in again.' };
    } catch (err) {
      console.error("Change password error:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = async (password) => {
    return await UserRepository.validatePassword(password);
  };

  // --- CÁC HÀM API ĐỊA CHỈ MỚI ---
  const fetchAddresses = async () => {
    if (!token) return [];
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.GET_ADDRESSES, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch addresses');
      return await response.json();
    } catch (err) {
      console.error("Fetch addresses error:", err);
      return [];
    }
  };

  const addAddress = async (addressData) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.ADD_ADDRESS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addressData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add address');
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateAddress = async (id, addressData) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.UPDATE_ADDRESS(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addressData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update address');
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteAddress = async (id) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.DELETE_ADDRESS(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete address');
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // --- CÁC HÀM MỚI ĐỂ QUẢN LÝ ĐƠN HÀNG ---

  const fetchMyOrders = async () => {
    if (!token) return [];
    try {
      const response = await fetch(ApiEndpoints.ORDERS.GET_MY_ORDERS, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Fetch orders error:", err);
      return [];
    }
  };

  const cancelOrder = async (orderId, reason) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const response = await fetch(ApiEndpoints.ORDERS.CANCEL_ORDER(orderId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to cancel order');
      return { success: true, message: 'Order cancelled successfully.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        fetchUserProfile,
        updateUserProfile,
        updatePassword,
        validatePassword,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        fetchMyOrders,
        cancelOrder,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
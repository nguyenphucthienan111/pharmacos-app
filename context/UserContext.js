import React, { createContext, useContext, useState, useEffect } from "react";
import UserRepository from "../repository/UserRepository";
import { User } from "../models/User";
import { ApiEndpoints } from "../config/apiConfig";

const UserContext = createContext(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const fetchCart = async (currentToken) => {
    if (!currentToken) {
      setCartItems([]);
      return;
    }
    try {
      const response = await fetch(ApiEndpoints.CART.GET, {
        headers: { 'Authorization': `Bearer ${currentToken}` },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.items)) {
        const mappedItems = data.items
          .map(item => {
            // Bỏ qua item nếu productId không tồn tại hoặc là null
            if (!item.productId || typeof item.productId !== 'object') {
              return null;
            }

            const product = item.productId;

            return {
              id: item._id,
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || product.images?.[0],
              quantity: item.quantity,
            };
          })
          .filter(Boolean); // Lọc bỏ các giá trị null ra khỏi mảng

        setCartItems(mappedItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    const loadUserAndCart = async () => {
      setLoading(true);
      const userData = await UserRepository.getUser();
      const storedToken = await UserRepository.getToken();
      if (userData && storedToken) {
        setUser(new User(userData));
        setToken(storedToken);
        await fetchCart(storedToken);
      }
      setLoading(false);
    };
    loadUserAndCart();
  }, []);

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
      if (!response.ok || !data.user) {
        throw new Error(data.message || 'Login failed: User data not found in response');
      }

      const loggedInUser = new User(data.user);
      await UserRepository.saveUser(loggedInUser);
      await UserRepository.saveToken(data.token);

      setUser(loggedInUser);
      setToken(data.token);
      await fetchCart(data.token);
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
    setCartItems([]);
  };

  const addToCart = async (product, quantity = 1) => {
    if (!token) return { success: false, message: 'Please log in' };
    try {
      const response = await fetch(ApiEndpoints.CART.ADD_ITEM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (response.ok) {
        await fetchCart(token);
        return { success: true };
      }
      const data = await response.json();
      throw new Error(data.message || 'Could not add item');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    if (!token) return { success: false, message: 'Please log in' };
    try {
      const response = await fetch(ApiEndpoints.CART.UPDATE_ITEM(itemId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        await fetchCart(token);
        return { success: true };
      }
      const data = await response.json();
      throw new Error(data.message || 'Could not update item');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const removeCartItem = async (itemId) => {
    if (!token) return { success: false, message: 'Please log in' };
    try {
      const response = await fetch(ApiEndpoints.CART.REMOVE_ITEM(itemId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchCart(token);
        return { success: true };
      }
      const data = await response.json();
      throw new Error(data.message || 'Could not remove item');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Hàm clearCart: xóa toàn bộ giỏ hàng trên server và local
  const clearCart = async () => {
    if (!token) {
      setCartItems([]);
      return;
    }
    try {
      const response = await fetch(ApiEndpoints.CART.CLEAR, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setCartItems([]);
      } else {
        // Nếu API không hỗ trợ xoá toàn bộ, fallback về clear local
        setCartItems([]);
      }
    } catch (err) {
      setCartItems([]);
    }
  };

  // ... (các hàm khác không đổi)
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

      return { success: true, message: "Registration successful! Please check your email for verification." };

    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.GET_PROFILE, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch profile");

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

      const responseText = await response.text();

      if (!response.ok) {
        console.error("Server returned an error page:", responseText);
        try {
          const errorJson = JSON.parse(responseText);
          throw new Error(errorJson.message || "Failed to update profile");
        } catch (e) {
          throw new Error("Failed to update profile. Server returned a non-JSON response.");
        }
      }

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

  const fetchAddresses = async () => {
    if (!token) return [];
    try {
      const response = await fetch(ApiEndpoints.CUSTOMER.GET_ADDRESSES, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data.addresses || data || []);
      return data.addresses || data || [];
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setAddresses([]);
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

  const fetchProducts = async () => {
    try {
      const response = await fetch(ApiEndpoints.PRODUCTS.GET_ALL);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      return Array.isArray(data?.data?.products) ? data.data.products : [];
    } catch (err) {
      console.error("Fetch products error:", err);
      return [];
    }
  };

  const fetchProductById = async (productId) => {
    try {
      const response = await fetch(ApiEndpoints.PRODUCTS.GET_BY_ID(productId), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch product details');
      return await response.json();
    } catch (err) {
      console.error("Fetch product by ID error:", err);
      return null;
    }
  };

  const submitReview = async (productId, reviewData, reviewId = null) => {
    const isUpdating = !!reviewId;
    const url = isUpdating
      ? ApiEndpoints.PRODUCTS.UPDATE_REVIEW(productId, reviewId)
      : ApiEndpoints.PRODUCTS.ADD_REVIEW(productId);
    const method = isUpdating ? 'PUT' : 'POST';

    if (!token) return { success: false, message: 'You must be logged in.' };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reviewData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${isUpdating ? 'update' : 'add'} review.`);
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleFavorite = async (productId) => {
    if (!token) return { success: false, message: 'You must be logged in to favorite items.' };
    try {
      const response = await fetch(ApiEndpoints.FAVORITES.TOGGLE(productId), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update favorites');
      return { success: true, isFavorite: data.isFavorite };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  const addFavorite = async (productId) => {
    if (!token) return { success: false, message: 'You must be logged in to favorite items.' };
    try {
      const response = await fetch(ApiEndpoints.FAVORITES.ACTION(productId), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add favorite');
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const removeFavorite = async (productId) => {
    if (!token) return { success: false, message: 'You must be logged in to manage favorites.' };
    try {
      const response = await fetch(ApiEndpoints.FAVORITES.ACTION(productId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove favorite');
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const fetchFavorites = async () => {
    if (!token) return [];
    try {
      const response = await fetch(ApiEndpoints.FAVORITES.GET_ALL, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error("Fetch favorites error:", err);
      return [];
    }
  };


  const value = {
    user,
    token,
    loading,
    error,
    cartItems,
    setCartItems,
    addresses,
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
    fetchProducts,
    fetchProductById,
    submitReview,
    toggleFavorite,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    fetchCart,
    clearCart
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
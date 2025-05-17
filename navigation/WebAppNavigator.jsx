import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useUser } from "../context/UserContext";

// Screens
import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileScreen from "../profile/ProfileScreen";
import PersonalInfoScreen from "../profile/PersonalInfoScreen";
import ChangePasswordScreen from "../profile/ChangePasswordScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";

// Web-compatible navigation component
const WebAppNavigator = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/register"
            element={<LoginScreen initialParams={{ isRegisterMode: true }} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  if (user.isAdmin) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<AdminDashboardScreen />} />
          <Route path="/category/:id" element={<CategoryScreen />} />
          <Route path="/product/:id" element={<ProductDetailScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/personal-info" element={<PersonalInfoScreen />} />
          <Route path="/change-password" element={<ChangePasswordScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <RouteChangeTracker />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/category/:id" element={<CategoryScreen />} />
        <Route path="/product/:id" element={<ProductDetailScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/personal-info" element={<PersonalInfoScreen />} />
        <Route path="/change-password" element={<ChangePasswordScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default WebAppNavigator;

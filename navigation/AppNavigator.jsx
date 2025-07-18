import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

// Các màn hình
import HomeScreen from "../screens/HomeScreen";
import CategoryScreen from "../screens/CategoryScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import LoginScreen from "../screens/LoginScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import ProfileScreen from "../profile/ProfileScreen";
import PersonalInfoScreen from "../profile/PersonalInfoScreen";
import ChangePasswordScreen from "../profile/ChangePasswordScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AddressBookScreen from "../screens/AddressBookScreen";
import MyOrdersScreen from "../profile/MyOrdersScreen";
import AIImageSearchScreen from "../screens/AIImageSearchScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import OrderDetailScreen from "../profile/OrderDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { user } = useUser();
  const { colors } = useTheme();

  // Tabs cho người dùng thông thường
  const MainTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Home") iconName = "home";
            else if (route.name === "Favorites") iconName = "heart";
            else if (route.name === "Profile") iconName = "user";
            return <Feather name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  };

  // Tabs cho quản trị viên
  const AdminTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Dashboard") iconName = "grid";
            else if (route.name === "Profile") iconName = "user";
            return <Feather name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {!user ? (
          // Người dùng chưa đăng nhập
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: 'Verify Email' }} />
          </>
        ) : user.isAdmin ? (
          // Người dùng là Admin
          <>
            <Stack.Screen name="AdminMain" component={AdminTabs} options={{ headerShown: false }} />
            <Stack.Screen name="AIImageSearch" component={AIImageSearchScreen} options={{ title: 'Search by Image' }} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ title: 'Personal Info' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
            <Stack.Screen name="AddressBook" component={AddressBookScreen} options={{ title: 'My Addresses' }} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
            <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
          </>
        ) : (
          // Người dùng thông thường
          <>
            {/* <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} /> */}
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
            <Stack.Screen name="AIImageSearch" component={AIImageSearchScreen} options={{ title: 'Search by Image' }} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ title: 'Personal Info' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
            <Stack.Screen name="AddressBook" component={AddressBookScreen} options={{ title: 'My Addresses' }} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
            <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
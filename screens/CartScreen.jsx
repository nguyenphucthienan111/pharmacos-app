import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "../components/WebCompatUI";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { useUser } from "../context/UserContext";

const formatVND = (amount) => amount.toLocaleString('vi-VN') + ' VND';

const CartScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const { cartItems, loading, updateCartItemQuantity, removeCartItem } = useUser();

  const handleQuantityChange = (id, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateCartItemQuantity(id, newQuantity);
    } else {
      removeCartItem(id);
    }
  };

  const handleRemoveItem = (id) => {
    removeCartItem(id);
  };

  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Loading cart...</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Feather name="shopping-cart" size={64} color={colors.surfaceVariant} />
        <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Your cart is empty</Text>
        <TouchableOpacity
          style={[styles.shopButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.itemsContainer}>
          {cartItems.map((item) => (
            <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.surface }]}>
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: colors.onSurfaceVariant }]}>{item.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatVND(item.price)}</Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
                  >
                    <Feather name="minus" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: colors.onSurfaceVariant }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
                  >
                    <Feather name="plus" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.itemActions}>
                <Text style={[styles.itemTotal, { color: colors.primary }]}> {formatVND(item.price * item.quantity)} </Text>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
                  <Feather name="trash-2" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.onSurfaceVariant }]}>{formatVND(subTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.onSurfaceVariant }]}>{formatVND(5000)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: colors.onSurfaceVariant }]}>{formatVND(3240)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.surfaceVariant }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.onSurfaceVariant }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatVND(subTotal + 5000 + 3240)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.checkoutBar, {
        backgroundColor: colors.surface,
        borderTopColor: colors.surfaceVariant,
        paddingBottom: Platform.OS === "ios" ? 24 : 16
      }]}>
        <View style={styles.totalSection}>
          <Text style={[styles.totalLabel, { color: colors.onSurfaceVariant }]}>Total:</Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>{formatVND(subTotal + 5000 + 3240)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  itemsContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  itemActions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  totalSection: {
    flexDirection: "column",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  checkoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});

export default CartScreen;

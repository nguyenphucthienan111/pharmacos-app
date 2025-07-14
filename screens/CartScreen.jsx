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

const formatVND = (amount) => amount.toLocaleString("vi-VN") + " VND";

const luxuryColors = {
  gold: "#bfa14a",
  goldLight: "#e5c07b",
  navy: "#1a237e",
  bg: "#f8f9fa",
  card: "#fff",
  border: "#e5c07b",
  borderActive: "#bfa14a",
  shadow: "rgba(191,161,74,0.15)",
};

const luxuryStyles = StyleSheet.create({
  luxuryCard: {
    backgroundColor: luxuryColors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: luxuryColors.border,
    padding: 18,
    marginBottom: 16,
    shadowColor: luxuryColors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#eee",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: luxuryColors.navy,
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  itemPrice: {
    fontSize: 15,
    color: luxuryColors.gold,
    fontWeight: "bold",
    marginBottom: 4,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: luxuryColors.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: luxuryColors.navy,
    marginHorizontal: 8,
  },
  itemTotal: {
    fontSize: 15,
    color: luxuryColors.navy,
    fontWeight: "bold",
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
    alignSelf: "flex-end",
  },
  summaryCard: {
    backgroundColor: luxuryColors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: luxuryColors.border,
    padding: 18,
    margin: 16,
    marginTop: 0,
    shadowColor: luxuryColors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#555",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  summaryValue: {
    fontSize: 15,
    color: luxuryColors.navy,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  divider: {
    height: 1,
    backgroundColor: luxuryColors.goldLight,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "bold",
    color: luxuryColors.gold,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: luxuryColors.navy,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  checkoutBtn: {
    backgroundColor: luxuryColors.gold,
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: luxuryColors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  checkoutBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

const CartScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const {
    cartItems,
    loading,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = useUser();

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

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
          Loading cart...
        </Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Feather name="shopping-cart" size={64} color={colors.surfaceVariant} />
        <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
          Your cart is empty
        </Text>
        <TouchableOpacity
          style={[styles.shopButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Main")}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: luxuryColors.bg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 16,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: luxuryColors.gold,
            fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
          }}
        >
          Your Cart
        </Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            onPress={clearCart}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 8,
              borderRadius: 20,
              backgroundColor: luxuryColors.goldLight,
              marginLeft: 8,
            }}
          >
            <Feather name="trash-2" size={22} color={luxuryColors.navy} />
            <Text
              style={{
                marginLeft: 6,
                color: luxuryColors.navy,
                fontWeight: "bold",
                fontSize: 15,
                fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
              }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
      >
        {cartItems.map((item) => (
          <View key={item.id} style={luxuryStyles.luxuryCard}>
            <Image
              source={{ uri: item.image }}
              style={luxuryStyles.itemImage}
              resizeMode="cover"
            />
            <View style={luxuryStyles.itemDetails}>
              <Text style={luxuryStyles.itemName}>{item.name}</Text>
              <Text style={luxuryStyles.itemPrice}>
                {formatVND(item.price)}
              </Text>
              <View style={luxuryStyles.quantityControl}>
                <TouchableOpacity
                  style={luxuryStyles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity, -1)
                  }
                >
                  <Feather name="minus" size={18} color={luxuryColors.navy} />
                </TouchableOpacity>
                <Text style={luxuryStyles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={luxuryStyles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity, 1)
                  }
                >
                  <Feather name="plus" size={18} color={luxuryColors.navy} />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: 60,
              }}
            >
              <Text style={luxuryStyles.itemTotal}>
                {formatVND(item.price * item.quantity)}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                style={luxuryStyles.removeButton}
              >
                <Feather name="trash-2" size={20} color={luxuryColors.gold} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={luxuryStyles.summaryCard}>
          <View style={luxuryStyles.summaryRow}>
            <Text style={luxuryStyles.summaryLabel}>Subtotal</Text>
            <Text style={luxuryStyles.summaryValue}>{formatVND(subTotal)}</Text>
          </View>
          <View style={luxuryStyles.summaryRow}>
            <Text style={luxuryStyles.summaryLabel}>Shipping Fee</Text>
            <Text style={luxuryStyles.summaryValue}>{formatVND(1000)}</Text>
          </View>
          <View style={luxuryStyles.divider} />
          <View style={luxuryStyles.summaryRow}>
            <Text style={luxuryStyles.totalLabel}>Total</Text>
            <Text style={luxuryStyles.totalValue}>
              {formatVND(subTotal + 1000)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={luxuryStyles.checkoutBtn}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={luxuryStyles.checkoutBtnText}>Checkout</Text>
        </TouchableOpacity>
      </ScrollView>
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

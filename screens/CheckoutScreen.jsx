import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  Platform,
  Image,
} from "../components/WebCompatUI";
import { Linking } from "react-native";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { ApiEndpoints } from "../config/apiConfig";

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

const CheckoutScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { cartItems, user, addresses, fetchAddresses, clearCart, token } =
    useUser();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    const loadAddresses = async () => {
      setAddressLoading(true);
      await fetchAddresses();
      setAddressLoading(false);
    };
    loadAddresses();
  }, []); // chỉ chạy 1 lần khi mount

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addresses]);

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingFee = 1000; // Lấy từ API hoặc mặc định 1.000 VND
  const total = subTotal + shippingFee;

  const handlePlaceOrder = async () => {
    console.log("== HANDLE PLACE ORDER ==");
    console.log("Token:", token);
    if (!selectedAddress) {
      Alert.alert("Please select a delivery address!");
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert("Your cart is empty!");
      return;
    }
    setLoading(true);
    const payload = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      shippingAddress:
        selectedAddress.address +
        ", " +
        selectedAddress.ward +
        ", " +
        selectedAddress.district +
        ", " +
        selectedAddress.city,
      recipientName: selectedAddress.name,
      phone: selectedAddress.phone,
      paymentMethod: selectedPayment, // Đúng biến
      note,
    };
    console.log("Order payload:", payload);
    try {
      const res = await fetch(ApiEndpoints.ORDERS.PLACE_ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Order API status:", res.status, "response:", data);
      if (res.status === 201 || res.ok) {
        // Xử lý khác nhau cho từng payment method
        if (selectedPayment === "cod") {
          // COD: Báo thành công ngay
          if (typeof clearCart === "function") clearCart();
          Alert.alert("Order placed successfully!", "", [
            {
              text: "OK",
              onPress: () => navigation.navigate("Main"),
            },
          ]);
        } else if (selectedPayment === "online") {
          // Online Payment: Tạo payment link và chuyển hướng
          try {
            const orderId = data.order._id;
            console.log("Creating payment link for order:", orderId);
            console.log(
              "Payment API endpoint:",
              ApiEndpoints.PAYMENTS.CREATE_PAYMENT_LINK
            );

            const paymentRes = await fetch(
              ApiEndpoints.PAYMENTS.CREATE_PAYMENT_LINK,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({
                  orderId: orderId,
                  paymentMethod: "online",
                }),
              }
            );

            const paymentData = await paymentRes.json();
            console.log("Payment API status:", paymentRes.status);
            console.log("Payment API response:", paymentData);

            if (paymentRes.ok && paymentData.success) {
              // Clear cart sau khi tạo payment link thành công
              if (typeof clearCart === "function") clearCart();

              console.log("Payment link created successfully!");
              console.log("Payment URL:", paymentData.data.paymentUrl);
              console.log("Platform:", Platform.OS);

              // Chuyển hướng đến PayOS
              if (Platform.OS === "web") {
                console.log("Opening PayOS URL in new tab...");
                window.open(paymentData.data.paymentUrl, "_blank");
              } else {
                // Cho mobile, sử dụng Linking
                console.log("Opening PayOS URL with Linking...");
                await Linking.openURL(paymentData.data.paymentUrl);
              }

              Alert.alert(
                "Redirecting to PayOS",
                "You will be redirected to PayOS payment page with QR code. Please scan the QR code or complete the payment to confirm your order.",
                [
                  {
                    text: "Copy Link",
                    onPress: () => {
                      if (Platform.OS === "web") {
                        navigator.clipboard.writeText(
                          paymentData.data.paymentUrl
                        );
                        Alert.alert("Link copied to clipboard!");
                      }
                    },
                  },
                  {
                    text: "OK",
                    onPress: () => navigation.navigate("Main"),
                  },
                ]
              );
            } else {
              // Order đã tạo thành công nhưng payment link thất bại
              console.log("Payment link creation failed!");
              console.log("Payment response status:", paymentRes.status);
              console.log("Payment error message:", paymentData.message);

              // Vẫn clear cart và báo cho user
              if (typeof clearCart === "function") clearCart();
              Alert.alert(
                "Order Created",
                `Your order has been created successfully, but there was an issue creating the payment link: ${
                  paymentData.message || "Unknown error"
                }. Please contact support for assistance.`,
                [
                  {
                    text: "OK",
                    onPress: () => navigation.navigate("Main"),
                  },
                ]
              );
            }
          } catch (paymentError) {
            console.error("Payment creation error:", paymentError);
            // Order đã tạo thành công nhưng payment link thất bại
            // Vẫn clear cart và báo cho user
            if (typeof clearCart === "function") clearCart();
            Alert.alert(
              "Order Created",
              "Your order has been created successfully, but there was an issue creating the payment link. Please contact support for assistance.",
              [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("Main"),
                },
              ]
            );
          }
        } else {
          // Xử lý các payment method khác (nếu có)
          if (typeof clearCart === "function") clearCart();
          Alert.alert("Order placed successfully!", "", [
            {
              text: "OK",
              onPress: () => navigation.navigate("Main"),
            },
          ]);
        }
      } else {
        console.log("Order failed branch", data); // Log chi tiết lỗi backend
        Alert.alert(
          "Order failed",
          data.message || JSON.stringify(data) || "Please try again."
        );
      }
    } catch (e) {
      console.log("Order failed in catch:", e);
      Alert.alert("Order failed", e.message || "Please try again.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: luxuryColors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: luxuryColors.gold,
            marginBottom: 24,
            fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
          }}
        >
          Order Confirmation
        </Text>
        {/* Delivery Address Selection */}
        <View style={[luxuryStyles.luxuryCard, { marginBottom: 18 }]}>
          <Text style={luxuryStyles.cardTitle}>Delivery Address</Text>
          {addressLoading ? (
            <ActivityIndicator color={luxuryColors.gold} />
          ) : addresses && addresses.length > 0 ? (
            <>
              {addresses.map((addr) => (
                <TouchableOpacity
                  key={addr._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                  onPress={() => setSelectedAddress(addr)}
                >
                  <Feather
                    name={
                      selectedAddress?._id === addr._id
                        ? "check-circle"
                        : "circle"
                    }
                    size={20}
                    color={
                      selectedAddress?._id === addr._id
                        ? luxuryColors.gold
                        : luxuryColors.navy
                    }
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text
                      style={[luxuryStyles.cardText, { fontWeight: "bold" }]}
                    >
                      {addr.name} ({addr.phone})
                    </Text>
                    <Text style={luxuryStyles.cardText}>
                      {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => navigation.navigate("AddressBook")}
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Feather
                  name="plus-circle"
                  size={18}
                  color={luxuryColors.gold}
                />
                <Text
                  style={{
                    color: luxuryColors.gold,
                    fontWeight: "bold",
                    marginLeft: 6,
                  }}
                >
                  Add New Address
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("AddressBook")}
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather name="plus-circle" size={18} color={luxuryColors.gold} />
              <Text
                style={{
                  color: luxuryColors.gold,
                  fontWeight: "bold",
                  marginLeft: 6,
                }}
              >
                Add New Address
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Products */}
        <View style={[luxuryStyles.luxuryCard, { marginBottom: 18 }]}>
          <Text style={luxuryStyles.cardTitle}>Products</Text>
          {cartItems.map((item) => (
            <View
              key={item.productId || item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://via.placeholder.com/60x60?text=No+Image",
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  marginRight: 12,
                  backgroundColor: "#eee",
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={luxuryStyles.cardText}>{item.name}</Text>
                <Text
                  style={[luxuryStyles.cardText, { color: luxuryColors.gold }]}
                >
                  {item.price.toLocaleString()} VND x{item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>
        {/* Payment Method */}
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 17,
            color: luxuryColors.navy,
            marginBottom: 10,
          }}
        >
          Select Payment Method
        </Text>
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 18 }}>
          <TouchableOpacity
            style={[
              luxuryStyles.luxuryCard,
              luxuryStyles.paymentOption,
              selectedPayment === "cod" && luxuryStyles.selected,
            ]}
            onPress={() => setSelectedPayment("cod")}
          >
            <Feather name="truck" size={28} color={luxuryColors.gold} />
            <Text style={luxuryStyles.cardTitle}>Cash on Delivery (COD)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              luxuryStyles.luxuryCard,
              luxuryStyles.paymentOption,
              selectedPayment === "online" && luxuryStyles.selected,
            ]}
            onPress={() => setSelectedPayment("online")}
          >
            <Feather name="credit-card" size={28} color={luxuryColors.navy} />
            <Text style={luxuryStyles.cardTitle}>Bank Transfer via PayOS</Text>
          </TouchableOpacity>
        </View>
        {/* Summary */}
        <View style={[luxuryStyles.luxuryCard, { marginBottom: 18 }]}>
          <View style={luxuryStyles.summaryRow}>
            <Text style={luxuryStyles.summaryLabel}>Subtotal</Text>
            <Text style={luxuryStyles.summaryValue}>
              {subTotal.toLocaleString()} VND
            </Text>
          </View>
          <View style={luxuryStyles.summaryRow}>
            <Text style={luxuryStyles.summaryLabel}>Shipping Fee</Text>
            <Text style={luxuryStyles.summaryValue}>1,000 VND</Text>
          </View>
          <View style={luxuryStyles.summaryRowTotal}>
            <Text style={luxuryStyles.summaryLabelTotal}>Total</Text>
            <Text style={luxuryStyles.summaryValueTotal}>
              {total.toLocaleString()} VND
            </Text>
          </View>
        </View>
        {/* Place Order Button */}
        <TouchableOpacity
          style={luxuryStyles.luxuryBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              Place Order
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const luxuryStyles = StyleSheet.create({
  luxuryCard: {
    backgroundColor: luxuryColors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: luxuryColors.border,
    padding: 18,
    marginBottom: 12,
    shadowColor: luxuryColors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  selected: {
    borderColor: luxuryColors.borderActive,
    shadowColor: luxuryColors.gold,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  paymentOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    marginRight: 0,
    marginLeft: 0,
    minHeight: 90,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: luxuryColors.navy,
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  cardText: {
    color: "#333",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    color: "#555",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  summaryValue: {
    color: luxuryColors.navy,
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e3e3e3",
    paddingTop: 10,
  },
  summaryLabelTotal: {
    color: luxuryColors.gold,
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  summaryValueTotal: {
    color: luxuryColors.navy,
    fontWeight: "bold",
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  luxuryBtn: {
    backgroundColor: luxuryColors.gold,
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: luxuryColors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default CheckoutScreen;

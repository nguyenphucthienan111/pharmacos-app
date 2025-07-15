import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Platform,
} from "../components/WebCompatUI";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { ApiEndpoints } from "../config/apiConfig";

const ORDER_STATUS_MAP = {
  pending: { label: "Pending", color: "#faad14" },
  processing: { label: "Processing", color: "#1890ff" },
  completed: { label: "Completed", color: "#52c41a" },
  cancelled: { label: "Cancelled", color: "#f5222d" },
};

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

const OrderDetailScreen = () => {
  const { colors } = useTheme();
  const { params } = useRoute();
  const navigation = useNavigation();
  const { token, addToCart } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.orderId) return;
    setLoading(true);
    fetch(ApiEndpoints.ORDERS.GET_ORDER_DETAIL(params.orderId), {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data?.order) {
          let items = data.items || [];
          // Fetch product details if missing
          const updatedItems = await Promise.all(
            items.map(async (item) => {
              if (typeof item.productId === "string") {
                // Only ID, need to fetch detail
                try {
                  const res = await fetch(
                    ApiEndpoints.PRODUCTS.GET_BY_ID(item.productId)
                  );
                  const prod = await res.json();
                  return { ...item, productId: prod.product || prod };
                } catch {
                  return item;
                }
              }
              return item;
            })
          );
          setOrder({ ...data.order, items: updatedItems });
        } else {
          setOrder(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.orderId, token]);

  // Thêm hàm xử lý Buy Again
  const handleBuyAgain = async () => {
    if (!order || !order.items) return;
    let added = 0;
    for (const item of order.items) {
      const prod = item.productId;
      if (!prod || !prod._id || !prod.name) {
        continue;
      }
      const result = await addToCart(
        {
          id: prod._id,
          name: prod.name,
          price: prod.price,
          image: prod.images?.[0]?.url || prod.images?.[0],
        },
        item.quantity || 1
      );
      if (result.success) added++;
    }
    if (added > 0) {
      Alert.alert("Success", `Đã thêm ${added} sản phẩm vào giỏ hàng!`);
      navigation.navigate("Cart");
    } else {
      Alert.alert(
        "Không thể mua lại",
        "Không có sản phẩm nào còn tồn tại để thêm vào giỏ hàng."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>Order not found.</Text>
      </View>
    );
  }
  const status = order.status?.toLowerCase() || "pending";
  const total = (order.items || []).reduce(
    (sum, item) =>
      sum + (item.unitPrice || item.price || 0) * (item.quantity || 1),
    0
  );

  const shipFee = 1000; // Phí ship cố định lấy từ API hoặc mặc định 1.000 VND
  const discount = 0; // Giả định chưa có giảm giá
  const voucherDiscount = 0; // Giả định chưa có voucher
  const grandTotal = total + shipFee - discount - voucherDiscount;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 0, backgroundColor: "#f4f6fb" }}
      >
        {/* Header: trạng thái, mã đơn, ngày đặt */}
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <Text
              style={styles.orderIdHeader}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              #{order.id || order._id}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: ORDER_STATUS_MAP[status]?.color },
              ]}
            >
              <Text style={styles.statusText}>
                {ORDER_STATUS_MAP[status]?.label || status}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDateHeader}>
            Date:{" "}
            {order.orderDate ? new Date(order.orderDate).toLocaleString() : "-"}
          </Text>
        </View>

        {/* Estimated delivery nếu chưa bị hủy */}
        {status !== "cancelled" && (
          <View style={styles.estimateBox}>
            <Text style={styles.estimateTitle}>Estimated delivery</Text>
            <Text style={styles.estimateText}>
              From <Text style={{ fontWeight: "bold" }}>11:00 - 12:00</Text> on{" "}
              {order.orderDate
                ? new Date(order.orderDate).toLocaleDateString()
                : "-"}
            </Text>
            <Text style={styles.estimateSub}>
              Your order is being processed at PharmaCos.
            </Text>
          </View>
        )}
        {/* Thông báo khi đơn bị hủy */}
        {status === "cancelled" && (
          <View style={styles.cancelBox}>
            <Text style={styles.cancelText}>
              Order cancelled at{" "}
              {order.updatedAt
                ? new Date(order.updatedAt).toLocaleTimeString()
                : "-"}{" "}
              on{" "}
              {order.updatedAt
                ? new Date(order.updatedAt).toLocaleDateString()
                : "-"}
            </Text>
            {order.cancelReason && (
              <Text style={styles.cancelReason}>
                Reason: {order.cancelReason}
              </Text>
            )}
            <Text style={styles.cancelSub}>
              We hope to serve you again next time.
            </Text>
          </View>
        )}

        {/* Thông tin người nhận và địa chỉ */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Recipient</Text>
            <Text style={styles.infoValue}>{order.recipientName}</Text>
            <Text style={styles.infoValue}>{order.phone}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Delivery Address</Text>
            <Text style={styles.infoValue}>{order.shippingAddress}</Text>
          </View>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          {(order.items || []).map((item, idx) => (
            <View key={item._id || idx} style={styles.productCard}>
              <Image
                source={
                  item.productId?.images &&
                  item.productId.images.length > 0 &&
                  item.productId.images[0].url
                    ? { uri: item.productId.images[0].url }
                    : { uri: "https://via.placeholder.com/80x80?text=No+Image" }
                }
                style={styles.productImage}
              />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.productName}>
                  {item.productId?.name || "Product"}
                </Text>
                <Text style={styles.productDesc}>
                  {item.productId?.description || ""}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <Text style={styles.productPrice}>
                    {formatVND(item.unitPrice || item.price || 0)}
                  </Text>
                  <Text style={styles.productQty}>x{item.quantity || 1}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Thanh toán và tổng kết */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment & Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment method</Text>
            <Text style={styles.summaryValue}>
              {order.paymentMethod === "cash"
                ? "Cash (COD)"
                : order.paymentMethod === "cod"
                ? "COD"
                : order.paymentMethod === "bank"
                ? "Online payment"
                : order.paymentMethod === "online"
                ? "Online payment"
                : order.paymentMethod || "-"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{formatVND(total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Direct discount</Text>
            <Text style={[styles.summaryValue, { color: "#ff9800" }]}>
              {formatVND(discount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Voucher discount</Text>
            <Text style={[styles.summaryValue, { color: "#ff9800" }]}>
              {formatVND(voucherDiscount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping fee</Text>
            <Text style={[styles.summaryValue, { color: "#1976d2" }]}>
              {formatVND(shipFee)}
            </Text>
          </View>
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryLabelTotal}>Grand total</Text>
            <Text style={styles.summaryValueTotal}>
              {formatVND(grandTotal)}
            </Text>
          </View>
        </View>

        {/* Nút mua lại và Back */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buyAgainButton}
            onPress={handleBuyAgain}
          >
            <Feather name="shopping-cart" size={20} color="#fff" />
            <Text style={styles.buyAgainButtonText}>Buy Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1a237e", flex: 1 },
  statusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    marginLeft: 6,
    marginRight: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  orderId: { color: "#888", marginBottom: 4 },
  orderDate: { color: "#888", marginBottom: 12 },
  section: { marginBottom: 18, paddingHorizontal: 12 },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 10,
    color: "#1976d2",
  },
  infoText: { fontSize: 15, color: "#333", marginBottom: 2 },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    shadowColor: "#1976d2",
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  productName: { fontWeight: "bold", fontSize: 16, color: "#1976d2" },
  productDesc: { color: "#888", fontSize: 13, marginBottom: 2 },
  productPrice: { color: "#1677ff", fontWeight: "bold", fontSize: 16 },
  productQty: {
    color: "#fff",
    backgroundColor: "#1976d2",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginLeft: 12,
    fontWeight: "bold",
    fontSize: 15,
    overflow: "hidden",
  },
  totalText: { color: "#1677ff", fontWeight: "bold", fontSize: 20 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976d2",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    elevation: 2,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 17,
  },
  estimateBox: {
    backgroundColor: "#e6f0fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    marginHorizontal: 12,
  },
  estimateTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1976d2",
    marginBottom: 4,
  },
  estimateText: { fontSize: 15, marginBottom: 2, color: "#1976d2" },
  estimateSub: { color: "#888", fontSize: 14 },
  cancelBox: {
    backgroundColor: "#fff3f3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ffd6d6",
  },
  cancelText: {
    fontSize: 15,
    marginBottom: 2,
    color: "#d32f2f",
    fontWeight: "bold",
  },
  cancelReason: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  cancelSub: { color: "#888", fontSize: 14, marginTop: 4 },
  buyAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1677ff",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    elevation: 2,
  },
  buyAgainButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 17,
  },
  headerBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
    marginBottom: 10,
    borderRadius: 0,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  orderIdHeader: {
    maxWidth: "65%", // hoặc 200 nếu muốn dùng pixel
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  orderDateHeader: { color: "#888", fontSize: 14 },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 2,
    fontSize: 15,
  },
  infoValue: { color: "#333", fontSize: 15, marginBottom: 2 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: { color: "#555", fontSize: 15 },
  summaryValue: { color: "#222", fontWeight: "bold", fontSize: 15 },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e3e3e3",
    paddingTop: 10,
  },
  summaryLabelTotal: { color: "#1976d2", fontWeight: "bold", fontSize: 18 },
  summaryValueTotal: { color: "#1677ff", fontWeight: "bold", fontSize: 22 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 12,
    marginBottom: 32,
    marginTop: 8,
  },
});

export default OrderDetailScreen;

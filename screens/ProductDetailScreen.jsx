import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from "../components/WebCompatUI";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";
import { useFocusEffect } from "@react-navigation/native";
import ProductCard from "../components/ProductCard"; // Import ProductCard

// Helper: Star Rating Component
const StarRating = ({ rating = 0, size = 18, onRate, disabled = false }) => (
  <View style={{ flexDirection: "row" }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => onRate && onRate(star)}
        disabled={disabled}
      >
        <AntDesign
          name={rating >= star ? "star" : "staro"}
          size={size}
          color="#FFC107"
        />
      </TouchableOpacity>
    ))}
  </View>
);

// Helper: Review Form Modal
const ReviewFormModal = ({
  visible,
  onDismiss,
  onSubmit,
  initialReview,
  product,
  isLoading,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (visible) {
      setRating(initialReview?.rating || 5);
      setComment(initialReview?.comment || "");
    }
  }, [initialReview, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {initialReview ? "Edit Your Review" : `Review "${product?.name}"`}
          </Text>
          <View style={styles.ratingInputContainer}>
            <Text style={styles.label}>Your Rating:</Text>
            <StarRating rating={rating} onRate={setRating} size={30} />
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Tell us about your experience..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButton} onPress={onDismiss}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={() => onSubmit({ rating, comment })}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const { colors } = useTheme();
  const {
    user,
    fetchProductById,
    toggleFavorite,
    submitReview,
    deleteReview,
    addToCart,
    addFavorite,
    removeFavorite,
    fetchFavorites,
  } = useUser();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [userReview, setUserReview] = useState(null); // State để lưu trữ review của user

  useFocusEffect(
    useCallback(() => {
      const loadProductData = async () => {
        setLoading(true);
        try {
          // Gọi cả hai API cùng lúc để tăng hiệu suất
          const [productResult, favoritesResult] = await Promise.all([
            fetchProductById(productId),
            user ? fetchFavorites() : Promise.resolve([]), // Chỉ gọi API yêu thích nếu người dùng đã đăng nhập
          ]);

          if (productResult && productResult.data) {
            const p = productResult.data.product;
            setProduct({ ...p, images: p.images?.map((img) => img.url) || [] });
            setSimilarProducts(productResult.data.similarProducts || []);

            // Kiểm tra xem sản phẩm hiện tại có trong danh sách yêu thích không
            if (Array.isArray(favoritesResult) && favoritesResult.length > 0) {
              const isFav = favoritesResult.some(
                (fav) => fav.product?._id === productId
              );
              setIsFavorite(isFav);
            } else {
              setIsFavorite(false);
            }

            if (user && p.reviews) {
              const foundReview = p.reviews.find(
                (r) => r.userId?._id === user.id
              );
              setUserReview(foundReview || null);
            }
          } else {
            Alert.alert("Error", "Could not load product details.");
          }
        } catch (error) {
          console.error("Failed to load product and favorite data:", error);
          Alert.alert("Error", "An error occurred while loading data.");
        } finally {
          setLoading(false);
        }
      };

      loadProductData();
      // Trả về một hàm cleanup rỗng nếu không cần
      return () => {};
    }, [productId, user, fetchProductById, fetchFavorites]) // Dependency là productId và user
  );

  const handleToggleFavorite = async () => {
    if (!user)
      return Alert.alert(
        "Login Required",
        "Please log in to manage your favorites."
      );

    const action = isFavorite ? removeFavorite : addFavorite;
    const originalStatus = isFavorite;

    // Cập nhật giao diện ngay lập tức
    setIsFavorite(!originalStatus);

    const result = await action(productId);

    // Hoàn tác nếu API thất bại
    if (!result.success) {
      setIsFavorite(originalStatus);
      Alert.alert("Error", result.message || "Failed to update favorites.");
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to add items to your cart.");
      return;
    }
    if (product.stockQuantity <= 0) {
      Alert.alert("Out of Stock", "This product is currently unavailable.");
      return;
    }

    setIsAddingToCart(true);

    const discountedPrice =
      product.price != null && product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;

    const result = await addToCart(
      {
        id: product._id,
        name: product.name,
        price: discountedPrice,
        image: product.images[0],
      },
      quantity
    );

    setIsAddingToCart(false);

    if (result.success) {
      Alert.alert(
        "Success!",
        `${quantity} x ${product.name} has been added to your cart.`
      );
    } else {
      Alert.alert(
        "Error",
        result.message || "Failed to add item to cart. Please try again."
      );
    }
  };

  const handleSubmitReview = async (reviewData) => {
    const result = await submitReview(productId, reviewData, userReview?._id);
    if (result.success) {
      Alert.alert(
        "Success",
        `Your review has been ${userReview ? "updated" : "submitted"}!`
      );
      setReviewModalVisible(false);
      loadProductData(); // Tải lại dữ liệu
    } else {
      Alert.alert("Error", result.message || "Failed to submit review.");
    }
  };

  const handleDeleteReview = () => {
    if (!userReview) return;
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteReview(productId, userReview._id);
            if (result.success) {
              Alert.alert("Success", "Your review has been deleted.");
              setUserReview(null);
              loadProductData();
            } else {
              Alert.alert(
                "Error",
                result.message || "Failed to delete review."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={styles.centerScreen}
        size="large"
        color={colors.primary}
      />
    );
  }

  if (!product) {
    return (
      <View style={styles.centerScreen}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "ingredients":
        return (
          <Text style={styles.tabContentText}>
            {product.ingredients?.join(", ") || "No ingredients listed."}
          </Text>
        );
      case "reviews":
        return (
          <View>
            {/* Chỉ hiển thị nút viết review nếu user đã đăng nhập và chưa có review */}
            {user && !userReview && (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => setReviewModalVisible(true)}
              >
                <Text style={styles.writeReviewButtonText}>Write a Review</Text>
              </TouchableOpacity>
            )}

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <View
                  key={review._id}
                  style={[
                    styles.reviewCard,
                    review._id === userReview?._id && styles.userReviewCard,
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>
                      {review.userId?.profile?.name || "Anonymous"}
                    </Text>
                    <StarRating rating={review.rating} size={14} disabled />
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <View style={styles.reviewFooter}>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                    {/* Hiển thị nút sửa/xóa nếu đây là review của user */}
                    {review._id === userReview?._id && (
                      <View style={styles.reviewActions}>
                        <TouchableOpacity
                          onPress={() => setReviewModalVisible(true)}
                        >
                          <Feather
                            name="edit-2"
                            size={16}
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteReview}>
                          <Feather
                            name="trash-2"
                            size={16}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.tabContentText}>No reviews yet.</Text>
            )}
          </View>
        );
      case "description":
      default:
        return <Text style={styles.tabContentText}>{product.description}</Text>;
    }
  };

  if (loading || !product) {
    // Thêm điều kiện !product để đảm bảo không render khi chưa có dữ liệu
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Đảm bảo discountedPrice chỉ được tính khi product.price có giá trị
  const discountedPrice =
    product.price != null && product.discount
      ? product.price * (1 - product.discount / 100)
      : null;

  return (
    <>
      <ScrollView style={styles.container}>
        <Image
          source={{
            uri:
              product.images[selectedImageIndex] ||
              "https://via.placeholder.com/400",
          }}
          style={styles.mainImage}
        />
        {product.images.length > 1 && (
          <FlatList
            horizontal
            data={product.images}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
                <Image
                  source={{ uri: item }}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.activeThumbnail,
                  ]}
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.thumbnailContainer}
          />
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>
            {Array.isArray(product.brand)
              ? product.brand.join(", ")
              : product.brand}
          </Text>
          <Text style={styles.productName}>{product.name}</Text>
          {typeof product.rating === "number" && product.rating > 0 && (
            <View style={styles.ratingContainer}>
              <StarRating rating={product.rating} size={20} disabled />
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.reviews?.length || 0}{" "}
                reviews)
              </Text>
            </View>
          )}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {discountedPrice
                ? discountedPrice.toLocaleString()
                : product.price.toLocaleString()}{" "}
              VND
            </Text>
            {discountedPrice && (
              <Text style={styles.originalPrice}>
                {product.price.toLocaleString()} VND
              </Text>
            )}
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {["description", "ingredients", "reviews"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabContentContainer}>{renderTabContent()}</View>

        {/* <Text style={styles.similarProductsTitle}>You Might Also Like</Text> */}
        {/* <FlatList
          horizontal
          data={similarProducts}
          renderItem={({ item }) => (
            <ProductCard
              key={item._id}
              product={{
                ...item,
                imageUrl:
                  item.images?.find((i) => i.isPrimary)?.url ||
                  item.images?.[0]?.url,
              }}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.similarProductsList}
        /> */}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={[styles.bottomBar, { marginBottom: 20 }]}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <AntDesign
            name={isFavorite ? "heart" : "hearto"}
            size={24}
            color={isFavorite ? colors.error : colors.onSurfaceVariant}
          />
        </TouchableOpacity>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.quantityButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity((q) => q + 1)}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
      <ReviewFormModal
        visible={isReviewModalVisible}
        onDismiss={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
        initialReview={userReview}
        product={product}
        isLoading={loading}
      />
    </>
  );
};

// ... (Các style sheets)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centerScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainImage: { width: "100%", height: 350, resizeMode: "contain" },
  thumbnailContainer: { paddingHorizontal: 10, paddingVertical: 5 },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: { borderColor: "#006782" },
  infoContainer: { padding: 20 },
  brand: { fontSize: 16, color: "#006782", marginBottom: 4, fontWeight: "500" },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingText: { marginLeft: 8, color: "#666" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  price: { fontSize: 22, fontWeight: "bold", color: "#006782" },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: "#006782" },
  tabText: { fontSize: 16, color: "#666" },
  activeTabText: { color: "#006782", fontWeight: "bold" },
  tabContentContainer: { padding: 20, minHeight: 150 },
  tabContentText: { fontSize: 16, lineHeight: 24, color: "#333" },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  favoriteButton: { padding: 10 },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginHorizontal: 10,
  },
  quantityButton: {
    fontSize: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#555",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    color: "#333",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#006782",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  reviewUser: { fontWeight: "bold" },
  reviewComment: { color: "#444" },
  reviewDate: { fontSize: 12, color: "#999", marginTop: 5 },
  writeReviewButton: {
    alignSelf: "center",
    backgroundColor: "#e6f7ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  writeReviewButtonText: { color: "#006782", fontWeight: "bold" },
  similarProductsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  similarProductsList: { paddingHorizontal: 20 },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  ratingInputContainer: { alignItems: "center", marginBottom: 20 },
  reviewInput: {
    height: 100,
    textAlignVertical: "top",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  modalButton: { padding: 12, borderRadius: 8, marginLeft: 10 },
  submitButton: { backgroundColor: "#006782" },
  submitButtonText: { color: "#fff" },
  label: { marginBottom: 10, fontSize: 16, fontWeight: "500" },
});

export default ProductDetailScreen;

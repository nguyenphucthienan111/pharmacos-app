import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "../components/WebCompatUI";
import { Feather } from "@expo/vector-icons";
import { colors, typography } from "../theme/theme";
import { UserContext } from "../context/UserContext";

// Mock data for development
const MOCK_PRODUCTS = {
  1: {
    id: 1,
    name: "Advanced Pain Relief Gel",
    price: 12.99,
    discountPercentage: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    description:
      "A fast-acting gel that provides targeted relief for muscle and joint pain. Formulated with natural ingredients to reduce inflammation and promote healing.",
    ingredients:
      "Menthol, Camphor, Aloe Vera, Arnica Extract, Vitamin E, Eucalyptus Oil",
    usage:
      "Apply a thin layer to affected area up to 3-4 times daily. Massage gently until absorbed. For external use only.",
    stock: 45,
    rating: 4.7,
    reviewCount: 128,
    relatedProducts: [7, 11, 12],
  },
  2: {
    id: 2,
    name: "Vitamin C Serum",
    price: 24.99,
    discountPercentage: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    description:
      "Powerful antioxidant serum that brightens skin tone, reduces fine lines, and protects against environmental damage. Suitable for all skin types.",
    ingredients:
      "Vitamin C (Ascorbic Acid 20%), Hyaluronic Acid, Vitamin E, Ferulic Acid, Aloe Vera, Glycerin",
    usage:
      "Apply 3-4 drops to clean, dry skin in the morning before moisturizer and sunscreen. Store in a cool, dark place.",
    stock: 32,
    rating: 4.9,
    reviewCount: 215,
    relatedProducts: [3, 6, 13, 14],
  },
  // Add more products as needed
};

// Use a fixed width for web instead of Dimensions API
const width = 800;

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { user } = useContext(UserContext);

  // In a real app, you would fetch data from an API
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const productData = MOCK_PRODUCTS[productId];
      if (productData) {
        setProduct(productData);
        // Set the header title
        navigation.setOptions({
          title: productData.name,
        });

        // Get related products
        if (
          productData.relatedProducts &&
          productData.relatedProducts.length > 0
        ) {
          const related = productData.relatedProducts
            .map((id) => MOCK_PRODUCTS[id])
            .filter((p) => p !== undefined);
          setRelatedProducts(related);
        }
      }
      setLoading(false);
    }, 1000);
  }, [productId, navigation]);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    console.log(`Added ${quantity} of ${product?.name} to cart`);
    // Show success message or navigate to cart
  };

  const handleBuyNow = () => {
    // In a real app, this would add the product to the cart and navigate to checkout
    console.log(`Buying ${quantity} of ${product?.name}`);
    navigation.navigate("Cart");
  };

  const handleRelatedProductPress = (id) => {
    navigation.push("ProductDetail", { productId: id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discountedPrice =
    product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceContainer}>
            {discountedPrice ? (
              <>
                <Text style={styles.discountedPrice}>
                  ${discountedPrice.toFixed(2)}
                </Text>
                <Text style={styles.originalPrice}>
                  ${product.price.toFixed(2)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {product.discountPercentage}% OFF
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name={
                    star <= Math.floor(product.rating)
                      ? "star"
                      : star <= product.rating
                      ? "star"
                      : "star"
                  }
                  size={16}
                  color={
                    star <= product.rating ? "#FFD700" : colors.surfaceVariant
                  }
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviewCount} reviews)
            </Text>
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <Feather
              name={product.stock > 0 ? "check-circle" : "x-circle"}
              size={16}
              color={product.stock > 0 ? "green" : colors.error}
            />
            <Text
              style={[
                styles.stockText,
                { color: product.stock > 0 ? "green" : colors.error },
              ]}
            >
              {product.stock > 0
                ? `In Stock (${product.stock} available)`
                : "Out of Stock"}
            </Text>
          </View>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Feather
                    name="minus"
                    size={16}
                    color={
                      quantity <= 1
                        ? colors.surfaceVariant
                        : colors.onSurfaceVariant
                    }
                  />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= product.stock && styles.quantityButtonDisabled,
                  ]}
                  onPress={increaseQuantity}
                  disabled={quantity >= product.stock}
                >
                  <Feather
                    name="plus"
                    size={16}
                    color={
                      quantity >= product.stock
                        ? colors.surfaceVariant
                        : colors.onSurfaceVariant
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "description" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("description")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "description" && styles.activeTabText,
                ]}
              >
                Description
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "ingredients" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("ingredients")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "ingredients" && styles.activeTabText,
                ]}
              >
                Ingredients
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "usage" && styles.activeTab]}
              onPress={() => setActiveTab("usage")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "usage" && styles.activeTabText,
                ]}
              >
                Usage
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "description" && (
              <Text style={styles.tabContentText}>{product.description}</Text>
            )}
            {activeTab === "ingredients" && (
              <Text style={styles.tabContentText}>{product.ingredients}</Text>
            )}
            {activeTab === "usage" && (
              <Text style={styles.tabContentText}>{product.usage}</Text>
            )}
          </View>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedProductsContainer}>
              <Text style={styles.relatedProductsTitle}>Related Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {relatedProducts.map((relatedProduct) => (
                  <TouchableOpacity
                    key={relatedProduct.id}
                    style={styles.relatedProductCard}
                    onPress={() => handleRelatedProductPress(relatedProduct.id)}
                  >
                    <Image
                      source={{ uri: relatedProduct.imageUrl }}
                      style={styles.relatedProductImage}
                      resizeMode="cover"
                    />
                    <View style={styles.relatedProductInfo}>
                      <Text style={styles.relatedProductName} numberOfLines={2}>
                        {relatedProduct.name}
                      </Text>
                      <Text style={styles.relatedProductPrice}>
                        ${relatedProduct.price.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Admin-only section */}
          {user?.isAdmin && (
            <View style={styles.adminSection}>
              <Text style={styles.adminSectionTitle}>Admin Controls</Text>
              <View style={styles.adminButtons}>
                <TouchableOpacity style={styles.adminButton}>
                  <Feather name="edit" size={16} color="#FFFFFF" />
                  <Text style={styles.adminButtonText}>Edit Product</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.adminButton, styles.adminDeleteButton]}
                >
                  <Feather name="trash-2" size={16} color="#FFFFFF" />
                  <Text style={styles.adminButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {product.stock > 0 && !user?.isAdmin && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Feather name="shopping-cart" size={20} color="#FFFFFF" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.large,
    color: colors.onSurfaceVariant,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: "#FFFFFF",
  },
  productImage: {
    width: "100%",
    height: width,
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  discountedPrice: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  originalPrice: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    color: colors.onSurfaceVariant,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stockText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  quantityLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
    marginRight: 16,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    borderRadius: 4,
  },
  quantityButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 16,
    minWidth: 40,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
  },
  activeTabText: {
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  tabContent: {
    marginBottom: 24,
  },
  tabContentText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
  relatedProductsContainer: {
    marginBottom: 24,
  },
  relatedProductsTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSurfaceVariant,
    marginBottom: 16,
  },
  relatedProductCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  relatedProductImage: {
    width: "100%",
    height: 140,
  },
  relatedProductInfo: {
    padding: 8,
  },
  relatedProductName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  relatedProductPrice: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  adminSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  adminSectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  adminButtons: {
    flexDirection: "row",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  adminDeleteButton: {
    backgroundColor: colors.error,
  },
  adminButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  addToCartButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buyNowButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: "#FFFFFF",
  },
});

export default ProductDetailScreen;

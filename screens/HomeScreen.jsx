import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "../components/WebCompatUI.native";
import { Feather } from "@expo/vector-icons";
import { colors, typography } from "../theme/theme";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";

// Mock data for development
const MOCK_CATEGORIES = [
  {
    id: 1,
    name: "Medications",
    productCount: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  },
  {
    id: 2,
    name: "Skincare",
    productCount: 85,
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
  },
  {
    id: 3,
    name: "Haircare",
    productCount: 64,
    imageUrl:
      "https://images.unsplash.com/photo-1626015365107-2dd2c4b667dd?w=800&q=80",
  },
  {
    id: 4,
    name: "Vitamins",
    productCount: 42,
    imageUrl:
      "https://images.unsplash.com/photo-1577196806850-567cb9e43e21?w=800&q=80",
  },
  {
    id: 5,
    name: "Baby Care",
    productCount: 38,
    imageUrl:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
  },
];

const MOCK_FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Advanced Pain Relief Gel",
    price: 12.99,
    discountPercentage: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  },
  {
    id: 2,
    name: "Vitamin C Serum",
    price: 24.99,
    discountPercentage: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
  },
  {
    id: 3,
    name: "Hydrating Face Moisturizer",
    price: 18.5,
    discountPercentage: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1626015365107-2dd2c4b667dd?w=800&q=80",
  },
  {
    id: 4,
    name: "Multivitamin Tablets",
    price: 29.99,
    discountPercentage: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1577196806850-567cb9e43e21?w=800&q=80",
  },
];

const MOCK_NEW_ARRIVALS = [
  {
    id: 5,
    name: "Organic Shampoo",
    price: 14.99,
    discountPercentage: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1626015365107-2dd2c4b667dd?w=800&q=80",
  },
  {
    id: 6,
    name: "Sunscreen SPF 50",
    price: 19.99,
    discountPercentage: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
  },
  {
    id: 7,
    name: "Allergy Relief Tablets",
    price: 8.99,
    discountPercentage: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  },
  {
    id: 8,
    name: "Baby Lotion",
    price: 11.5,
    discountPercentage: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
  },
];

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(
    MOCK_FEATURED_PRODUCTS
  );
  const [newArrivals, setNewArrivals] = useState(MOCK_NEW_ARRIVALS);
  const [loading, setLoading] = useState(false);

  // In a real app, you would fetch data from an API
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setCategories(MOCK_CATEGORIES);
      setFeaturedProducts(MOCK_FEATURED_PRODUCTS);
      setNewArrivals(MOCK_NEW_ARRIVALS);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = () => {
    // In a real app, you would search products based on the query
    console.log("Searching for:", searchQuery);
  };

  const handleScanPress = () => {
    // In a real app, this would open the camera for scanning
    console.log("Opening scanner");
    // navigation.navigate('Scanner');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>User</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Feather name="bell" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={20}
            color={colors.onSurfaceVariant}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
          <Feather name="camera" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800&q=80",
          }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Special Offer</Text>
          <Text style={styles.bannerSubtitle}>
            20% OFF on all skincare products
          </Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </View>

      {/* New Arrivals */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 20 }} />
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
  },
  username: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSurfaceVariant,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
  },
  bannerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: "#FFFFFF",
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSurfaceVariant,
  },
  seeAllText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.primary,
  },
  categoriesContainer: {
    paddingLeft: 16,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});

export default HomeScreen;

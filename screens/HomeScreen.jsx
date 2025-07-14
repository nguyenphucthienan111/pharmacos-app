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
  SafeAreaView,
  Platform,
} from "../components/WebCompatUI";
import { Feather } from "@expo/vector-icons";
import { colors, typography } from "../theme/theme";
import ProductCard from "../components/ProductCard";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";

// XÓA HOÀN TOÀN MOCK_CATEGORIES, MOCK_FEATURED_PRODUCTS, VÀ CategoryCard

const HomeScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { user } = useUser();
  const { fetchProducts } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setLoading(false);
    };
    loadData();
  }, [fetchProducts]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearchLoading(true);
        setIsDropdownVisible(true);
        try {
          const filtered = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults([]);
        }
        setIsSearchLoading(false);
      } else {
        setSearchResults([]);
        setIsDropdownVisible(false);
      }
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, products]);

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        navigation.navigate("ProductDetail", { productId: item._id });
        setIsDropdownVisible(false);
        setSearchQuery("");
      }}
    >
      <Image
        source={{ uri: item.images?.find(img => img.isPrimary)?.url || item.images?.[0]?.url || 'https://via.placeholder.com/150' }}
        style={styles.searchResultImage}
      />
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.searchResultPrice}>{item.price.toLocaleString()} VND</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.username}>{user?.profile?.name || 'Guest'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Feather name="bell" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => { if (searchQuery.length > 1) setIsDropdownVisible(true) }}
            />
          </View>
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate("AIImageSearch") }>
            <Feather name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {/* Banner giữ nguyên */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800&q=80" }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Special Offer</Text>
            <Text style={styles.bannerSubtitle}>20% OFF on all skincare products</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Hiển thị tất cả sản phẩm dạng lưới */}
        <View style={styles.productsGrid}>
          {products.length > 0 ? (
            products.map((item) => (
              <ProductCard
                key={item._id}
                product={{
                  id: item._id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.images?.find(img => img.isPrimary)?.url || item.images?.[0]?.url,
                  discountPercentage: item.discount || 0,
                  inStock: item.inStock,
                }}
              />
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>No products found.</Text>
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
      {/* SEARCH RESULTS DROPDOWN */}
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          {isSearchLoading ? (
            <ActivityIndicator style={{ paddingVertical: 20 }} color={colors.primary} />
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                searchQuery.length > 1 ? <Text style={styles.noResultsText}>No products found for "{searchQuery}"</Text> : null
              }
              style={styles.searchResultsList}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

// XÓA style cho CategoryCard, tab selector, và các style không còn dùng nữa
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginRight: 8,
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
    marginLeft: 8,
    marginRight: 8,
    marginTop: Platform.OS === 'web' ? 0 : 4,
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
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#DCE4E9',
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchResultPrice: {
    fontSize: 14,
    color: '#006782',
    marginTop: 4,
  },
  noResultsText: {
    padding: 20,
    textAlign: 'center',
    color: '#888',
  },
});

export default HomeScreen;
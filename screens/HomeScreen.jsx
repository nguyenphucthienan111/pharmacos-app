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
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import { useUser } from "../context/UserContext";
import { useTheme } from "../theme/ThemeProvider";

// Dữ liệu mock được cập nhật để khớp với cấu trúc của phiên bản web
const MOCK_CATEGORIES = [
  {
    id: 1,
    name: "Pharmaceuticals",
    count: 120,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  },
  {
    id: 2,
    name: "Skincare",
    count: 85,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
  },
  {
    id: 3,
    name: "Haircare",
    count: 64,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
  },
  {
    id: 4,
    name: "Vitamins",
    count: 42,
    image: "https://images.unsplash.com/photo-1577196806850-567cb9e43e21?w=800&q=80",
  },
  {
    id: 5,
    name: "Baby Care",
    count: 38,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
  },
  {
    id: 6,
    name: "Natural Products",
    count: 76,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
  }
];

const MOCK_FEATURED_PRODUCTS = [
  { id: "1", name: "Vitamin C Serum", price: 24.99, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80", inStock: true },
  { id: "2", name: "Hydrating Face Cream", price: 32.50, image: "https://images.unsplash.com/photo-1611930022073-84f3e05cd886?w=800&q=80", inStock: true },
  { id: "3", name: "Pain Relief Tablets", price: 12.99, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80", inStock: false },
  { id: "4", name: "Sunscreen SPF 50", price: 18.75, image: "https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=800&q=80", inStock: true },
];


const HomeScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const [activeTab, setActiveTab] = useState("browse");
  const [loading, setLoading] = useState(true); // State loading chung
  const [products, setProducts] = useState([]); // State để lưu sản phẩm từ API
  const { user } = useUser(); // Lấy thông tin người dùng nếu cần
  const { fetchProducts } = useUser(); // Lấy hàm fetchProducts từ context
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

  // --- EFFECT ĐỂ XỬ LÝ TÌM KIẾM VỚI DEBOUNCE ---
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearchLoading(true);
        setIsDropdownVisible(true);
        try {
          // Sử dụng danh sách sản phẩm đã tải để tìm kiếm
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
    }, 300); // Debounce 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, products]);

  // --- RENDER ITEM CHO DROPDOWN KẾT QUẢ TÌM KIẾM ---
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        navigation.navigate("ProductDetail", { productId: item._id });
        setIsDropdownVisible(false); // Ẩn dropdown sau khi chọn
        setSearchQuery(""); // Xóa nội dung tìm kiếm
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

  // Lấy 6 sản phẩm đầu tiên làm "Featured Products"
  const featuredProducts = products.slice(0, 6);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const handleScanPress = () => {
    // Điều hướng đến màn hình tìm kiếm AI mới
    navigation.navigate("AIImageSearch");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* The ScrollView now only contains the main page content */}
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

        {/* The Search Bar remains, but its results dropdown will be rendered outside */}
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
          <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
            <Feather name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
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

        {/* Tab Selector */}
        <View style={styles.tabSelectorContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'browse' && styles.activeTabButton]}
            onPress={() => setActiveTab('browse')}>
            <Text style={[styles.tabButtonText, activeTab === 'browse' && styles.activeTabButtonText]}>Browse Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'featured' && styles.activeTabButton]}
            onPress={() => setActiveTab('featured')}>
            <Text style={[styles.tabButtonText, activeTab === 'featured' && styles.activeTabButtonText]}>Featured Products</Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'browse' ? (
          <View style={styles.productsGrid}>
            {MOCK_CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url,
                  discountPercentage: product.discount || 0,
                }}
              />
            ))}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* --- SEARCH RESULTS DROPDOWN (MOVED HERE) --- */}
      {/* This FlatList is now outside the ScrollView and positioned absolutely */}
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
    marginTop: Platform.OS === 'web' ? 0 : 4, // Adjust for web compatibility
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
  tabSelectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: colors.onSurfaceVariant,
  },
  activeTabButtonText: {
    color: colors.primary,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around", // Canh đều các item
    paddingHorizontal: 8,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10, // Đảm bảo dropdown hiển thị trên các thành phần khác
  },
  searchContainer: {
    flexDirection: "row",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: '#DCE4E9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#40484C',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 120, // Vị trí ngay dưới thanh tìm kiếm
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
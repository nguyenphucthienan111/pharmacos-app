import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "../components/WebCompatUI";
import { Feather } from "@expo/vector-icons";
import { colors, typography } from "../theme/theme";
import ProductCard from "../components/ProductCard";

// Mock data for development
const MOCK_PRODUCTS = {
  1: [
    // Medications
    {
      id: 1,
      name: "Advanced Pain Relief Gel",
      price: 12.99,
      discountPercentage: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
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
      id: 9,
      name: "Cold & Flu Medicine",
      price: 14.5,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    },
    {
      id: 10,
      name: "Digestive Health Capsules",
      price: 19.99,
      discountPercentage: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    },
    {
      id: 11,
      name: "Headache Relief Tablets",
      price: 7.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    },
    {
      id: 12,
      name: "Sleep Aid Supplement",
      price: 15.99,
      discountPercentage: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    },
  ],
  2: [
    // Skincare
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
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
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
      id: 13,
      name: "Anti-Aging Night Cream",
      price: 29.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    },
    {
      id: 14,
      name: "Facial Cleanser",
      price: 12.5,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    },
  ],
  3: [
    // Haircare
    {
      id: 5,
      name: "Organic Shampoo",
      price: 14.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1626015365107-2dd2c4b667dd?w=800&q=80",
    },
    {
      id: 15,
      name: "Conditioner for Damaged Hair",
      price: 16.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1626015365107-2dd2c4b667dd?w=800&q=80",
    },
    {
      id: 16,
      name: "Hair Growth Serum",
      price: 22.5,
      discountPercentage: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1626015365107-2dd2c4b667dd?w=800&q=80",
    },
    {
      id: 17,
      name: "Anti-Frizz Hair Oil",
      price: 18.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1626015365107-2dd2c4b667dd?w=800&q=80",
    },
  ],
  4: [
    // Vitamins
    {
      id: 4,
      name: "Multivitamin Tablets",
      price: 29.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1577196806850-567cb9e43e21?w=800&q=80",
    },
    {
      id: 18,
      name: "Vitamin D3 Supplements",
      price: 15.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1577196806850-567cb9e43e21?w=800&q=80",
    },
    {
      id: 19,
      name: "Omega-3 Fish Oil",
      price: 24.5,
      discountPercentage: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1577196806850-567cb9e43e21?w=800&q=80",
    },
    {
      id: 20,
      name: "Calcium Supplements",
      price: 17.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1577196806850-567cb9e43e21?w=800&q=80",
    },
  ],
  5: [
    // Baby Care
    {
      id: 8,
      name: "Baby Lotion",
      price: 11.5,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
    },
    {
      id: 21,
      name: "Baby Shampoo",
      price: 9.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
    },
    {
      id: 22,
      name: "Diaper Rash Cream",
      price: 8.5,
      discountPercentage: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
    },
    {
      id: 23,
      name: "Baby Powder",
      price: 6.99,
      discountPercentage: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
    },
  ],
};

const CategoryScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("default"); // default, price-asc, price-desc

  // In a real app, you would fetch data from an API
  useEffect(() => {
    // Set the header title
    navigation.setOptions({
      title: categoryName,
    });

    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const categoryProducts = MOCK_PRODUCTS[categoryId] || [];
      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts);
      setLoading(false);
    }, 1000);
  }, [categoryId, categoryName, navigation]);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    // Sort products
    let sorted = [...filteredProducts];
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(sorted);
  }, [sortBy]);

  const handleSearch = () => {
    // Already handled by the useEffect
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
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
    <View style={styles.container}>
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
            placeholder="Search in this category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Filter and Sort */}
      <View style={styles.filterContainer}>
        <Text style={styles.resultCount}>
          {filteredProducts.length} products
        </Text>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "default" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("default")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "default" && styles.activeSortButtonText,
              ]}
            >
              Default
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "price-asc" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("price-asc")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "price-asc" && styles.activeSortButtonText,
              ]}
            >
              Price ↑
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "price-desc" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("price-desc")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "price-desc" && styles.activeSortButtonText,
              ]}
            >
              Price ↓
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productsRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather
            name="search"
            size={48}
            color={colors.onSurfaceVariant}
            style={{ opacity: 0.5 }}
          />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  resultCount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
  },
  sortContainer: {
    flexDirection: "row",
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceVariant,
  },
  activeSortButton: {
    backgroundColor: colors.primaryContainer,
  },
  sortButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    color: colors.onSurfaceVariant,
  },
  activeSortButtonText: {
    color: colors.onPrimaryContainer,
    fontWeight: typography.fontWeight.medium,
  },
  productsContainer: {
    padding: 8,
  },
  productsRow: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.medium,
    color: colors.onSurfaceVariant,
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    marginTop: 8,
  },
});

export default CategoryScreen;

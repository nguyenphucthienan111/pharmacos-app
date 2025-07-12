// components/ProductCard.jsx

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, typography } from "../theme/theme";
import { AntDesign } from '@expo/vector-icons';

const ProductCard = ({ product, onToggleFavorite }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("ProductDetail", { productId: product.id });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      {onToggleFavorite && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra component cha
            onToggleFavorite(product.id);
          }}
        >
          <AntDesign
            name={product.isFavorite ? "heart" : "hearto"}
            size={20}
            color={product.isFavorite ? colors.error : "#FFFFFF"}
          />
        </TouchableOpacity>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.price != null && (
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        )}

        {product.discountPercentage > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.discount}>
              {product.discountPercentage}% OFF
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  image: {
    width: "100%",
    height: 150,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  price: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  discountContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
});

export default ProductCard;
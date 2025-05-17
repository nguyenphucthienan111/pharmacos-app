import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, typography } from "../theme/theme";

const CategoryCard = ({ category }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("Category", {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image
        source={{ uri: category.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>{category.productCount} products</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 12,
  },
  name: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  count: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize.small,
    color: "#FFFFFF",
    opacity: 0.8,
  },
});

export default CategoryCard;

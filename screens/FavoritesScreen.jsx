// screens/FavoritesScreen.jsx

import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform,
} from "../components/WebCompatUI";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { UserContext } from "../context/UserContext";
import ProductCard from "../components/ProductCard";
import { useFocusEffect } from '@react-navigation/native';


const FavoritesScreen = ({ navigation }) => {
    const { colors, typography } = useTheme();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, fetchFavorites, toggleFavorite, removeFavorite } = useContext(UserContext);

    const loadFavorites = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const favoriteProducts = await fetchFavorites();
        setFavorites(favoriteProducts);
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadFavorites();
        }, [user])
    );

    const handleFavoriteToggle = async (productId) => {
        await toggleFavorite(productId);
        // Tải lại danh sách yêu thích sau khi thay đổi
        await loadFavorites();
    };

    const handleRemoveFavorite = async (productId) => {
        await removeFavorite(productId);
        // Tải lại danh sách yêu thích sau khi xóa
        await loadFavorites();
    };

    const styles = createStyles(colors, typography);

    if (loading) {
        return (
            <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>Loading favorites...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Feather name="heart" size={64} color={colors.surfaceVariant} />
                <Text style={[styles.title, { color: colors.onSurfaceVariant }]}>Log in to see your favorites</Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (favorites.length === 0) {
        return (
            <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Feather name="heart" size={64} color={colors.surfaceVariant} />
                <Text style={[styles.title, { color: colors.onSurfaceVariant }]}>No Favorites Yet</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant, opacity: 0.7 }]}>
                    Tap the heart on any product to save it here.
                </Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("Home")}
                >
                    <Text style={styles.buttonText}>Browse Products</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.headerTitle}>My Favorites</Text>
            <FlatList
                data={favorites}
                renderItem={({ item }) => (
                    <ProductCard
                        product={{
                            id: item.product._id,
                            name: item.product.name,
                            price: item.product.price,
                            imageUrl: item.product.images?.find(img => img.isPrimary)?.url || item.product.images?.[0]?.url,
                            discountPercentage: item.product.discount || 0,
                            isFavorite: true
                        }}
                        onToggleFavorite={() => handleRemoveFavorite(item.product._id)}
                    />
                )}
                keyExtractor={(item) => item.product._id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.productsRow}
                contentContainerStyle={styles.productsContainer}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors, typography) => StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    infoText: {
        marginTop: 10,
        fontSize: typography.fontSize.medium,
    },
    title: {
        fontSize: typography.fontSize.large,
        fontWeight: typography.fontWeight.bold,
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: typography.fontSize.medium,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: typography.fontSize.medium,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    headerTitle: {
        fontSize: typography.fontSize.xlarge,
        fontWeight: typography.fontWeight.bold,
        color: colors.onSurfaceVariant,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    productsContainer: {
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    productsRow: {
        justifyContent: "space-between",
    },
});

export default FavoritesScreen;
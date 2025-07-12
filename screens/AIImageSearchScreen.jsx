import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator,
    Alert, FlatList, SafeAreaView, ScrollView, Platform
} from '../components/WebCompatUI';
import { useTheme } from '../theme/ThemeProvider';
import { Feather, Upload } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ApiEndpoints } from '../config/apiConfig';
import ProductCard from '../components/ProductCard';

const AIImageSearchScreen = ({ navigation }) => {
    const { colors, typography } = useTheme();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState([]);
    const [geminiAnalysis, setGeminiAnalysis] = useState(null);
    const [error, setError] = useState(null);

    const pickImage = async (useCamera = false) => {
        let result;
        if (useCamera) {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraPermission.status !== 'granted') {
                Alert.alert("Permission required", "You need to grant camera access to use this feature.");
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
        } else {
            const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (libraryPermission.status !== 'granted') {
                Alert.alert("Permission required", "You need to grant photo library access to use this feature.");
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
        }

        if (!result.canceled) {
            const selectedAsset = result.assets[0];
            setFile(selectedAsset);
            setPreview(selectedAsset.uri);
            // Reset previous results
            setResults([]);
            setError(null);
            setGeminiAnalysis(null);
        }
    };

    const processImage = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        const uriParts = file.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        const formData = new FormData();
        formData.append('image', {
            uri: file.uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        });

        try {
            const response = await fetch(ApiEndpoints.AI.SEARCH_BY_IMAGE, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to search by image');

            setGeminiAnalysis(data.geminiAnalysis || null);
            if (data.success) {
                setResults(data.matchedProducts || []);
            } else {
                setError(data.message || "No matching products found.");
                setResults([]);
            }
        } catch (err) {
            setError(err.message || 'An error occurred during search.');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetSearch = () => {
        setFile(null);
        setPreview(null);
        setResults([]);
        setError(null);
        setGeminiAnalysis(null);
    };

    const renderItem = ({ item }) => (
        <View style={styles.productCardContainer}>
            <ProductCard product={{
                id: item._id,
                name: item.name,
                price: item.price,
                imageUrl: item.images?.find(img => img.isPrimary)?.url || item.images?.[0]?.url,
                discountPercentage: item.discount || 0
            }} />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={[styles.title, { color: colors.primary }]}>AI Product Recognition</Text>
                <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
                    Upload or take a photo of a product to find it in our store.
                </Text>

                {!preview ? (
                    <View style={[styles.uploadBox, { borderColor: colors.surfaceVariant }]}>
                        <Feather name="upload-cloud" size={48} color={colors.surfaceVariant} />
                        <Text style={[styles.uploadText, { color: colors.onSurfaceVariant }]}>
                            Tap below to select an image
                        </Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => pickImage(false)}>
                                <Feather name="image" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Browse Files</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: colors.secondary }]} onPress={() => pickImage(true)}>
                                <Feather name="camera" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Take Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: preview }} style={styles.previewImage} />
                        {isProcessing ? (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>Analyzing...</Text>
                            </View>
                        ) : (
                            <>
                                {results.length === 0 && !error && (
                                    <TouchableOpacity style={[styles.button, styles.fullWidthButton, { backgroundColor: colors.primary }]} onPress={processImage}>
                                        <Text style={styles.buttonText}>Start Recognition</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                )}

                {geminiAnalysis && (
                    <View style={[styles.analysisBox, { backgroundColor: colors.primaryContainer }]}>
                        <Text style={[styles.analysisTitle, { color: colors.onPrimaryContainer }]}>AI Analysis:</Text>
                        <Text style={[styles.analysisText, { color: colors.onPrimaryContainer }]}>{geminiAnalysis}</Text>
                    </View>
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}

                {results.length > 0 && (
                    <>
                        <Text style={[styles.resultsTitle, { color: colors.onSurfaceVariant }]}>Matching Products</Text>
                        <FlatList
                            data={results}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            numColumns={2}
                            columnWrapperStyle={styles.row}
                        />
                    </>
                )}
            </ScrollView>

            {(preview || results.length > 0) && !isProcessing && (
                <TouchableOpacity style={[styles.resetButton, { backgroundColor: colors.error }]} onPress={resetSearch}>
                    <Text style={styles.buttonText}>Try Another Image</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

// Styles for AIImageSearchScreen
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { padding: 24, paddingBottom: 100 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
    description: { fontSize: 16, textAlign: 'center', marginVertical: 16, opacity: 0.7 },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 250,
    },
    uploadText: { marginTop: 16, fontSize: 16 },
    buttonRow: { flexDirection: 'row', marginTop: 24, gap: 16 },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    previewContainer: { alignItems: 'center', marginVertical: 20 },
    previewImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20, resizeMode: 'contain' },
    fullWidthButton: { justifyContent: 'center' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 12,
    },
    loadingText: { marginTop: 10, fontSize: 16 },
    analysisBox: { borderRadius: 8, padding: 16, marginVertical: 20 },
    analysisTitle: { fontWeight: 'bold', marginBottom: 4 },
    analysisText: {},
    errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
    resultsTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    row: { justifyContent: 'space-between' },
    productCardContainer: { width: '48%', marginBottom: 16 },
    resetButton: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Platform.OS === 'ios' ? 24 : 16,
    },
});

export default AIImageSearchScreen;
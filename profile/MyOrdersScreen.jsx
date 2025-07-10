import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView
} from '../components/WebCompatUI';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeProvider';
import { Feather } from '@expo/vector-icons';

const ORDER_STATUS_MAP = {
    pending: { label: "Pending", color: "#faad14" },
    processing: { label: "Processing", color: "#1890ff" },
    completed: { label: "Completed", color: "#52c41a" },
    cancelled: { label: "Cancelled", color: "#f5222d" },
};

const ORDER_TABS = ["all", "pending", "processing", "completed", "cancelled"];

const MyOrdersScreen = () => {
    const { colors, typography } = useTheme();
    const { fetchMyOrders, cancelOrder, loading: contextLoading } = useUser();

    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);

    // --- SỬA LỖI: Cập nhật cách sử dụng useFocusEffect ---
    useFocusEffect(
        React.useCallback(() => {
            const loadOrders = async () => {
                setLoading(true);
                const fetchedOrders = await fetchMyOrders();
                setOrders(fetchedOrders || []);
                setLoading(false);
            };

            loadOrders();
        }, [fetchMyOrders]) // fetchMyOrders là một dependency ổn định từ context
    );
    // --- KẾT THÚC SỬA LỖI ---

    const handleCancelOrder = (orderId) => {
        Alert.alert(
            "Confirm Cancellation",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        const result = await cancelOrder(orderId, "Customer request");
                        if (result.success) {
                            Alert.alert("Success", result.message);
                            // Tải lại danh sách đơn hàng sau khi hủy thành công
                            setLoading(true);
                            const updatedOrders = await fetchMyOrders();
                            setOrders(updatedOrders || []);
                            setLoading(false);
                        } else {
                            Alert.alert("Error", result.message || "Could not cancel the order.");
                        }
                    },
                },
            ]
        );
    };

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => o.status && o.status.toLowerCase() === activeTab);

    const renderOrderItem = ({ item }) => {
        const statusInfo = ORDER_STATUS_MAP[item.status?.toLowerCase()] || ORDER_STATUS_MAP.pending;
        const total = item.items?.reduce((sum, product) => sum + (product.unitPrice || 0) * (product.quantity || 0), 0) || 0;

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.id || item._id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                        <Text style={styles.statusText}>{statusInfo.label}</Text>
                    </View>
                </View>
                {item.items?.map((prod, index) => (
                    <View key={index} style={styles.productItem}>
                        <Text style={styles.productName} numberOfLines={1}>{prod.productId?.name || 'Product not available'}</Text>
                        <Text style={styles.productDetails}>{prod.quantity} x {prod.unitPrice.toLocaleString()} VND</Text>
                    </View>
                ))}
                <View style={styles.orderFooter}>
                    <Text style={styles.totalText}>Total: {total.toLocaleString()} VND</Text>
                    {item.status?.toLowerCase() === 'pending' && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancelOrder(item.id || item._id)}
                            disabled={contextLoading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
                    {ORDER_TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id || item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No orders in this category.</Text></View>}
                />
            )}
        </View>
    );
};

// Styles không thay đổi
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    tabContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#e6f7ff',
        borderBottomWidth: 2,
        borderBottomColor: '#006782',
    },
    tabText: { color: '#555', fontWeight: '500' },
    activeTabText: { color: '#006782', fontWeight: 'bold' },
    orderCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
        marginBottom: 10
    },
    orderId: { fontSize: 16, fontWeight: 'bold' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6
    },
    productName: { flex: 1, color: '#444', marginRight: 10 },
    productDetails: { color: '#666' },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10
    },
    totalText: { fontWeight: 'bold', fontSize: 16 },
    cancelButton: {
        backgroundColor: '#ff4d4f',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5
    },
    cancelButtonText: { color: '#fff', fontWeight: 'bold' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#888'
    },
});

export default MyOrdersScreen;
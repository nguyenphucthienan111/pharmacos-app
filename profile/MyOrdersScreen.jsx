import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, ScrollView, SafeAreaView, Platform, Modal, TextInput
} from '../components/WebCompatUI';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ApiEndpoints } from '../config/apiConfig';

const ORDER_STATUS_MAP = {
    pending: { label: "Pending", color: "#faad14" },
    processing: { label: "Processing", color: "#1890ff" },
    completed: { label: "Completed", color: "#52c41a" },
    cancelled: { label: "Cancelled", color: "#f5222d" },
};

const ORDER_TABS = ["all", "pending", "processing", "completed", "cancelled"];

const CANCEL_REASONS = [
    'I want to change the delivery address',
    'I want to change the product in the order',
    'I found a better price elsewhere',
    'I do not want to buy it anymore',
    'Ordered the wrong product',
    'Delivery time is too long',
    'Other reason',
];

const MyOrdersScreen = () => {
    const { colors, typography } = useTheme();
    const { fetchMyOrders, cancelOrder, loading: contextLoading } = useUser();
    const navigation = useNavigation();

    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    // --- SỬA LỖI: Cập nhật cách sử dụng useFocusEffect ---
    useFocusEffect(
        React.useCallback(() => {
            const loadOrders = async () => {
                setLoading(true);
                const fetchedOrders = await fetchMyOrders();
                // Fetch product details for each item if needed
                const updatedOrders = await Promise.all((fetchedOrders || []).map(async (order) => {
                    if (!order.items) return order;
                    const updatedItems = await Promise.all(order.items.map(async (prod) => {
                        if (typeof prod.productId === 'string') {
                            try {
                                const res = await fetch(ApiEndpoints.PRODUCTS.GET_BY_ID(prod.productId));
                                const prodData = await res.json();
                                return { ...prod, productId: prodData.product || prodData };
                            } catch {
                                return prod;
                            }
                        }
                        return prod;
                    }));
                    return { ...order, items: updatedItems };
                }));
                setOrders(updatedOrders);
                setLoading(false);
            };

            loadOrders();
        }, [fetchMyOrders])
    );
    // --- KẾT THÚC SỬA LỖI ---

    const handleCancelOrder = (orderId) => {
        setCancelOrderId(orderId);
        setCancelReason('');
        setCustomReason('');
        setCancelModalVisible(true);
    };
    const confirmCancelOrder = async () => {
        let reasonToSend = cancelReason === 'Lý do khác' ? customReason : cancelReason;
        if (!reasonToSend.trim()) {
            Alert.alert('Vui lòng chọn hoặc nhập lý do hủy đơn hàng!');
            return;
        }
        setCancelModalVisible(false);
        const result = await cancelOrder(cancelOrderId, reasonToSend);
        if (result.success) {
            Alert.alert('Success', result.message);
            setLoading(true);
            const updatedOrders = await fetchMyOrders();
            setOrders(updatedOrders || []);
            setLoading(false);
        } else {
            Alert.alert('Error', result.message || 'Could not cancel the order.');
        }
    };

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => o.status && o.status.toLowerCase() === activeTab);

    const renderOrderItem = ({ item }) => {
        const statusInfo = ORDER_STATUS_MAP[item.status?.toLowerCase()] || ORDER_STATUS_MAP.pending;
        const total = item.items?.reduce((sum, product) => sum + (product.unitPrice || 0) * (product.quantity || 0), 0) || 0;

        return (
            <TouchableOpacity onPress={() => navigation.navigate('OrderDetailScreen', { orderId: item.id || item._id })}>
                <View style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="tail">Order #{item.id || item._id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                            <Text style={styles.statusText}>{statusInfo.label}</Text>
                        </View>
                    </View>
                    {item.items?.map((prod, index) => (
                        <View key={index} style={styles.productItem}>
                            <Text style={styles.productName} numberOfLines={1}>
                                {prod.productId && typeof prod.productId === 'object' && prod.productId.name
                                    ? prod.productId.name
                                    : 'Product has been deleted'}
                            </Text>
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
            </TouchableOpacity>
        );
    };

    // Define styles inside the component
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
            paddingTop: Platform.OS === 'android' ? 0 : 0, // Adjust if needed
        },
        tabContainer: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            paddingTop: Platform.OS === 'ios' ? 10 : 0, // Extra padding for iOS
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
            marginBottom: 10,
            gap: 8,
        },
        orderId: {
            maxWidth: '65%',
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
        },
        statusBadge: {
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 20,
            alignSelf: 'flex-start',
            minWidth: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        statusText: {
            color: '#fff',
            fontWeight: '600',
            fontSize: 13,
        },
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

    return (
        <SafeAreaView style={styles.container}>
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
            <Modal
                visible={cancelModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Lý do hủy đơn hàng</Text>
                        {CANCEL_REASONS.map(reason => (
                            <TouchableOpacity
                                key={reason}
                                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
                                onPress={() => setCancelReason(reason)}
                            >
                                <View style={{
                                    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#1976d2', marginRight: 10,
                                    alignItems: 'center', justifyContent: 'center', backgroundColor: cancelReason === reason ? '#1976d2' : '#fff'
                                }}>
                                    {cancelReason === reason && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />}
                                </View>
                                <Text style={{ color: '#333', fontSize: 15 }}>{reason}</Text>
                            </TouchableOpacity>
                        ))}
                        {cancelReason === 'Lý do khác' && (
                            <TextInput
                                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 10, fontSize: 15 }}
                                placeholder="Nhập lý do cụ thể..."
                                value={customReason}
                                onChangeText={setCustomReason}
                                multiline
                            />
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                            <TouchableOpacity onPress={() => setCancelModalVisible(false)} style={{ marginRight: 16 }}>
                                <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Đóng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmCancelOrder}
                                style={{ backgroundColor: '#ff4d4f', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Xác nhận hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default MyOrdersScreen;
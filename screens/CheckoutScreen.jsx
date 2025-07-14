import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, SafeAreaView, Platform
} from '../components/WebCompatUI';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { ApiEndpoints } from '../config/apiConfig';

const CheckoutScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { cartItems, user, addresses, fetchAddresses, clearCart, token } = useUser();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(true);

    useEffect(() => {
        const loadAddresses = async () => {
            setAddressLoading(true);
            await fetchAddresses();
            setAddressLoading(false);
        };
        loadAddresses();
    }, []); // chỉ chạy 1 lần khi mount

    useEffect(() => {
        if (addresses && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
        }
    }, [addresses]);

    const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = 5000;
    const total = subTotal + shippingFee;

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Please select a delivery address!');
            return;
        }
        if (cartItems.length === 0) {
            Alert.alert('Your cart is empty!');
            return;
        }
        setLoading(true);
        // Log dữ liệu gửi lên
        console.log('Order payload:', {
            items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.price,
            })),
            shippingAddress: selectedAddress.address + ', ' + selectedAddress.ward + ', ' + selectedAddress.district + ', ' + selectedAddress.city,
            recipientName: selectedAddress.name,
            phone: selectedAddress.phone,
            paymentMethod,
            note,
        });
        try {
            const res = await fetch(ApiEndpoints.ORDERS.PLACE_ORDER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.price,
                    })),
                    shippingAddress: selectedAddress.address + ', ' + selectedAddress.ward + ', ' + selectedAddress.district + ', ' + selectedAddress.city,
                    recipientName: selectedAddress.name,
                    phone: selectedAddress.phone,
                    paymentMethod,
                    note,
                })
            });
            const data = await res.json();
            console.log('Order API status:', res.status, 'response:', data);
            if (res.status === 201 || res.ok) {
                if (typeof clearCart === 'function') clearCart();
                console.log('Order success, navigating to Home');
                Alert.alert('Order placed successfully!', '', [
                    {
                        text: 'OK', onPress: () => {
                            console.log('Go Home');
                            navigation.navigate('Main');
                        }
                    }
                ]);
            } else {
                console.log('Order failed branch');
                Alert.alert('Order failed', data.message || 'Please try again.');
            }
        } catch (e) {
            console.log('Order failed in catch:', e);
            Alert.alert('Order failed', 'Please try again.');
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                {addressLoading ? (
                    <ActivityIndicator color={colors.primary} />
                ) : addresses && addresses.length > 0 ? (
                    addresses.map(addr => (
                        <TouchableOpacity
                            key={addr._id}
                            style={[styles.addressCard, selectedAddress?._id === addr._id && styles.addressCardActive]}
                            onPress={() => setSelectedAddress(addr)}
                        >
                            <Text style={styles.addressName}>{addr.name} ({addr.phone})</Text>
                            <Text style={styles.addressText}>{addr.address}, {addr.ward}, {addr.district}, {addr.city}</Text>
                            {addr.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={{ color: '#888', marginBottom: 12 }}>No address found. Please add one in Address Book.</Text>
                )}

                <Text style={styles.sectionTitle}>Order Items</Text>
                {cartItems.map(item => (
                    <View key={item.productId || item.id} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>{item.price.toLocaleString()} VND</Text>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentRow}>
                    <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('cod')}>
                        <Feather name="truck" size={18} color={paymentMethod === 'cod' ? '#1976d2' : '#888'} />
                        <Text style={[styles.paymentText, paymentMethod === 'cod' && { color: '#1976d2' }]}>Cash on Delivery (COD)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'bank' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('bank')}>
                        <Feather name="credit-card" size={18} color={paymentMethod === 'bank' ? '#1976d2' : '#888'} />
                        <Text style={[styles.paymentText, paymentMethod === 'bank' && { color: '#1976d2' }]}>Bank Transfer</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Note</Text>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Any note for your order? (optional)"
                    value={note}
                    onChangeText={setNote}
                    multiline
                />

                <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}><Text>Subtotal</Text><Text>{subTotal.toLocaleString()} VND</Text></View>
                    <View style={styles.summaryRow}><Text>Shipping</Text><Text>{shippingFee.toLocaleString()} VND</Text></View>
                    <View style={styles.summaryRowTotal}><Text style={{ fontWeight: 'bold' }}>Total</Text><Text style={{ color: '#1976d2', fontWeight: 'bold' }}>{total.toLocaleString()} VND</Text></View>
                </View>

                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && { opacity: 0.7 }]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeOrderText}>Place Order</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    sectionTitle: { fontWeight: 'bold', fontSize: 17, marginTop: 18, marginBottom: 10, color: '#1976d2' },
    addressCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    addressCardActive: { borderColor: '#1976d2', backgroundColor: '#e6f7ff' },
    addressName: { fontWeight: 'bold', fontSize: 15, color: '#1976d2' },
    addressText: { color: '#333', fontSize: 14, marginBottom: 2 },
    defaultBadge: { color: '#fff', backgroundColor: '#1976d2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, alignSelf: 'flex-start', marginTop: 6 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
    itemName: { flex: 1, fontWeight: '500', color: '#333' },
    itemQty: { marginHorizontal: 10, color: '#888' },
    itemPrice: { fontWeight: 'bold', color: '#1976d2' },
    paymentRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f6fb', borderRadius: 8, padding: 12, flex: 1, borderWidth: 1, borderColor: '#eee' },
    paymentOptionActive: { borderColor: '#1976d2', backgroundColor: '#e6f7ff' },
    paymentText: { marginLeft: 8, fontWeight: '500', color: '#333' },
    noteInput: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', padding: 12, fontSize: 15, minHeight: 50, marginBottom: 10 },
    summaryBox: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginTop: 18, marginBottom: 18, borderWidth: 1, borderColor: '#eee' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    summaryRowTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#e3e3e3', paddingTop: 10 },
    placeOrderButton: { backgroundColor: '#1976d2', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 10, marginBottom: 30 },
    placeOrderText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default CheckoutScreen; 
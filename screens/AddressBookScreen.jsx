import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, Alert, Switch
} from '../components/WebCompatUI';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeProvider';
import { Feather } from '@expo/vector-icons';

// Component Form cho việc thêm/sửa địa chỉ
const AddressForm = ({ visible, onCancel, onSave, address, isLoading }) => {
    const { colors } = useTheme();
    // Khởi tạo formData với giá trị mặc định cho addressType
    const [formData, setFormData] = useState(address || { addressType: 'Nhà riêng', isDefault: false });

    useEffect(() => {
        // Đảm bảo addressType luôn có giá trị khi mở form
        setFormData(address || { addressType: 'Nhà riêng', isDefault: false });
    }, [address]);

    const handleSave = () => {
        if (!formData.name || !formData.phone || !formData.address) {
            Alert.alert("Error", "Please fill in Name, Phone, and Address.");
            return;
        }
        onSave(formData);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{address ? 'Edit Address' : 'Add New Address'}</Text>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <TextInput style={styles.input} placeholder="Full Name" value={formData.name || ''} onChangeText={text => setFormData(p => ({ ...p, name: text }))} />
                        <TextInput style={styles.input} placeholder="Phone Number" value={formData.phone || ''} onChangeText={text => setFormData(p => ({ ...p, phone: text }))} keyboardType="phone-pad" />
                        <TextInput style={styles.input} placeholder="City/Province" value={formData.city || ''} onChangeText={text => setFormData(p => ({ ...p, city: text }))} />
                        <TextInput style={styles.input} placeholder="District" value={formData.district || ''} onChangeText={text => setFormData(p => ({ ...p, district: text }))} />
                        <TextInput style={styles.input} placeholder="Ward" value={formData.ward || ''} onChangeText={text => setFormData(p => ({ ...p, ward: text }))} />
                        <TextInput style={styles.input} placeholder="Detailed Address" value={formData.address || ''} onChangeText={text => setFormData(p => ({ ...p, address: text }))} />

                        {/* --- KHỐI ĐÃ THAY ĐỔI: LỰA CHỌN LOẠI ĐỊA CHỈ --- */}
                        <Text style={styles.label}>Address Type</Text>
                        <View style={styles.addressTypeContainer}>
                            <TouchableOpacity
                                style={[styles.addressTypeButton, formData.addressType === 'Nhà riêng' && styles.addressTypeButtonActive]}
                                onPress={() => setFormData(p => ({ ...p, addressType: 'Nhà riêng' }))}
                            >
                                <Text style={[styles.addressTypeButtonText, formData.addressType === 'Nhà riêng' && styles.addressTypeButtonTextActive]}>
                                    Nhà riêng
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.addressTypeButton, formData.addressType === 'Văn phòng' && styles.addressTypeButtonActive]}
                                onPress={() => setFormData(p => ({ ...p, addressType: 'Văn phòng' }))}
                            >
                                <Text style={[styles.addressTypeButtonText, formData.addressType === 'Văn phòng' && styles.addressTypeButtonTextActive]}>
                                    Văn phòng
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {/* --- KẾT THÚC THAY ĐỔI --- */}

                        <View style={styles.switchContainer}>
                            <Text>Set as default</Text>
                            <Switch value={formData.isDefault} onValueChange={val => setFormData(p => ({ ...p, isDefault: val }))} />
                        </View>
                    </ScrollView>
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const AddressBookScreen = () => {
    const { colors } = useTheme();
    const { fetchAddresses, addAddress, updateAddress, deleteAddress } = useUser();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchAddresses();
        setAddresses(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveAddress = async (data) => {
        setLoading(true);
        let result;
        if (editingAddress) {
            result = await updateAddress(editingAddress._id, data);
        } else {
            result = await addAddress(data);
        }

        if (result.success) {
            Alert.alert("Success", `Address ${editingAddress ? 'updated' : 'added'} successfully.`);
            setFormVisible(false);
            setEditingAddress(null);
            loadData();
        } else {
            Alert.alert("Error", result.message);
        }
        setLoading(false);
    };

    const handleDeleteAddress = (id) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this address?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    const result = await deleteAddress(id);
                    if (result.success) {
                        Alert.alert("Success", "Address deleted.");
                        loadData();
                    } else {
                        Alert.alert("Error", result.message);
                    }
                }
            }
        ]);
    };

    const renderAddress = ({ item }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <Text style={styles.addressName}>{item.name}</Text>
                {item.isDefault && <View style={[styles.defaultBadge, { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}><Text style={[styles.defaultBadgeText, { color: colors.primary }]}>Default</Text></View>}
            </View>
            <Text style={styles.addressText}>{item.phone}</Text>
            <Text style={styles.addressText}>{`${item.address}, ${item.ward}, ${item.district}, ${item.city}`}</Text>
            {item.addressType && (
                <View style={[styles.typeBadge, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={[styles.typeBadgeText, { color: colors.onSurfaceVariant }]}>{item.addressType}</Text>
                </View>
            )}
            <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => { setEditingAddress(item); setFormVisible(true); }}>
                    <Feather name="edit-2" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteAddress(item._id)}>
                    <Feather name="trash-2" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => { setEditingAddress(null); setFormVisible(true); }}>
                <Feather name="plus" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add New Address</Text>
            </TouchableOpacity>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderAddress}
                    keyExtractor={item => item._id}
                    ListEmptyComponent={<Text style={styles.emptyText}>You have no saved addresses.</Text>}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
            <AddressForm
                visible={formVisible}
                onCancel={() => { setFormVisible(false); setEditingAddress(null); }}
                onSave={handleSaveAddress}
                address={editingAddress}
                isLoading={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    addButton: { flexDirection: 'row', padding: 15, margin: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 3 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    addressCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    addressName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    addressText: { fontSize: 14, color: '#555', marginBottom: 4, lineHeight: 20 },
    addressActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
    defaultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
    defaultBadgeText: { fontSize: 12, fontWeight: '500' },
    typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 8 },
    typeBadgeText: { fontSize: 12, fontWeight: '500' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '85%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10, paddingVertical: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
    cancelButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
    saveButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: '#006782' },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    label: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '500' },
    addressTypeContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    addressTypeButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    addressTypeButtonActive: { borderColor: '#006782', backgroundColor: '#e6f7ff' },
    addressTypeButtonText: { color: '#333' },
    addressTypeButtonTextActive: { color: '#006782', fontWeight: 'bold' },
});

export default AddressBookScreen;
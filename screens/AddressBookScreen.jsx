import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput,
    ScrollView, ActivityIndicator, Alert, Switch, SafeAreaView, Platform
} from '../components/WebCompatUI';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeProvider';
import { Feather } from '@expo/vector-icons';

// SelectModal component for custom dropdown
const SelectModal = ({ visible, options, value, onSelect, onClose, label }) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={{
            flex: 1, justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
            <View style={{
                backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '85%', maxHeight: '70%'
            }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>{label}</Text>
                <FlatList
                    data={options}
                    keyExtractor={item => item.code?.toString() || item.name}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{
                                paddingVertical: 12, borderBottomWidth: 1,
                                borderBottomColor: '#eee'
                            }}
                            onPress={() => { onSelect(item.name); onClose(); }}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: value === item.name ? '#006782' : '#333',
                                fontWeight: value === item.name ? 'bold' : 'normal'
                            }}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity style={{ marginTop: 10, alignSelf: 'flex-end' }} onPress={onClose}>
                    <Text style={{ color: '#006782', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// Component Form cho việc thêm/sửa địa chỉ
const AddressForm = ({ visible, onCancel, onSave, address, isLoading }) => {
    const { colors } = useTheme();
    const { user } = useUser();

    // Default values from profile if not editing
    const initialFormData = address
        ? {
            ...address,
            addressType:
                address.addressType === "Nhà riêng"
                    ? "Home"
                    : address.addressType === "Văn phòng"
                        ? "Office"
                        : address.addressType || "Home",
        }
        : {
            name: user?.profile?.name || "",
            phone: user?.profile?.phone || "",
            addressType: "Home",
            isDefault: false,
            city: "",
            district: "",
            ward: "",
            address: "",
        };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        // Reset form data when opening modal (for add or edit)
        if (visible) {
            setFormData(
                address
                    ? {
                        ...address,
                        addressType:
                            address.addressType === "Nhà riêng"
                                ? "Home"
                                : address.addressType === "Văn phòng"
                                    ? "Office"
                                    : address.addressType || "Home",
                    }
                    : {
                        name: user?.profile?.name || "",
                        phone: user?.profile?.phone || "",
                        addressType: "Home",
                        isDefault: false,
                        city: "",
                        district: "",
                        ward: "",
                        address: "",
                    }
            );
        }
    }, [visible, address, user]);

    // Always show user's profile name/phone in the input when adding new address
    useEffect(() => {
        if (visible && !address && user?.profile) {
            setFormData(p => ({
                ...p,
                name: user.profile.name || "",
                phone: user.profile.phone || "",
            }));
        }
    }, [visible, address, user]);

    // State for provinces/districts/wards
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Modal visibility state
    const [cityModal, setCityModal] = useState(false);
    const [districtModal, setDistrictModal] = useState(false);
    const [wardModal, setWardModal] = useState(false);

    useEffect(() => {
        // Fetch provinces/cities data once
        fetch("https://provinces.open-api.vn/api/?depth=3")
            .then((res) => res.json())
            .then((data) => {
                setProvinces(data);
                // If editing, set districts/wards accordingly
                if (address && address.city) {
                    const selectedProvince = data.find(p => p.name === address.city);
                    setDistricts(selectedProvince ? selectedProvince.districts : []);
                    if (address.district) {
                        const selectedDistrict = selectedProvince?.districts?.find(d => d.name === address.district);
                        setWards(selectedDistrict ? selectedDistrict.wards : []);
                    }
                }
            })
            .catch((error) => {
                console.error("Failed to fetch provinces:", error);
                // Optionally show error message
            });
    }, [address]);

    // Update districts when city changes
    useEffect(() => {
        if (formData.city) {
            const selectedProvince = provinces.find(p => p.name === formData.city);
            setDistricts(selectedProvince ? selectedProvince.districts : []);
            setFormData(p => ({ ...p, district: '', ward: '' }));
            setWards([]);
        }
    }, [formData.city]);

    // Update wards when district changes
    useEffect(() => {
        if (formData.district) {
            const selectedDistrict = districts.find(d => d.name === formData.district);
            setWards(selectedDistrict ? selectedDistrict.wards : []);
            setFormData(p => ({ ...p, ward: '' }));
        }
    }, [formData.district]);

    const handleSave = () => {
        if (!formData.address || !formData.city || !formData.district || !formData.ward) {
            Alert.alert("Error", "Please fill in all required address fields.");
            return;
        }
        // If name/phone is empty, fallback to profile
        const dataToSave = {
            ...formData,
            name: formData.name || user?.profile?.name || "",
            phone: formData.phone || user?.profile?.phone || "",
        };
        onSave(dataToSave);
        // Clear address info after save (keep name/phone from profile)
        setFormData({
            name: user?.profile?.name || "",
            phone: user?.profile?.phone || "",
            addressType: "Home",
            isDefault: false,
            city: "",
            district: "",
            ward: "",
            address: "",
        });
    };

    // Change addressTypeOptions to English labels
    const addressTypeOptions = [
        { label: "Home", value: "Home" },
        { label: "Office", value: "Office" },
    ];

    // Show name/phone as placeholder if empty, and allow user to clear/edit
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{address ? 'Edit Address' : 'Add New Address'}</Text>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={formData.name}
                            onChangeText={text => setFormData(p => ({ ...p, name: text }))}
                            autoCapitalize="words"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChangeText={text => setFormData(p => ({ ...p, phone: text }))}
                            keyboardType="phone-pad"
                        />

                        {/* City/Province Select */}
                        <Text style={styles.label}>City/Province</Text>
                        <TouchableOpacity
                            style={[styles.input, { justifyContent: 'center' }]}
                            onPress={() => setCityModal(true)}
                        >
                            <Text style={{ color: formData.city ? '#333' : '#888', fontSize: 16 }}>
                                {formData.city || 'Select City/Province'}
                            </Text>
                        </TouchableOpacity>
                        <SelectModal
                            visible={cityModal}
                            options={provinces}
                            value={formData.city}
                            onSelect={val => setFormData(p => ({ ...p, city: val }))}
                            onClose={() => setCityModal(false)}
                            label="Select City/Province"
                        />

                        {/* District Select */}
                        <Text style={styles.label}>District</Text>
                        <TouchableOpacity
                            style={[styles.input, { justifyContent: 'center' }]}
                            onPress={() => districts.length > 0 && setDistrictModal(true)}
                            disabled={districts.length === 0}
                        >
                            <Text style={{ color: formData.district ? '#333' : '#888', fontSize: 16 }}>
                                {formData.district || 'Select District'}
                            </Text>
                        </TouchableOpacity>
                        <SelectModal
                            visible={districtModal}
                            options={districts}
                            value={formData.district}
                            onSelect={val => setFormData(p => ({ ...p, district: val }))}
                            onClose={() => setDistrictModal(false)}
                            label="Select District"
                        />

                        {/* Ward Select */}
                        <Text style={styles.label}>Ward</Text>
                        <TouchableOpacity
                            style={[styles.input, { justifyContent: 'center' }]}
                            onPress={() => wards.length > 0 && setWardModal(true)}
                            disabled={wards.length === 0}
                        >
                            <Text style={{ color: formData.ward ? '#333' : '#888', fontSize: 16 }}>
                                {formData.ward || 'Select Ward'}
                            </Text>
                        </TouchableOpacity>
                        <SelectModal
                            visible={wardModal}
                            options={wards}
                            value={formData.ward}
                            onSelect={val => setFormData(p => ({ ...p, ward: val }))}
                            onClose={() => setWardModal(false)}
                            label="Select Ward"
                        />

                        <TextInput style={styles.input} placeholder="Detailed Address" value={formData.address || ''} onChangeText={text => setFormData(p => ({ ...p, address: text }))} />

                        {/* --- KHỐI ĐÃ THAY ĐỔI: LỰA CHỌN LOẠI ĐỊA CHỈ --- */}
                        <Text style={styles.label}>Address Type</Text>
                        <View style={styles.addressTypeContainer}>
                            {addressTypeOptions.map(opt => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.addressTypeButton,
                                        formData.addressType === opt.value && styles.addressTypeButtonActive,
                                    ]}
                                    onPress={() => setFormData(p => ({ ...p, addressType: opt.value }))}
                                >
                                    <Text
                                        style={[
                                            styles.addressTypeButtonText,
                                            formData.addressType === opt.value && styles.addressTypeButtonTextActive,
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
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
    const { fetchAddresses, addAddress, updateAddress, deleteAddress, userProfile } = useUser();
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
            // No need to clear here, AddressForm handles reset after save
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
                    <Text style={[styles.typeBadgeText, { color: colors.onSurfaceVariant }]}>
                        {item.addressType}
                    </Text>
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
        <SafeAreaView style={styles.container}>
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
                    refreshing={loading}
                    onRefresh={loadData}
                />
            )}
            <AddressForm
                visible={formVisible}
                onCancel={() => { setFormVisible(false); setEditingAddress(null); }}
                onSave={handleSaveAddress}
                address={editingAddress}
                isLoading={loading}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: Platform.OS === 'android' ? 8 : 0, // Add padding for Android
    },
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
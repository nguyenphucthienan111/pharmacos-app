import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from '../components/WebCompatUI';
import { useTheme } from '../theme/ThemeProvider';
import { ApiEndpoints } from '../config/apiConfig';

const VerifyEmailScreen = ({ navigation }) => {
    const { colors, typography } = useTheme();
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        if (!token.trim()) {
            setMessage('Please enter a token.');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(ApiEndpoints.AUTH.VERIFY_EMAIL(token));
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid token. Please try again.');
            }

            Alert.alert('Success', 'Email verified successfully! You can now log in.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: colors.background,
        },
        title: {
            fontSize: typography.fontSize.xlarge,
            fontWeight: typography.fontWeight.bold,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            marginBottom: 16,
        },
        subtitle: {
            fontSize: typography.fontSize.medium,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            marginBottom: 32,
            opacity: 0.8,
        },
        input: {
            height: 50,
            borderColor: colors.surfaceVariant,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 16,
            fontSize: typography.fontSize.medium,
            marginBottom: 20,
            backgroundColor: colors.surface,
        },
        button: {
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: typography.fontSize.medium,
            fontWeight: typography.fontWeight.medium,
        },
        messageText: {
            marginTop: 20,
            textAlign: 'center',
            fontSize: typography.fontSize.medium,
            color: colors.error,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
                Please enter the verification token sent to your email address.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Enter token"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Verify</Text>
                )}
            </TouchableOpacity>
            {message ? <Text style={styles.messageText}>{message}</Text> : null}
        </View>
    );
};

export default VerifyEmailScreen;
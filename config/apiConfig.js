// Địa chỉ IP của máy chủ backend.
// - Sử dụng '10.0.2.2' cho máy ảo Android để truy cập localhost trên máy tính.
// - Sử dụng địa chỉ IP của máy tính trong mạng LAN nếu chạy trên thiết bị thật (ví dụ: '192.168.1.10').
const API_BASE_URL = "http://10.0.2.2:10000/api";

// Định nghĩa các đường dẫn API
export const ApiEndpoints = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        GOOGLE_LOGIN: `${API_BASE_URL}/auth/google-login`,
        VERIFY_EMAIL: (token) => `${API_BASE_URL}/auth/verify-email?token=${token}`,
    },
};
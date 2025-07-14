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
  CUSTOMER: {
    GET_PROFILE: `${API_BASE_URL}/customers/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/customers/profile`,
    GET_ADDRESSES: `${API_BASE_URL}/customers/addresses`,
    ADD_ADDRESS: `${API_BASE_URL}/customers/addresses`,
    UPDATE_ADDRESS: (id) => `${API_BASE_URL}/customers/addresses/${id}`,
    DELETE_ADDRESS: (id) => `${API_BASE_URL}/customers/addresses/${id}`,
    CHANGE_PASSWORD: `${API_BASE_URL}/customers/change-password`,
  },
  ORDERS: {
    GET_MY_ORDERS: `${API_BASE_URL}/orders/my-orders`,
    CANCEL_ORDER: (id) => `${API_BASE_URL}/orders/${id}/cancel`,
  },
  PRODUCTS: {
    GET_ALL: `${API_BASE_URL}/products`,
    GET_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
    ADD_REVIEW: (id) => `${API_BASE_URL}/products/${id}/reviews`,
    UPDATE_REVIEW: (productId, reviewId) =>
      `${API_BASE_URL}/products/${productId}/reviews/${reviewId}`,
    DELETE_REVIEW: (productId, reviewId) =>
      `${API_BASE_URL}/products/${productId}/reviews/${reviewId}`,
  },
  FAVORITES: {
    GET_ALL: `${API_BASE_URL}/favorites`,
    TOGGLE: (productId) => `${API_BASE_URL}/favorites/${productId}`,
    ACTION: (productId) => `${API_BASE_URL}/favorites/${productId}`,
  },
  AI: {
    SEARCH_BY_IMAGE: `${API_BASE_URL}/ai/search-by-image`,
  },
};

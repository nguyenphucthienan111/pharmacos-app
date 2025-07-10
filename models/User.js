// Cấu trúc class cho Profile của người dùng
export class UserProfile {
  constructor(profileData = {}) {
    this.accountId = profileData.accountId || "";
    this.address = profileData.address || "";
    this.addresses = profileData.addresses || [];
    this.dateOfBirth = profileData.dateOfBirth || "";
    this.email = profileData.email || "";
    this.gender = profileData.gender || "";
    this.name = profileData.name || "";
    this.phone = profileData.phone || "";
  }
}

// Cấu trúc class cho User
export class User {
  constructor(userData = {}) {
    this.id = userData.id || "";
    this.username = userData.username || "";
    this.role = userData.role || "";
    // Tạo một instance của UserProfile từ dữ liệu profile
    this.profile = new UserProfile(userData.profile);
  }
}
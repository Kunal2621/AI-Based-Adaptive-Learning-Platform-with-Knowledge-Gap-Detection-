import API from './api';

const authService = {
  // 1. Register User (Sends OTP via Email)
  register: async (fullName, email, password, role) => {
    localStorage.clear(); // Clear any stale local session
    const response = await API.post('/auth/register', { fullName, email, password, role });
    return response.data;
  },

  // 2. Verify Email OTP
  verifyOtp: async (email, otp) => {
    const response = await API.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // 3. Normal Login (Email & Password)
  login: async (email, password, role) => {
    const response = await API.post('/auth/login', { email, password, role });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('fullName', response.data.fullName || response.data.name);
    }
    return response.data;
  },

  // 4. Google OAuth Login
  googleLogin: async (credential, role) => {
    const response = await API.post('/auth/google', { credential, role });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('fullName', response.data.fullName || response.data.name);
    }
    return response.data;
  },

  // 5. Forgot Password Request
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  // 6. Reset Password via Email Token
  resetPassword: async (token, password) => {
    const response = await API.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // 7. Logout User
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  }
};

export default authService;
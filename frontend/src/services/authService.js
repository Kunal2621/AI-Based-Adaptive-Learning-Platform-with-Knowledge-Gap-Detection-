import API from './api';

const authService = {
  // Login Handler Method
  login: async (email, password, role) => {
    const response = await API.post('/auth/login', { email, password, role });
    return response.data;
  },

  getMe: () => API.get("/auth/me").then(r => r.data.data),

  // Register Handler Method (Trigger OTP)
  register: async (fullName, email, password, role) => {
    const response = await API.post('/auth/register', { fullName, email, password, role });
    return response.data;
  },

  // 🟢 NEW: OTP Verification Method
  verifyOtp: async (email, otp) => {
    const response = await API.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Google Auth Handler
  googleLogin: async (credential, role) => {
  const response = await API.post('/auth/google', { credential, role });
  return response.data;
  },

  // Logout Handler Method
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('isRegistered');
  }
};

export default authService;
// src/services/adminService.js
import API from './api'; // lowercase, matches your actual file

const adminService = {
  getStats: async () => {
    const res = await API.get('/admin/dashboard');
    return res.data; // { metrics: {students, teachers, courses}, systemStatus, databaseHost }
  },
};

export default adminService;
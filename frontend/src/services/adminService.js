// src/services/adminService.js
import API from './api'; // lowercase, matches your actual file

const adminService = {
  getStats: async () => {
    const res = await API.get('/admin/stats');
    return res.data.data; // { metrics: {students, teachers, courses}, systemStatus, databaseHost }
  },
};

export default adminService;
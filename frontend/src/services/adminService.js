// src/services/adminService.js
import API from './api';

const adminService = {
  getDashboard: async () => {
    const res = await API.get('/admin/dashboard');
    return res.data;
  },

  getUsers: async () => {
    const res = await API.get('/admin/users');
    return res.data;
  },

  updateUserRole: async (userId, role) => {
    const res = await API.put(`/admin/users/${userId}/role`, { role });
    return res.data.data;
  },

  deleteUser: async (userId) => {
    const res = await API.delete(`/admin/users/${userId}`);
    return res.data;
  },

  getCourses: async () => {
    const res = await API.get('/admin/courses');
    return res.data;
  },

  getAnalytics: async () => {
    const res = await API.get('/admin/analytics');
    return res.data.analytics;
  },

  getReports: async () => {
    const res = await API.get('/admin/reports');
    return res.data.reports;
  },
};

export default adminService;
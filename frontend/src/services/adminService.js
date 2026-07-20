// src/services/adminService.js
import API from './api';

const adminService = {
  // GET /api/admin/dashboard
  getDashboard: async () => {
    const res = await API.get('/admin/dashboard');
    return res.data; // { success, metrics, recentUsers }
  },

  // GET /api/admin/users
  getUsers: async () => {
    const res = await API.get('/admin/users');
    return res.data; // { success, count, data: [...] }
  },

  // PUT /api/admin/users/:id/role
  // ⚠️ Currently broken on backend — runValidators rejects lowercase role
  // against the schema's capitalized enum. Will throw until Kunal fixes it.
  updateUserRole: async (userId, role) => {
    const res = await API.put(`/admin/users/${userId}/role`, { role });
    return res.data.data;
  },

  // DELETE /api/admin/users/:id
  deleteUser: async (userId) => {
    const res = await API.delete(`/admin/users/${userId}`);
    return res.data;
  },

  // GET /api/admin/courses
  getCourses: async () => {
    const res = await API.get('/admin/courses');
    return res.data; // { success, count, data: [...] }
  },
};

export default adminService;
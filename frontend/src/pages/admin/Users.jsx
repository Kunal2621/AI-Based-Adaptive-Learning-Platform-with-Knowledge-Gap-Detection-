// ============================================================
// src/pages/admin/Users.jsx
// ============================================================
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical } from "lucide-react";
import adminService from "../../services/adminService";

const ROLE_STYLES = {
  student: "bg-surface-container text-on-surface-variant",
  teacher: "bg-secondary/10 text-secondary",
  admin:   "bg-primary/10 text-primary",
};

const getInitials = (name) =>
  (name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [actionError, setActionError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Permanently delete ${userName}? This also removes their courses/submissions.`)) return;
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete user.");
    }
    setOpenMenu(null);
  };

  // ⚠️ Known broken on backend right now — will throw a validation error
  // until Kunal fixes the lowercase-vs-enum bug in updateUserRole.
  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update role (backend fix pending).");
    }
    setOpenMenu(null);
  };

  if (loading) return <div className="p-6 text-on-surface-variant text-sm">Loading users...</div>;
  if (error) return <div className="p-6 text-error text-sm">{error}</div>;

  return (
    <div className="p-3 md:p-4 max-w-7xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Users</h1>
        <span className="text-xs text-on-surface-variant">{filtered.length} total</span>
      </motion.div>

      {actionError && (
        <div className="bg-error/5 border border-error/20 text-error text-xs px-4 py-2.5 rounded-xl">
          {actionError}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl border border-black/5">
        {filtered.length === 0 ? (
          <p className="text-sm text-on-surface-variant p-6 text-center">No users found.</p>
        ) : (
          <div className="divide-y divide-black/5">
            {filtered.map((user) => (
              <div key={user._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(user.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{user.fullName}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    ROLE_STYLES[user.role?.toLowerCase()] || "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {user.role}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                    className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                  </button>
                  {openMenu === user._id && (
                    <div className="absolute right-0 mt-1 w-48 glass-card border border-black/5 rounded-xl shadow-lg z-30 text-sm overflow-hidden">
                      <button
                        onClick={() =>
                          handleRoleChange(user._id, user.role?.toLowerCase() === "teacher" ? "student" : "teacher")
                        }
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors"
                      >
                        Toggle Teacher/Student
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.fullName)}
                        className="w-full text-left px-4 py-2.5 text-error hover:bg-error/5 transition-colors"
                      >
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}


// src/pages/admin/Users.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical } from "lucide-react";
import adminService from "../../services/adminService";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

const ROLE_COLORS = {
  student: "text-primary",
  teacher: "text-green-600",
  admin:   "text-secondary",
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

  if (loading) return (
    <div className="max-w-container-max mx-auto space-y-3 pt-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse bg-surface-container rounded-2xl" />
      ))}
    </div>
  );
  if (error) return <div className="p-6 text-error text-label-md">{error}</div>;

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      <motion.div {...fadeUp()} className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-on-surface">Users</h1>
        <span className="text-label-sm text-on-surface-variant">{filtered.length} total</span>
      </motion.div>

      {actionError && (
        <div className="bg-error/5 border border-error/20 text-error text-label-sm px-4 py-2 rounded-xl">
          {actionError}
        </div>
      )}

      <motion.div {...fadeUp(0.04)} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 text-label-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      </motion.div>

      <motion.div {...fadeUp(0.08)} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-label-sm text-on-surface-variant p-6">No users found.</p>
        ) : (
          filtered.map((user, i) => (
            <motion.div
              key={user._id}
              {...fadeUp(0.1 + i * 0.02)}
              className="flex items-center gap-3 px-5 py-3 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-label-sm font-bold flex-shrink-0">
                {getInitials(user.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-medium text-on-surface truncate">{user.fullName}</p>
                <p className="text-label-sm text-on-surface-variant truncate">{user.email}</p>
              </div>
              <span className={`text-label-sm font-bold capitalize ${ROLE_COLORS[user.role?.toLowerCase()]}`}>
                {user.role}
              </span>

              <div className="relative">
                <button onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)} className="p-1.5 rounded-lg hover:bg-black/5">
                  <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                </button>
                {openMenu === user._id && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-black/10 rounded-xl shadow-lg z-10 text-label-sm overflow-hidden">
                    <button
                      onClick={() => handleRoleChange(user._id, user.role?.toLowerCase() === "teacher" ? "student" : "teacher")}
                      className="w-full text-left px-4 py-2 hover:bg-black/5"
                    >
                      Toggle Teacher/Student
                    </button>
                    <button
                      onClick={() => handleDelete(user._id, user.fullName)}
                      className="w-full text-left px-4 py-2 text-error hover:bg-error/5"
                    >
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

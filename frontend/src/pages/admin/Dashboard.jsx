// ============================================================
// src/pages/admin/Dashboard.jsx
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import adminService from "../../services/adminService";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

// ---- MOCK: no backend time-series endpoint yet ----
// Swap once Kunal adds something like GET /api/admin/dashboard/trend
const PROGRESS_DATA = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 60 },
  { day: "Thu", value: 90 },
  { day: "Fri", value: 80 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 122 },
];

const getInitials = (name) =>
  (name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const ROLE_STYLES = {
  student: "bg-surface-container text-on-surface-variant",
  teacher: "bg-secondary/10 text-secondary",
  admin: "bg-primary/10 text-primary",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    platformAverageScore: 0,
  });

  const [adminName, setAdminName] = useState("");
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();

        setStats({
          totalUsers: res.metrics.totalUsers,
          totalCourses: res.metrics.totalCourses,
          totalQuizzes: res.metrics.totalQuizzes,
          platformAverageScore: res.metrics.platformAverageScore,
        });

        setRecentUsers(res.recentUsers || []);

        // TODO: replace with admin's real name from AuthContext, same as teacher does
        setAdminName(localStorage.getItem("userName") || "Admin");
      } catch (err) {
        console.log(err);
      }
    };

    fetchDashboard();
  }, []);

  const STATS = [
    { id: "users", icon: "group", label: "Total Users", value: stats.totalUsers, color: "text-primary", bg: "bg-primary/10", path: "/admin/users" },
    { id: "courses", icon: "library_books", label: "Courses", value: stats.totalCourses, color: "text-green-500", bg: "bg-green-50 dark:bg-green-400/10", path: "/admin/courses" },
    { id: "quizzes", icon: "quiz", label: "Quizzes", value: stats.totalQuizzes, color: "text-error", bg: "bg-error/10", path: "/admin/analytics" },
    { id: "score", icon: "insights", label: "Avg Score", value: `${stats.platformAverageScore}%`, color: "text-secondary", bg: "bg-secondary/10", path: "/admin/analytics" },
  ];

  const maxProgress = Math.max(...PROGRESS_DATA.map((d) => d.value), 1);

  return (
    <div className="p-3 md:p-4 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <motion.div
        {...fadeUp()}
        className="relative overflow-hidden rounded-2xl primary-gradient p-6 md:p-8 text-white shadow-lg shadow-primary/20"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium tracking-wider">WELCOME BACK</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">Hello, {adminName}!</h1>
          <p className="text-white/70 text-sm mt-1">Manage users, courses, and platform-wide performance.</p>
          <div className="flex gap-2 flex-wrap mt-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-white/15 border border-white/30 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate("/admin/analytics")}
              className="bg-white/15 border border-white/30 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              View Analytics
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.button
            key={s.id}
            {...fadeUp(i * 0.05)}
            onClick={() => navigate(s.path)}
            className="glass-card rounded-2xl p-5 border border-black/5 flex items-start gap-4 text-left hover:-translate-y-0.5 transition-transform"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Platform activity chart — mock until backend supports time-series */}
      <motion.div {...fadeUp(0.08)} className="glass-card rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold text-on-surface mb-1">Platform Activity</h2>
        <p className="text-xs text-on-surface-variant mb-4">Mock data — swap once the trend endpoint ships</p>
        <div className="flex items-end gap-3 h-40">
          {PROGRESS_DATA.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full">
              <div className="w-full flex-1 rounded-t-lg bg-primary/10 relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-primary transition-all duration-500"
                  style={{ height: `${(d.value / maxProgress) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-on-surface-variant">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent users */}
      <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">group</span>
            <h2 className="font-semibold text-on-surface">Recent Users</h2>
          </div>
          <button onClick={() => navigate("/admin/users")} className="text-primary text-xs font-medium hover:underline">
            View all
          </button>
        </div>
        <div className="divide-y divide-black/5">
          {recentUsers.length === 0 ? (
            <p className="p-5 text-sm text-center text-on-surface-variant">No users yet.</p>
          ) : (
            recentUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(user.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-on-surface truncate">{user.fullName}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    ROLE_STYLES[user.role?.toLowerCase()] || "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

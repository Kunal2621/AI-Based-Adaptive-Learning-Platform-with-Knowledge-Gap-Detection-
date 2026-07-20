// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";
import StatCard from "../../components/dashboard/StatCard";
import ProgressChart from "../../components/dashboard/ProgressChart";
import Badge from "../../components/dashboard/Badge";

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
    {
      id: "users",
      label: "Total Users",
      value: stats.totalUsers,
      valueClassName: "text-primary",
      path: "/admin/users",
    },
    {
      id: "courses",
      label: "Courses",
      value: stats.totalCourses,
      valueClassName: "text-green-600",
      path: "/admin/courses",
    },
    {
      id: "quizzes",
      label: "Quizzes",
      value: stats.totalQuizzes,
      valueClassName: "text-red-500",
      path: "/admin/analytics",
    },
    {
      id: "score",
      label: "Avg Score",
      value: `${stats.platformAverageScore}%`,
      valueClassName: "text-secondary",
      path: "/admin/analytics",
    },
  ];

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="primary-gradient rounded-xl px-6 sm:px-8 py-7 sm:py-8 text-white">
        <p className="text-label-sm tracking-wider opacity-80 mb-2">WELCOME BACK</p>
        <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold mb-2">
          Hello, {adminName}!
        </h1>
        <p className="text-body-md opacity-90 mb-4 whitespace-nowrap">
          Manage users, courses, and platform-wide performance.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2 text-label-sm font-bold hover:bg-white/30 transition-colors"
          >
            Manage Users
          </button>
          <button
            onClick={() => navigate("/admin/analytics")}
            className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2 text-label-sm font-bold hover:bg-white/30 transition-colors"
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ id, label, value, valueClassName, path }) => (
          <StatCard
            key={id}
            label={label}
            value={value}
            valueClassName={valueClassName}
            onClick={() => navigate(path)}
          />
        ))}
      </div>

      {/* Platform activity chart — mock until backend supports time-series */}
      <ProgressChart data={PROGRESS_DATA} title="Platform Activity" />

      {/* Recent users */}
      <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-bold text-on-surface">Recent Users</h2>
          <button
            onClick={() => navigate("/admin/users")}
            className="text-label-sm font-bold text-primary hover:text-primary-container transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {recentUsers.length === 0 ? (
            <p className="text-label-sm text-on-surface-variant py-4">No users yet.</p>
          ) : (
            recentUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2 border-b border-black/5 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-label-sm font-bold flex-shrink-0">
                  {getInitials(user.fullName)}
                </div>
                <span className="text-label-md font-medium text-on-surface w-32 sm:w-40 flex-shrink-0 truncate">
                  {user.fullName}
                </span>
                <span className="text-label-sm text-on-surface-variant flex-1 truncate">
                  {user.email}
                </span>
                <Badge status={user.role} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
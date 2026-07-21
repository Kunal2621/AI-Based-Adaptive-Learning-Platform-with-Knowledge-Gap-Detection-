// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users2, TrendingUp, ArrowUpRight } from "lucide-react";
import adminService from "../../services/adminService";
import StatCard from "../../components/dashboard/StatCard";
import ProgressChart from "../../components/dashboard/ProgressChart";
import Badge from "../../components/dashboard/Badge";

const PROGRESS_DATA = [
  { day: "Mon", value: 40 }, { day: "Tue", value: 55 }, { day: "Wed", value: 60 },
  { day: "Thu", value: 90 }, { day: "Fri", value: 80 }, { day: "Sat", value: 100 }, { day: "Sun", value: 122 },
];

const getInitials = (name) =>
  (name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalQuizzes: 0, platformAverageScore: 0 });
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
        setAdminName(localStorage.getItem("userName") || "Admin");
      } catch (err) {
        console.log(err);
      }
    };
    fetchDashboard();
  }, []);

  const STATS = [
    { id: "users",    label: "Total Users", value: stats.totalUsers,    valueClassName: "text-primary",   path: "/admin/users"     },
    { id: "courses",  label: "Courses",     value: stats.totalCourses,  valueClassName: "text-green-600", path: "/admin/courses"   },
    { id: "quizzes",  label: "Quizzes",     value: stats.totalQuizzes,  valueClassName: "text-red-500",   path: "/admin/analytics" },
    { id: "score",    label: "Avg Score",   value: `${stats.platformAverageScore}%`, valueClassName: "text-secondary", path: "/admin/analytics" },
  ];

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="primary-gradient relative overflow-hidden rounded-2xl px-6 sm:px-8 py-8 sm:py-10 text-white shadow-lg">
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-24 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <p className="text-label-sm tracking-widest opacity-80 mb-2 relative">WELCOME BACK</p>
        <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold mb-2 relative">
          Hello, {adminName}!
        </h1>
        <p className="text-body-md opacity-90 mb-5 relative">
          Manage users, courses, and platform-wide performance.
        </p>
        <div className="flex gap-2 flex-wrap relative">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1.5 bg-white/15 border border-white/30 backdrop-blur-sm text-white rounded-xl px-4 py-2.5 text-label-sm font-bold hover:bg-white/25 hover:-translate-y-0.5 transition-all"
          >
            <Users2 size={15} /> Manage Users
          </button>
          <button
            onClick={() => navigate("/admin/analytics")}
            className="flex items-center gap-1.5 bg-white/15 border border-white/30 backdrop-blur-sm text-white rounded-xl px-4 py-2.5 text-label-sm font-bold hover:bg-white/25 hover:-translate-y-0.5 transition-all"
          >
            <TrendingUp size={15} /> View Analytics
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ id, label, value, valueClassName, path }) => (
          <div key={id} className="transition-transform hover:-translate-y-1">
            <StatCard label={label} value={value} valueClassName={valueClassName} onClick={() => navigate(path)} />
          </div>
        ))}
      </div>

      {/* Platform activity chart */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow p-5 sm:p-6">
        <ProgressChart data={PROGRESS_DATA} title="Platform Activity" />
      </div>

      {/* Recent users */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-bold text-on-surface">Recent Users</h2>
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1 text-label-sm font-bold text-primary hover:text-primary-container transition-colors"
          >
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {recentUsers.length === 0 ? (
            <p className="text-label-sm text-on-surface-variant py-6 text-center">No users yet.</p>
          ) : (
            recentUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-surface-container transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-label-sm font-bold flex-shrink-0 ring-2 ring-white">
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
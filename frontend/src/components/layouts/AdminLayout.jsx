// ============================================================
// src/layouts/AdminLayout.jsx
// Mirrors TeacherLayout exactly — same Sidebar + DashboardNavbar pattern
// but with admin nav items and "Admin Panel" label.
// ============================================================
import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  X,
  Menu,
  Bell,
} from "lucide-react";
import banner from "../../assests/images/banner.svg";

// ─────────────────────────────────────────────────────────────
// NAV ITEMS — admin specific
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users",     to: "/admin/users",     icon: Users            },
  { label: "Courses",   to: "/admin/courses",   icon: BookOpen         },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3        },
  { label: "Reports",   to: "/admin/reports",   icon: FileText         },
  { label: "Settings",  to: "/admin/settings",  icon: Settings         },
];

// Maps path → navbar title (same pattern as TeacherLayout)
const PAGE_TITLES = {
  "/admin":           "Admin Dashboard",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/users":     "Users",
  "/admin/courses":   "Courses",
  "/admin/analytics": "Analytics",
  "/admin/reports":   "Reports",
  "/admin/settings":  "Settings",
};

// ─────────────────────────────────────────────────────────────
// SIDEBAR — same structure as teacher Sidebar.jsx
// ─────────────────────────────────────────────────────────────
function AdminSidebar({ isOpen, onClose, onLogout }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-card border-r border-black/5 flex flex-col transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo + close (mobile) */}
        <div className="flex items-center justify-between px-5 py-5">
          <img src={banner} alt="Knowledge Guru logo" className="w-36 object-contain" />
          <button
            onClick={onClose}
            className="lg:hidden text-on-surface-variant"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Panel label */}
        <p className="px-6 text-sm font-bold text-primary -mt-1 mb-4 tracking-wide">
          Admin Panel
        </p>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-black/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVBAR — same structure as DashboardNavbar.jsx
// ─────────────────────────────────────────────────────────────
function AdminNavbar({ title, onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="h-16 glass-card border-b border-black/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-on-surface-variant p-1 -ml-1"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-bold truncate text-lg text-on-surface">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        <button
          onClick={() => navigate("/admin/settings")}
          className="w-9 h-9 rounded-full primary-gradient text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20"
          aria-label="Profile"
        >
          A
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN LAYOUT — main export
// ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const title = PAGE_TITLES[location.pathname] || "Admin Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-2 sm:p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

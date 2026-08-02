import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import banner from "../../assests/images/banner.png";

const NAV = [
  { to: "/student/dashboard",       icon: "dashboard",      label: "Dashboard" },
  { to: "/student/courses",         icon: "library_books",  label: "Courses" },
  { to: "/student/recommendations", icon: "auto_awesome",   label: "AI Recommendations" },
  { to: "/student/reports",         icon: "bar_chart",      label: "Reports" },
  { to: "/student/chatbot",         icon: "smart_toy",      label: "AI Chatbot" },
  { to: "/student/profile",         icon: "person",         label: "Profile" },
];

export default function StudentSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/5 flex flex-col transition-transform duration-200
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-black/5">
          <div className="flex items-center gap-2">
            <img src={banner} alt="Knowledge Guru" className="h-10 w-auto object-contain"/>
          </div>
          <button onClick={onClose} className="lg:hidden text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-black/5">
          <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
            <div className="w-9 h-9 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.avatar
                ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                : user?.fullName?.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-xs text-on-surface-variant">Student</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-xl ${isActive ? "text-primary" : ""}`}
                    style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}>
                    {icon}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-black/5">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}



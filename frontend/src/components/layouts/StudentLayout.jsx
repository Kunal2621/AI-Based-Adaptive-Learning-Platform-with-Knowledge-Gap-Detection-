import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import StudentSidebar from "../common/StudentSidebar";
import { useAuth } from "../../hooks/useAuth";
import API from "../../services/api";

const ROUTE_LABELS = {
  "/student/dashboard": "Dashboard",
  "/student/courses": "My Courses",
  "/student/quiz": "Quizzes",
  "/student/recommendations": "AI Recommendations",
  "/student/reports": "Performance Reports",
  "/student/chatbot": "AI Chatbot",
  "/student/profile": "My Profile",
};

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  const { user } = useAuth();
  const location = useLocation();
  const notifRef = useRef(null);

  const pageTitle =
    Object.entries(ROUTE_LABELS).find(([k]) =>
      location.pathname.startsWith(k)
    )?.[1] || "Student";

  useEffect(() => {
    API.get("/student/notifications")
      .then((r) => {
        const data = r.data.data || [];
        setNotifs(data);
        setUnread(data.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await API.put("/student/notifications/read-all").catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-white border-b border-black/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container text-on-surface-variant"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <h1 className="text-base font-semibold text-on-surface">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container text-on-surface-variant hover:bg-primary/10 transition-colors relative"
              >
                <span className="material-symbols-outlined text-xl">
                  notifications
                </span>

                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-black/5 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                    <span className="font-semibold text-sm">
                      Notifications
                    </span>

                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-primary font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-black/5">
                    {notifs.length === 0 ? (
                      <p className="text-center text-sm text-on-surface-variant py-6">
                        No notifications
                      </p>
                    ) : (
                      notifs.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          className={`px-4 py-3 text-sm ${
                            !n.isRead ? "bg-primary/5" : ""
                          }`}
                        >
                          <p className="font-medium text-on-surface">
                            {n.title}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/student/profile"
              className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center text-white font-bold text-sm overflow-hidden"
            >
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                user?.fullName?.charAt(0) || "S"
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

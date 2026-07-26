// ============================================================
// src/pages/admin/Reports.jsx
// ============================================================
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminService from "../../services/adminService";

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await adminService.getReports();
        setReports(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-6 text-on-surface-variant text-sm">Loading reports...</div>;
  if (error) return <div className="p-6 text-error text-sm">{error}</div>;

  const CARDS = [
    { label: "Total Students", value: reports.totalStudents, icon: "school", color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Teachers", value: reports.totalTeachers, icon: "person_book", color: "text-green-500", bg: "bg-green-50 dark:bg-green-400/10" },
    { label: "Total Courses",  value: reports.totalCourses,  icon: "library_books", color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Exam Attempts",  value: reports.totalExamAttempts, icon: "quiz", color: "text-error", bg: "bg-error/10" },
  ];

  return (
    <div className="p-3 md:p-4 max-w-6xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <h1 className="text-2xl font-bold text-on-surface">System Reports</h1>
        <span className="text-xs text-on-surface-variant">
          Generated {new Date(reports.generatedAt).toLocaleString()}
        </span>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-5 border border-black/5 flex items-start gap-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
              <span className={`material-symbols-outlined ${c.color}`}>{c.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface">{c.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-on-surface-variant">
        Total Students and Total Teachers will show 0 until the role-matching bug in{" "}
        <code className="px-1 py-0.5 bg-surface-container rounded">getAdminReports</code> is fixed on the backend.
      </p>
    </div>
  );
}

// src/pages/admin/Reports.jsx
import { useState, useEffect } from "react";
import { Users2, GraduationCap, BookOpen, ClipboardCheck, Clock, AlertTriangle } from "lucide-react";
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

  if (loading) return <div className="p-6 text-on-surface-variant text-label-md">Loading reports...</div>;
  if (error) return <div className="p-6 text-error text-label-md">{error}</div>;

  const CARDS = [
    { label: "Total Students", value: reports.totalStudents,     color: "text-primary",     bg: "bg-primary-fixed", icon: GraduationCap },
    { label: "Total Teachers", value: reports.totalTeachers,     color: "text-green-600",   bg: "bg-green-50",      icon: Users2 },
    { label: "Total Courses",  value: reports.totalCourses,      color: "text-secondary",   bg: "bg-surface-container", icon: BookOpen },
    { label: "Exam Attempts",  value: reports.totalExamAttempts, color: "text-red-500",     bg: "bg-red-50",        icon: ClipboardCheck },
  ];

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-headline-lg font-bold text-on-surface">System Reports</h1>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <Clock size={14} />
          Generated {new Date(reports.generatedAt).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ label, value, color, bg, icon: Icon }) => (
          <div
            key={label}
            className="bg-surface-container-lowest rounded-2xl border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
            <p className={`text-headline-md font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 bg-surface-container-lowest border border-black/5 rounded-xl px-4 py-3">
        <AlertTriangle size={15} className="text-on-surface-variant mt-0.5 flex-shrink-0" />
        <p className="text-label-sm text-on-surface-variant">
          Total Students and Total Teachers will show 0 until the role-matching bug in <code>getAdminReports</code> is fixed on the backend.
        </p>
      </div>
    </div>
  );
}
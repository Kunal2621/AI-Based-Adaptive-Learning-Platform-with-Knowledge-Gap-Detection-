import { useState, useEffect } from "react";
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
    { label: "Total Students", value: reports.totalStudents, color: "text-primary" },
    { label: "Total Teachers", value: reports.totalTeachers, color: "text-green-600" },
    { label: "Total Courses",  value: reports.totalCourses,  color: "text-secondary" },
    { label: "Exam Attempts",  value: reports.totalExamAttempts, color: "text-red-500" },
  ];

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-on-surface">System Reports</h1>
        <span className="text-label-sm text-on-surface-variant">
          Generated {new Date(reports.generatedAt).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ label, value, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-xl p-5">
            <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
            <p className={`text-headline-md font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <p className="text-label-sm text-on-surface-variant">
        Total Students and Total Teachers will show 0 until the role-matching bug in <code>getAdminReports</code> is fixed on the backend.
      </p>
    </div>
  );
}
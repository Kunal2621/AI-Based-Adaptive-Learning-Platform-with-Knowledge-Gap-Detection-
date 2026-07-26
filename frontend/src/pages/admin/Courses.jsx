// ============================================================
// src/pages/admin/Courses.jsx
// ============================================================
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminService from "../../services/adminService";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await adminService.getCourses();
        setCourses(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="p-6 text-on-surface-variant text-sm">Loading courses...</div>;
  if (error) return <div className="p-6 text-error text-sm">{error}</div>;

  return (
    <div className="p-3 md:p-4 max-w-6xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Courses</h1>
        <span className="text-xs text-on-surface-variant">{courses.length} total</span>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl border border-black/5 overflow-hidden">
        {courses.length === 0 ? (
          <p className="text-sm text-on-surface-variant p-6 text-center">No courses yet.</p>
        ) : (
          <div className="divide-y divide-black/5">
            {courses.map((course) => (
              <div key={course._id} className="flex items-center gap-3 px-5 py-4 hover:bg-surface-container transition-colors">
                <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-base">school</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{course.title}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    Teacher: {course.teacher?.name || "Unassigned"} {course.teacher?.email ? `(${course.teacher.email})` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

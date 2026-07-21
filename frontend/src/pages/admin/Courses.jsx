// src/pages/admin/Courses.jsx
import { useState, useEffect } from "react";
import { BookOpen, GraduationCap } from "lucide-react";
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

  if (loading) return <div className="p-6 text-on-surface-variant text-label-md">Loading courses...</div>;
  if (error) return <div className="p-6 text-error text-label-md">{error}</div>;

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-headline-lg font-bold text-on-surface">Courses</h1>
        <span className="text-label-sm font-semibold text-primary bg-primary-fixed px-3 py-1 rounded-full">
          {courses.length} total
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-black/5 text-center py-14">
          <BookOpen className="w-9 h-9 text-on-surface-variant mx-auto mb-2 opacity-50" />
          <p className="text-label-sm text-on-surface-variant">No courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-surface-container-lowest rounded-2xl border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-5"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center mb-3">
                <BookOpen size={20} className="text-primary" />
              </div>
              <p className="text-label-md font-bold text-on-surface mb-2 line-clamp-2">{course.title}</p>
              <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                <GraduationCap size={14} className="flex-shrink-0" />
                <span className="truncate">
                  {course.teacher?.name || "Unassigned"}
                  {course.teacher?.email ? ` · ${course.teacher.email}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// src/pages/admin/Courses.jsx
import { useState, useEffect } from "react";
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
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold text-on-surface">Courses</h1>
        <span className="text-label-sm text-on-surface-variant">{courses.length} total</span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        {courses.length === 0 ? (
          <p className="text-label-sm text-on-surface-variant p-6">No courses yet.</p>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="px-5 py-4 border-b border-black/5 last:border-0">
              <p className="text-label-md font-medium text-on-surface">{course.title}</p>
              <p className="text-label-sm text-on-surface-variant">
                Teacher: {course.teacher?.name || "Unassigned"} {course.teacher?.email ? `(${course.teacher.email})` : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
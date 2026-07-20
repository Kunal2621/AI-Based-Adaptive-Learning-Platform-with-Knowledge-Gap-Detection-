import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, BookOpen, Clock, Users } from "lucide-react";
import API from "../../services/api";

export default function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      setLoading(true);
      // Connected directly to the verified backend path
      const res = await API.get("/teacher/courses");
      const payload = res.data?.success !== undefined ? res.data : res;
      setCourses(payload.data || []);
    } catch (err) {
      console.error("Failed fetching class course arrays matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) =>
    (c.title || "").toLowerCase().includes(query.toLowerCase().trim())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-gray-500 text-sm animate-pulse">Loading Class Syllabi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2">
      {/* Header Viewport Control Panel Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Course Administration</h1>
          <p className="text-xs text-gray-400 mt-0.5">Deploy and moderate structural study tracks.</p>
        </div>

        {/* FIXED: Crash route path fixed from dynamic mapping back to create panel endpoint form */}
        <button
          onClick={() => navigate("/teacher/courses/create")}
          className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition w-full sm:w-auto shadow-sm shadow-purple-100"
        >
          <Plus size={16} /> Add New Course
        </button>
      </div>

      {/* Search Actions Filter Row */}
      <div className="relative max-w-md w-full">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        {/* FIXED: Replaced invalid pl-39 class with standard clean responsive left padding grid standard */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter courses by name title..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
        />
      </div>

      {/* Grid Iteration Render Interface Maps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course) => (
          <div
            key={course._id}
            onClick={() => navigate(`/teacher/courses/${course._id}`)}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center border border-purple-100">
                <BookOpen size={18} />
              </div>
              <h2 className="font-bold text-gray-800 text-base truncate pt-1">{course.title}</h2>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {course.description || "No supplemental details compiled for this course shell yet."}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 pt-3 border-t border-gray-50">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                {course.enrolledStudents?.length || 0} Active
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                {course.modules?.length || 0} Chapters
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 italic text-center py-12">
          No courses matching filtering parameters located in storage memory matrices.
        </p>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      // 🟢 Directly single course details call karein
      const res = await API.get(`/teacher/courses/${id}`);
      setCourse(res.data.data);
    } catch (err) {
      console.log("Error fetching course details:", err);
      // Fallback if single course endpoint is not active
      try {
        const res = await API.get("/teacher/courses");
        const foundCourse = res.data.data?.find((c) => String(c._id) === String(id));
        setCourse(foundCourse);
      } catch (fallbackErr) {
        console.log(fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-purple-700 font-semibold animate-pulse">
        Loading Course Details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-10 text-center text-red-500">
        Course not found or failed to load.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-3xl font-bold text-purple-700">{course.title}</h1>

        <p className="mt-4 text-gray-600">{course.description}</p>

        <div className="grid grid-cols-2 gap-5 mt-8">
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
            <h3 className="font-semibold text-purple-900">Category</h3>
            <p className="text-purple-700">{course.category}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-semibold text-blue-900">Level</h3>
            <p className="text-blue-700">{course.level}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Modules</h2>

          {!course.modules || course.modules.length === 0 ? (
            <div className="text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
              No Modules Added
            </div>
          ) : (
            course.modules.map((module, index) => {
              const isCurrentExpanded = expandedModule === index;

              return (
                <div key={module._id || index} className="border rounded-xl p-4 mb-4 bg-white shadow-xs">
                  <div
                    onClick={() => setExpandedModule(isCurrentExpanded ? null : index)}
                    className="flex justify-between items-center cursor-pointer select-none"
                  >
                    <h3 className="font-semibold text-gray-800">{module.moduleName}</h3>
                    <span className="text-purple-600 font-medium text-xs">
                      {isCurrentExpanded ? "▲ Hide Lessons" : "▼ Show Lessons"}
                    </span>
                  </div>

                  {isCurrentExpanded && (
                    <ul className="mt-4 list-none space-y-3 border-t pt-3">
                      {module.lessons?.map((lesson, i) => (
                        <li
                          key={lesson._id || i}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            • {lesson.title}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Pass IDs safely
                              const mId = module._id ? module._id : index;
                              const lId = lesson._id ? lesson._id : i;
                              navigate(`/teacher/courses/${id}/modules/${mId}/lessons/${lId}`);
                            }}
                            className="px-3.5 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition"
                          >
                            Manage Content
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
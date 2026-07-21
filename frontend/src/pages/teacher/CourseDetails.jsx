import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);

  // ── CODE WORD SYNC: Sirf ye state add ki hai modules open/close track karne ke liye ──
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    try {
      const res = await API.get("/teacher/courses");

      const data = res.data.data.find((c) => c._id === id);

      setCourse(data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!course) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-200"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">

        <h1 className="text-3xl font-bold text-purple-700">
          {course.title}
        </h1>

        <p className="mt-4 text-gray-600">
          {course.description}
        </p>

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div className="bg-purple-50 rounded-xl p-5">
            <h3 className="font-semibold">
              Category
            </h3>

            <p>{course.category}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-semibold">
              Level
            </h3>

            <p>{course.level}</p>
          </div>

        </div>

        <div className="mt-8">

          <h2 className="text-xl font-bold mb-4">
            Modules
          </h2>

          {course.modules.length === 0 ? (

            <div className="text-gray-500">
              No Modules Added
            </div>

          ) : (

            course.modules.map((module, index) => {
              // ── CODE WORD SYNC: Check kar rahe hain ki ye module open hai ya nahi ──
              const isCurrentExpanded = expandedModule === index;

              return (
                <div
                  key={index}
                  className="border rounded-xl p-4 mb-4"
                >
                  {/* ── CODE WORD SYNC: Header ko clickable banaya aur cursor-pointer add kiya bina words badle ── */}
                  <div 
                    onClick={() => setExpandedModule(isCurrentExpanded ? null : index)}
                    className="flex justify-between items-center cursor-pointer select-none"
                  >
                    <h3 className="font-semibold">
                      {module.moduleName}
                    </h3>
                    <span className="text-gray-400 text-xs">
                      {isCurrentExpanded ? "▲ Hide Lessons" : "▼ Show Lessons"}
                    </span>
                  </div>

                  {/* ── CODE WORD SYNC: Lessons sirf tabhi dikhenge jab module par click hoga ── */}
                  {isCurrentExpanded && (
                    <ul className="mt-4 list-none ml-0 space-y-3 border-t pt-3">
                      {module.lessons.map((lesson, i) => (
                        <li 
                          key={i} 
                          className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100"
                        >
                          <span className="text-sm text-gray-700">
                            • {lesson.title}
                          </span>
                          
                          {/* ── CODE WORD SYNC: Clickable manage button ── */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teacher/courses/${id}/modules/${module._id || index}/lessons/${lesson._id || i}`);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition"
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
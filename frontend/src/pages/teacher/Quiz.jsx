import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function Quiz() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]); // Array clear variables logic sync
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      // Direct core sync to avoid pluralization routing bugs
      const res = await API.get("/quiz");
      setQuizzes(res.data?.data || []);
    } catch (err) {
      console.error("Quiz collection tracking failure:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      // FIXED: /course ko badalkar true backend endpoint route lagaya h
      const res = await API.get("/teacher/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error("Course sync matrix execution failure:", err);
    }
  };

  const generateAIQuiz = async (e) => {
    e.preventDefault();

    if (!title || !course || !topic) {
      return alert("Please fill all required validation fields.");
    }

    try {
      setLoading(true);

      const body = {
        title,
        description: "",
        course, // Passing target ID reference string
        questions: [
          {
            question: topic, // Extracted dynamically by Gemini backend pipelines
          },
        ],
      };

      const res = await API.post("/quiz", body);
      alert(res.data?.message || "AI Quiz generated successfully!");

      setTitle("");
      setCourse("");
      setTopic("");

      fetchQuizzes();
    } catch (err) {
      console.error("AI Generation operation fault:", err);
      alert(err.response?.data?.message || "Quiz generation failed configuration paths.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-2">

      {/* AI Generator Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Generate AI Technical Quiz
        </h2>

        <form onSubmit={generateAIQuiz} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Quiz Title</label>
              <input
                type="text"
                placeholder="Enter assignment or test heading"
                className="w-full border border-gray-200 rounded-lg p-3 mt-1.5 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Select Tracked Course</label>
              <select
                className="w-full border border-gray-200 bg-white rounded-lg p-3 mt-1.5 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">Choose active registration mapping...</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Target Core Topic Core</label>
            <input
              type="text"
              placeholder="Example: React Hooks rendering context, ACID Properties index"
              className="w-full border border-gray-200 rounded-lg p-3 mt-1.5 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 font-medium text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-purple-300"
          >
            {loading ? "Gemini Compiling Parameters..." : "Generate Evaluation Block"}
          </button>
        </form>
      </div>

      {/* Generated Logs Historical Registry Grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Generated Track Histories</h2>
        </div>

        {quizzes.length === 0 ? (
          <p className="text-sm text-gray-400 p-8 italic text-center">No tests compile metadata tracks present.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="p-4">Title Descriptor</th>
                  <th className="p-4">Topic Target</th>
                  <th className="p-4 text-center">Items Bound</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quizzes.map((q) => (
                  <tr key={q._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-medium text-gray-800">{q.title}</td>
                    <td className="p-4 text-purple-600 font-semibold">{q.topic || "General"}</td>
                    {/* FIXED: Crash safety boundaries protection chain validation rule */}
                    <td className="p-4 text-center font-bold text-gray-500">{q.questions?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
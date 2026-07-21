import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);
  
  // 🟢 State for Viewing Selected Quiz Modal & Assigning
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await API.get("/quizzes");
      setQuizzes(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Quiz collection tracking failure:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/teacher/courses");
      setCourses(res.data?.data || res.data || []);
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
        topic,
        courseId: course,
        difficulty: "Medium",
        numberOfQuestions: 10
      };

      const res = await API.post("/quiz/generate", body);
      alert(res.data?.message || "AI Quiz generated successfully!");

      setTitle("");
      setCourse("");
      setTopic("");

      if (res.data?.data) {
        setQuizzes((prev) => [res.data.data, ...prev]);
        setSelectedQuiz(res.data.data); // Open preview immediately after generation
      } else {
        fetchQuizzes();
      }

    } catch (err) {
      console.error("AI Generation fault:", err);
      alert(err.response?.data?.message || err.message || "Failed to generate AI quiz.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Assign Quiz to Students Handler
  const handleAssignToStudents = async () => {
    if (!selectedQuiz?._id) return;

    try {
      setAssigning(true);
      const res = await API.put(`/quizzes/${selectedQuiz._id}/assign`);
      
      alert("✅ Quiz has been successfully published and assigned to students!");
      
      // Update state locally
      setSelectedQuiz((prev) => ({ ...prev, isAssigned: true }));
      fetchQuizzes();
    } catch (err) {
      console.error("Error assigning quiz:", err);
      alert(err.response?.data?.message || "Failed to assign quiz.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-2">

      {/* AI Generator Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Generate AI Technical Quiz</h2>

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
            <label className="text-sm font-medium text-gray-700">Target Core Topic</label>
            <input
              type="text"
              placeholder="Example: Variables, Data Types, React Hooks"
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

      {/* Generated Track Histories Table (Clickable Rows) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Generated Track Histories</h2>
          <span className="text-xs text-purple-600 font-medium">💡 Click any row to preview questions & assign</span>
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
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quizzes.map((q) => (
                  <tr 
                    key={q._id} 
                    onClick={() => setSelectedQuiz(q)} // 🔥 CLICK TO OPEN MODAL
                    className="hover:bg-purple-50/50 cursor-pointer transition"
                  >
                    <td className="p-4 font-medium text-gray-800">{q.title}</td>
                    <td className="p-4 text-purple-600 font-semibold">{q.topic || "General"}</td>
                    <td className="p-4 text-center font-bold text-gray-500">{q.questions?.length || 0}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        q.isAssigned 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {q.isAssigned ? "Assigned" : "Draft (Click to Send)"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🟢 FULL QUIZ PREVIEW & ASSIGN TO STUDENTS MODAL */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-purple-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedQuiz.title}</h3>
                <p className="text-xs text-purple-600 font-medium mt-0.5">
                  Topic: {selectedQuiz.topic} • {selectedQuiz.questions?.length || 0} Questions Total
                </p>
              </div>
              <button 
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Questions List */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
              {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                selectedQuiz.questions.map((q, idx) => (
                  <div key={idx} className="border border-gray-100 p-4 rounded-xl bg-gray-50/50 space-y-3">
                    <p className="font-bold text-gray-800">
                      Q{idx + 1}. {q.questionText || q.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.answerOptions?.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`p-2.5 rounded-lg border text-xs font-medium flex justify-between items-center ${
                            opt.isCorrect 
                              ? "bg-green-50 border-green-200 text-green-800 font-bold" 
                              : "bg-white border-gray-200 text-gray-600"
                          }`}
                        >
                          <span>{opt.text}</span>
                          {opt.isCorrect && <span>✓ Correct</span>}
                        </div>
                      ))}
                    </div>

                    {q.hint && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        💡 <strong>Hint:</strong> {q.hint}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 italic">No questions found in this quiz payload.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>

              <button
                onClick={handleAssignToStudents}
                disabled={assigning || selectedQuiz.isAssigned}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg transition text-white ${
                  selectedQuiz.isAssigned
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {selectedQuiz.isAssigned 
                  ? "✓ Assigned to Students" 
                  : assigning 
                  ? "Publishing..." 
                  : "Publish & Send to Students 🚀"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
import { useState } from "react";
import { createPortal } from "react-dom"; // 👈 React Portal Import kiya
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/teacher/courses", {
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level,
      });

      console.log(res.data);
      alert("Course Created Successfully");
      navigate("/teacher/courses");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || err.message || "Course creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      
      {/* 🟢 REACT PORTAL: Ye overlay ko pure UI ke TOP level (body) par attach karega */}
      {loading &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center min-h-screen w-screen top-0 left-0">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center border border-gray-100">
              
              {/* Spinner */}
              <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-800">Generating Syllabus...</h3>
                <p className="text-sm text-gray-500">
                  AI is designing modules, lessons & practice material. Please wait...
                </p>
              </div>
              
              <div className="text-xs bg-purple-50 text-purple-700 font-medium px-3 py-1.5 rounded-full animate-pulse">
                ⚡ Powered by Gemini AI
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-xl p-6 sm:p-8 space-y-5 transition-all shadow-md ${
          loading ? "pointer-events-none opacity-40 blur-[1px]" : ""
        }`}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Course Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Linear Algebra Basics"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="What will students learn?"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
            disabled={loading}
          />
        </div>

        <div>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white"
            required
            disabled={loading}
          >
            <option value="">Select Category</option>
            <optgroup label="Engineering">
              <option>Computer Science</option>
              <option>Information Technology</option>
              <option>Electronics & Communication</option>
            </optgroup>
            {/* baki categories... */}
            <option value="Others">Others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white"
            required
            disabled={loading}
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              "Create Course"
            )}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/teacher/courses")}
            className="px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();
  // 🟢 1. Dynamic Loading state (Aapka dynamic time handle karega)
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
    
    // 🟢 2. Jab tak API response nahi deti, tab tak loading true rahega (no fixed timer)
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
      
      // Navigate to Courses list
      navigate("/teacher/courses");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || err.message || "Course creation failed");
    } finally {
      // 🟢 3. Success ho ya Fail, response aane ke turant baad loading hategi
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      
      {/* 🟢 FULL SCREEN LOADING OVERLAY (Dikhne me awesome & dynamic delay proof) */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center transition-all duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center border border-gray-100">
            
            {/* Spinning Loader Ring */}
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
        </div>
      )}

      {/* Main Form Body */}
      <form
        onSubmit={handleSubmit}
        className={`bg-surface-container-lowest rounded-xl p-6 sm:p-8 space-y-5 transition-all ${
          loading ? "pointer-events-none opacity-40 blur-[1px]" : ""
        }`}
      >
        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
            Course Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Linear Algebra Basics"
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="What will students learn?"
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            disabled={loading}
          />
        </div>

        <div>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border"
            required
            disabled={loading}
          >
            <option value="">Select Category</option>

            <optgroup label="Engineering">
              <option>Computer Science</option>
              <option>Information Technology</option>
              <option>Electronics & Communication</option>
              <option>Electrical Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Civil Engineering</option>
              <option>Chemical Engineering</option>
            </optgroup>

            <optgroup label="Science">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
            </optgroup>

            <optgroup label="Commerce">
              <option>Accounting</option>
              <option>Finance</option>
              <option>Economics</option>
              <option>Business Management</option>
            </optgroup>

            <optgroup label="Skill Development">
              <option>Programming</option>
              <option>Web Development</option>
              <option>Mobile Development</option>
              <option>Cloud Computing</option>
              <option>Cyber Security</option>
              <option>Artificial Intelligence</option>
              <option>Machine Learning</option>
              <option>Data Science</option>
            </optgroup>

            <optgroup label="Career">
              <option>Aptitude</option>
              <option>Soft Skills</option>
              <option>Interview Preparation</option>
              <option>Communication Skills</option>
            </optgroup>

            <option value="Others">Others</option>
          </select>
        </div>

        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">Level</label>

          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border"
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
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-label-md font-label-md hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center gap-2"
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
            className="px-6 py-2.5 rounded-xl text-label-md font-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
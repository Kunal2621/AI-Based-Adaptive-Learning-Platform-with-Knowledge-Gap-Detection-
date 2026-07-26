import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();
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
    }
    
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 space-y-5"
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
          />
        </div>

        <div>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border"
            required
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
          <label>Level</label>

          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border"
            required
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
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-label-md font-label-md hover:bg-primary-container transition-colors"
          >
            Create Course
          </button>
          <button
            type="button"
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // FIXED: State models bind to true backend database keys directly
  const [form, setForm] = useState({
    name: "", 
    designation: "",
    subject: "",
    mobile: "",
    bio: ""
  });

  useEffect(() => {
    loadActiveFacultyData();
  }, []);

  const loadActiveFacultyData = async () => {
    try {
      const res = await API.get("/teacher/profile");
      const payload = res.data?.success !== undefined ? res.data : res;
      if (payload.data) {
        setForm({
          name: payload.data.name || "", // FIXED: Syncing database name key
          designation: payload.data.designation || "",
          subject: payload.data.subject || "",
          mobile: payload.data.mobile || "",
          bio: payload.data.bio || ""
        });
      }
    } catch (err) {
      console.error("Failed loading editor configurations profile:", err);
    }
  };

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfileChanges = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Backend controller targets PUT /api/teacher/profile payload
      await API.put("/teacher/profile", form);
      alert("Faculty identity configuration states synchronized successfully!");
      window.location.href= "/teacher/profile";
    } catch (err) {
      console.error("Error committing validation profile metadata edits:", err);
      alert("Failed updating instructor profile registry context.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Details</h1>

        <form onSubmit={saveProfileChanges} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Legal Name</label>
            {/* FIXED: name value pair handles mapped explicitly to match MongoDB structure */}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Enter comprehensive username matrix"
              className="w-full border border-gray-200 text-sm bg-white rounded-lg p-3 mt-1.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Designation Title</label>
              <input
                type="text"
                name="designation"
                value={form.designation}
                onChange={change}
                placeholder="Example: Senior Technical Lead"
                className="w-full border border-gray-200 text-sm bg-white rounded-lg p-3 mt-1.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Core Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={change}
                placeholder="Example: Fullstack Engineering"
                className="w-full border border-gray-200 text-sm bg-white rounded-lg p-3 mt-1.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={change}
              placeholder="Enter mobile number"
              className="w-full border border-gray-200 text-sm bg-white rounded-lg p-3 mt-1.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Biography Profile Statement</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={change}
              rows={4}
              placeholder="Compile detailed career summary records..."
              className="w-full border border-gray-200 text-sm bg-white rounded-lg p-3 mt-1.5 focus:ring-2 focus:ring-purple-600 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition disabled:bg-purple-300"
            >
              {loading ? "Synchronizing Storage Database..." : "Commit Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
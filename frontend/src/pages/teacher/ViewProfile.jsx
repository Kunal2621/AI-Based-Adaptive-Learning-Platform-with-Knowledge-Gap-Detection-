import { useEffect, useState } from "react";
import API from "../../services/api";

export default function ViewProfile() {
  // FIXED: Default initial identity property variables to ensure structure integrity
  const [teacher, setTeacher] = useState({
    name: "",
    designation: "",
    subject: "",
    email: "",
    mobile: "",
    rating: 5.0,
    bio: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileContext();
  }, []);

  const loadProfileContext = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teacher/profile");
      const payload = res.data?.success !== undefined ? res.data : res;

      if (payload.data) {
        setTeacher({
          name: payload.data.name || "Faculty Member", // FIXED: Pulls backend .name instead of broken fullName
          designation: payload.data.designation || "Not Specified",
          subject: payload.data.subject || "Not Specified",
          email: payload.data.email || "",
          mobile: payload.data.mobile || "Not Specified",
          rating: payload.data.rating || 5.0,
          bio: payload.data.bio || "No biography overview compiled yet."
        });
      }
    } catch (err) {
      console.error("Failed synchronizing teacher profile context parameters:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <p className="text-gray-500 text-sm animate-pulse">Loading Details.....</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-2">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h1 className="text-xl font-bold text-gray-800 border-b pb-3">
          Faculty Information 
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-3">
            {/* FIXED: Reading correct model schemas parameter variables labels */}
            <p><b>Instructor Name:</b> {teacher.name}</p>
            <p><b>Official Designation:</b> {teacher.designation}</p>
            <p><b>Core Department Subject:</b> {teacher.subject}</p>
          </div>

          <div className="space-y-3">
            <p className="truncate"><b>Email Address:</b> {teacher.email}</p>
            <p><b>Mobile Number:</b> {teacher.mobile}</p>
            <p><b>Platform Rating Score:</b> ⭐ {teacher.rating}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Detailed Biography Statement</h2>
          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
            {teacher.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
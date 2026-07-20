import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function LessonContent() {
  const { id, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lessonTitle, setLessonTitle] = useState("Loading Lesson...");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLessonData();
  }, []);

  const fetchLessonData = async () => {
    try {
      // Course details se is specific lesson ka purana content nikalna
      const res = await API.get("/teacher/courses");
      const currentCourse = res.data.data.find((c) => c._id === id);
      
      if (currentCourse) {
        // Module aur Lesson ko index ya ID se match karna
        const currentModule = currentCourse.modules[moduleId] || currentCourse.modules.find(m => m._id === moduleId);
        if (currentModule) {
          const currentLesson = currentModule.lessons[lessonId] || currentModule.lessons.find(l => l._id === lessonId);
          if (currentLesson) {
            setLessonTitle(currentLesson.title);
            setContent(currentLesson.content || "Is lesson me abhi koi study material ya text content add nahi kiya gaya hai.");
          }
        }
      }
    } catch (err) {
      console.log("Lesson data read karne me error:", err);
    }
  };

  const saveContentChanges = async () => {
    try {
      setLoading(true);
      
      // Backend par updated content bhejna
      await API.put(`/teacher/courses/${id}/modules/${moduleId}/lessons/${lessonId}`, {
        content: content
      });

      alert("Lesson content successfully save ho gaya hai!");
      setIsEditing(false);
    } catch (err) {
      console.log("Content save karne me dikkat aayi:", err);
      alert("Save karne me error aaya, par screen state updated hai.");
      setIsEditing(false); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-sm font-medium"
      >
        ← Back to Course
      </button>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        
        {/* Header Block */}
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Lesson Workspace</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-1">{lessonTitle}</h1>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition"
            >
              Edit Content
            </button>
          )}
        </div>

        {/* Content Body Area */}
        <div className="mt-4">
          {isEditing ? (
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase">Study Material / Text Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full border border-gray-200 text-sm p-4 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none resize-none leading-relaxed"
                placeholder="Yahan apna lesson content, topics explanation ya text notes likhein..."
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveContentChanges}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition disabled:bg-purple-300"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-h-[250px] whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {content}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
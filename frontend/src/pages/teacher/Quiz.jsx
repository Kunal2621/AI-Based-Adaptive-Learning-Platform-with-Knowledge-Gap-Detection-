import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function Quiz() {
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState([]);
  const [courses, setCourses] = useState([]);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuiz();
    fetchCourses();
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await API.get("/quiz");
      setQuiz(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/course");
      setCourses(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const generateAIQuiz = async (e) => {
    e.preventDefault();

    if (!title || !course || !topic) {
      return alert("Please fill all fields.");
    }

    try {
      setLoading(true);

      const body = {
        title,
        description: "",
        course,
        questions: [
          {
            question: topic,
          },
        ],
      };

      const res = await API.post("/quiz", body);

      alert(res.data.message);

      setTitle("");
      setCourse("");
      setTopic("");

      fetchQuiz();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Quiz generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* AI Generator Card */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">
          Generate AI Quiz
        </h2>

        <form
          onSubmit={generateAIQuiz}
          className="space-y-5"
        >

          <div>

            <label className="font-medium">
              Quiz Title
            </label>

            <input
              type="text"
              placeholder="Enter quiz title"
              className="w-full border rounded-lg p-3 mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

          </div>

          <div>

            <label className="font-medium">
              Select Course
            </label>

            <select
              className="w-full border rounded-lg p-3 mt-2"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >

              <option value="">
                Select Course
              </option>

              {courses.map((c) => (
                <option
                  key={c._id}
                  value={c._id}
                >
                  {c.title}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="font-medium">
              Topic
            </label>

            <input
              type="text"
              placeholder="Example : React Hooks, Operating System, DBMS Joins..."
              className="w-full border rounded-lg p-3 mt-2"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            {loading ? "Generating AI Quiz..." : "Generate Quiz"}
          </button>

        </form>

      </div>

      {/* Quiz List */}

      <div className="bg-white rounded-xl shadow">

        <div className="p-5 border-b">

          <h2 className="text-2xl font-bold">
            Generated Quizzes
          </h2>

        </div>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="p-4 text-left">
                Title
              </th>

              <th className="text-left">
                Topic
              </th>

              <th className="text-left">
                Questions
              </th>

            </tr>

          </thead>

          <tbody>

            {quiz.map((q) => (

              <tr
                key={q._id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">
                  {q.title}
                </td>

                <td>
                  {q.topic}
                </td>

                <td>
                  {q.questions.length}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
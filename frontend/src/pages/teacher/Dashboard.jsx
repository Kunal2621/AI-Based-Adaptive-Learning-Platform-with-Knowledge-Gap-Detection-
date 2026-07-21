import { useEffect, useState } from 'react';
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import ProgressChart from "../../components/dashboard/ProgressChart";
import ProgressBar from "../../components/dashboard/ProgressBar";
import Badge from "../../components/dashboard/Badge";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    completion: 0,
  });

  const [teacherName, setTeacherName] = useState("");
  const [recentCourses, setRecentCourses] = useState([]);
  
  // 🟢 Pure Real-Time Chart Data State (Initial Khali)
  const [realChartData, setRealChartData] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchCourses();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get("/teacher/dashboard");

      setStats({
        totalCourses: data.totalCourses || 0,
        totalStudents: data.totalStudents || 0,
        totalQuizzes: data.totalQuizzes || 0,
        completion: data.completion || 0,
      });

      // Real Teacher Name
      setTeacherName(data.teacherName);

      // 🟢 Real-time Chart Data set kar rahe hain backend response se
      if (data.weeklyProgress) {
        setRealChartData(data.weeklyProgress);
      }
    } catch (err) {
      console.log("Error fetching dashboard:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/teacher/courses");
      const coursesList = res.data?.data || [];
      setRecentCourses(coursesList.slice(0, 3));
    } catch (err) {
      console.log("Error fetching courses:", err);
    }
  };

  const STATS = [
    {
      id: "courses",
      label: "Courses",
      value: stats.totalCourses,
      valueClassName: "text-primary",
      path: "/teacher/courses",
    },
    {
      id: "students",
      label: "Students",
      value: stats.totalStudents,
      valueClassName: "text-green-600",
      path: "/teacher/students",
    },
    {
      id: "quizzes",
      label: "Quizzes",
      value: stats.totalQuizzes,
      valueClassName: "text-red-500",
      path: "/teacher/quiz",
    },
    {
      id: "completion",
      label: "Completion",
      value: `${stats.completion}%`,
      valueClassName: "text-secondary",
      path: "/teacher/analytics",
    },
  ];

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="primary-gradient rounded-xl px-6 sm:px-8 py-7 sm:py-8 text-white">
        <p className="text-label-sm tracking-wider opacity-80 mb-2">WELCOME BACK</p>
        <h1 className="text-headline-lg-mobile sm:text-headline-lg font-bold mb-2">
          Hello, {teacherName || "Professor"}!
        </h1>
        <p className="text-body-md opacity-90 mb-4 whitespace-nowrap">
          Manage courses and track student performance.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate("/teacher/courses/create")}
            className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2 text-label-sm font-bold hover:bg-white/30 transition-colors"
          >
            Create Course
          </button>
          <button
            onClick={() => navigate("/teacher/analytics")}
            className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2 text-label-sm font-bold hover:bg-white/30 transition-colors"
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ id, label, value, valueClassName, path }) => (
          <StatCard
            key={id}
            label={label}
            value={value}
            valueClassName={valueClassName}
            onClick={() => navigate(path)}
          />
        ))}
      </div>

      {/* 🟢 Real-time Learning Progress Chart */}
      <ProgressChart data={realChartData} title="Learning Progress" />

      {/* Recent courses */}
      <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-bold text-on-surface">Recent Courses</h2>
          <button
            onClick={() => navigate("/teacher/courses")}
            className="text-label-sm font-bold text-primary hover:text-primary-container transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="space-y-3">
          {recentCourses.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">No recent courses created yet.</p>
          ) : (
            recentCourses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/teacher/courses/${course._id}`)}
                className="flex items-center gap-3 py-2 border-b border-black/5 last:border-0 cursor-pointer hover:bg-black/5 px-2 rounded-lg transition-colors"
              >
                <span className="text-label-md font-medium text-on-surface w-32 sm:w-40 flex-shrink-0 truncate">
                  {course.title}
                </span>
                <ProgressBar value={100} color="#7c3aed" compact />
                <span
                  className="text-label-sm font-bold w-10 text-right flex-shrink-0"
                  style={{ color: "#7c3aed" }}
                >
                  100%
                </span>
                <Badge status="Active" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Loader from "../../components/common/Loader";
import QuizCard from "../../components/quiz/QuizCard";
import QuizQuestion from "../../components/quiz/QuizQuestion";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores { [questionId]: optionIndex }
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const timerRef = useRef(null);

  // 1. Fetch Quiz Details
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    API.get(`/quizzes/${id}`)
      .then((r) => {
        // Fallback for different backend response wrappers
        const fetchedQuiz = r.data?.data || r.data?.quiz || r.data;
        if (fetchedQuiz && (fetchedQuiz._id || fetchedQuiz.id)) {
          setQuiz(fetchedQuiz);
          if (fetchedQuiz.timeLimit) {
            setTimeLeft(fetchedQuiz.timeLimit * 60);
          }
        } else {
          setQuiz(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching quiz:", err);
        setQuiz(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 2. Timer Countdown Logic
  useEffect(() => {
    if (started && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            doSubmit(true); // Auto-submit when time expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [started, timeLeft]);

  // Handle Start Quiz
  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  // 🟢 CRITICAL FIX: Store Option Index (0, 1, 2) instead of Raw Text String
  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // 3. Quiz Submission
  const doSubmit = async (auto = false) => {
    if (submitting) return;

    if (!auto && !window.confirm("Are you sure you want to submit your quiz?")) {
      return;
    }

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    try {
      // POST answers object { questionId: optionIndex }
      const res = await API.post(`/quizzes/submit/${id}`, {
        answers,
        timeTaken,
      });

      const submissionData = res.data?.data || res.data?.submission || res.data;

      if (submissionData && (submissionData._id || submissionData.id)) {
        const subId = submissionData._id || submissionData.id;
        navigate(`/student/results/${subId}`);
      } else {
        navigate("/student/results");
      }
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Error running quiz submission engine. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen={false} />;

  if (!quiz) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-gray-500 font-semibold">Quiz Not Found</p>
        <button
          onClick={() => navigate("/student/courses")}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];

  // Render Start Screen (Pre-Quiz Instructions)
  if (!started) {
    return (
      <QuizCard
        quiz={quiz}
        questions={questions}
        onStart={handleStart}
        mode="start"
      />
    );
  }

  const formatTime = (seconds) => {
    if (seconds === null) return "No limit";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Top Navigation & Timer Bar */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between bg-white border border-outline-variant/40 shadow-sm">
        <div>
          <h1 className="font-bold text-base md:text-lg text-on-surface truncate max-w-xs md:max-w-md">
            {quiz.title}
          </h1>
          <p className="text-xs text-on-surface-variant">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        {timeLeft !== null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold">
            <span className="material-symbols-outlined text-sm">timer</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Active Question Component */}
      {currentQuestion && (
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={answers[currentQuestion._id] !== undefined ? answers[currentQuestion._id] : answers[currentIndex]}
          onAnswer={handleAnswer}
        />
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="px-5 py-2.5 bg-white border border-outline-variant text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="px-6 py-2.5 primary-gradient text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => doSubmit(false)}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Quiz ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
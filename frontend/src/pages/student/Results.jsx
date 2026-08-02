import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import Loader from "../../components/common/Loader";

/* ── Result detail for a single attempt ── */
function ResultDetail({ id }) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic Fallback API calls for detailed attempt fetch
    API.get(`/quizzes/attempts/${id}`)
      .catch(() => API.get(`/student/results/${id}`))
      .catch(() => API.get(`/submissions/${id}`))
      .then((r) => setAttempt(r.data?.data || r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen={false} />;
  if (!attempt)
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <p className="text-lg font-semibold">Result details not found</p>
        <Link to="/student/results" className="text-primary text-sm font-bold mt-2 inline-block">
          ← Back to All Results
        </Link>
      </div>
    );

  // 🟢 SAFE CALCULATIONS (Fixes 0% & blank cards issue)
  const answersArr = attempt.answers || [];
  const totalQuestions =
    attempt.totalQuestions ||
    answersArr.length ||
    attempt.quiz?.questions?.length ||
    0;

  // Auto-calculate correct count if DB score is 0 or unpopulated
  const computedCorrect = answersArr.length > 0
    ? answersArr.filter((a) => a.isCorrect).length
    : (attempt.score || 0);

  const correct = attempt.correct !== undefined ? attempt.correct : computedCorrect;
  const incorrect = attempt.incorrect !== undefined
    ? attempt.incorrect
    : Math.max(0, totalQuestions - correct);
  const skipped = attempt.skipped !== undefined
    ? attempt.skipped
    : Math.max(0, totalQuestions - (correct + incorrect));

  const scorePercent =
    attempt.percentage !== undefined && attempt.percentage > 0
      ? attempt.percentage
      : totalQuestions > 0
      ? Math.round((correct / totalQuestions) * 100)
      : 0;

  const quiz = attempt.quiz || { title: attempt.quizTitle || "Quiz Result" };
  const topicScores = attempt.topicScores || [];
  const timeTaken = attempt.timeTaken || 0;

  const geminiAnalysis =
    attempt.geminiAnalysis ||
    (attempt.knowledgeGapFeedback
      ? { overallStrength: attempt.knowledgeGapFeedback }
      : null);

  const grade =
    scorePercent >= 90
      ? { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50", icon: "workspace_premium" }
      : scorePercent >= 75
      ? { label: "Great", color: "text-green-600", bg: "bg-green-50", icon: "star" }
      : scorePercent >= 50
      ? { label: "Good", color: "text-amber-600", bg: "bg-amber-50", icon: "thumb_up" }
      : { label: "Needs Work", color: "text-red-500", bg: "bg-red-50", icon: "refresh" };

  const fmt = (s) => (s ? `${Math.floor(s / 60)}m ${s % 60}s` : "—");

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/student/results"
          className="w-9 h-9 flex items-center justify-center bg-white border border-outline-variant rounded-xl hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-bold text-lg text-on-surface">{quiz?.title}</h1>
          <p className="text-xs text-on-surface-variant">
            {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString("en-IN") : "Recent"}
          </p>
        </div>
      </div>

      {/* Main Score Banner */}
      <div className="primary-gradient rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-md">
        <div
          className="blob-animation"
          style={{ width: 200, height: 200, top: -60, right: -60, opacity: 0.15 }}
        />
        <div className={`w-20 h-20 ${grade.bg} rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner`}>
          <span
            className={`material-symbols-outlined text-4xl ${grade.color}`}
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {grade.icon}
          </span>
        </div>
        <p className="text-5xl font-black">{scorePercent}%</p>
        <p className="text-white/90 font-semibold mt-1">{grade.label}</p>
        <p className="text-white/70 text-xs mt-2">Time taken: {fmt(timeTaken)}</p>
      </div>

      {/* Stats Breakdown Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Correct", val: correct, color: "text-green-600", bg: "bg-green-50", icon: "check_circle" },
          { label: "Incorrect", val: incorrect, color: "text-red-500", bg: "bg-red-50", icon: "cancel" },
          { label: "Skipped", val: skipped, color: "text-amber-500", bg: "bg-amber-50", icon: "remove_circle" },
        ].map((s) => (
          <div key={s.label} className={`glass-card rounded-xl p-4 text-center border border-outline-variant/30 ${s.bg}`}>
            <span
              className={`material-symbols-outlined text-2xl ${s.color}`}
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {s.icon}
            </span>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.val}</p>
            <p className="text-xs text-on-surface-variant font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Topic Breakdown */}
      {topicScores?.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-outline-variant/30">
          <h2 className="font-semibold text-sm mb-4 text-on-surface">Topic-wise Performance</h2>
          <div className="space-y-3">
            {topicScores.map((ts, i) => {
              const pct = ts.total > 0 ? Math.round((ts.score / ts.total) * 100) : 0;
              const col = pct >= 75 ? "#16a34a" : pct >= 50 ? "#d97706" : "#ef4444";
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-on-surface">{ts.topic}</span>
                    <span className="font-bold" style={{ color: col }}>
                      {ts.score}/{ts.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-surface-dim rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: col }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Feedback / Analysis */}
      {geminiAnalysis && (
        <div className="glass-card rounded-2xl p-5 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              auto_awesome
            </span>
            <h2 className="font-bold text-sm text-on-surface">AI Adaptive Feedback</h2>
            <span className="ml-auto text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
              AI Powered
            </span>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            {geminiAnalysis.overallStrength || geminiAnalysis}
          </p>

          {geminiAnalysis.gaps?.length > 0 && (
            <div className="space-y-3 mt-4">
              {geminiAnalysis.gaps.map((g, i) => {
                const sev =
                  { high: "bg-red-50 border-red-200", medium: "bg-amber-50 border-amber-200", low: "bg-blue-50 border-blue-200" }[g.severity] || "bg-surface-container";
                const sevColor =
                  { high: "text-red-600", medium: "text-amber-600", low: "text-blue-600" }[g.severity] || "";
                return (
                  <div key={i} className={`border rounded-xl p-4 ${sev}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-on-surface">{g.topic}</p>
                      <span className={`text-[10px] font-bold uppercase ${sevColor}`}>
                        {g.severity} priority
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">{g.description}</p>
                    {g.recommendations?.map((r, j) => (
                      <p key={j} className="text-xs flex items-start gap-1.5 mt-1 text-on-surface">
                        <span className="material-symbols-outlined text-xs mt-0.5 text-primary">
                          arrow_right
                        </span>
                        {r}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-3 pt-2">
        <Link
          to="/student/recommendations"
          className="flex-1 py-3 primary-gradient text-white text-sm font-bold rounded-xl text-center hover:opacity-90 transition-opacity"
        >
          View Recommendations
        </Link>
        <Link
          to="/student/courses"
          className="flex-1 py-3 bg-white border border-outline-variant text-on-surface text-sm font-semibold rounded-xl text-center hover:bg-surface-container transition-colors"
        >
          Back to Courses
        </Link>
      </div>
    </div>
  );
}

/* ── All results list ── */
function AllResults() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Multi-route fallback for listing all student attempts
    API.get("/quizzes/my-results")
      .catch(() => API.get("/student/results"))
      .catch(() => API.get("/submissions"))
      .then((r) => {
        const data = r.data?.data || r.data?.submissions || r.data || [];
        setAttempts(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen={false} />;

  return (
    <div className="p-5 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Quiz Results</h1>
        <p className="text-sm text-on-surface-variant">All your quiz attempts and scores</p>
      </div>

      {!attempts.length ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-outline">quiz</span>
          <p className="mt-2 text-on-surface-variant text-sm">No quiz attempts found</p>
          <Link
            to="/student/courses"
            className="inline-block mt-4 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => {
            const answersArr = a.answers || [];
            const totalQ = a.totalQuestions || answersArr.length || a.quiz?.questions?.length || 0;
            const computedCorrect = answersArr.length > 0 ? answersArr.filter((x) => x.isCorrect).length : (a.score || 0);

            const correct = a.correct !== undefined ? a.correct : computedCorrect;
            const scorePercent =
              a.percentage !== undefined && a.percentage > 0
                ? a.percentage
                : totalQ > 0
                ? Math.round((correct / totalQ) * 100)
                : 0;

            const incorrect = a.incorrect !== undefined ? a.incorrect : Math.max(0, totalQ - correct);
            const skipped = a.skipped || 0;

            const col =
              scorePercent >= 75
                ? "text-green-600 bg-green-50"
                : scorePercent >= 50
                ? "text-amber-600 bg-amber-50"
                : "text-red-500 bg-red-50";

            return (
              <Link
                key={a._id}
                to={`/student/results/${a._id}`}
                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow border border-outline-variant/30"
              >
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${col.split(" ")[1]}`}>
                  <span className={`text-base font-black leading-none ${col.split(" ")[0]}`}>
                    {scorePercent}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-on-surface">
                    {a.quiz?.title || a.quizTitle || "Quiz Attempt"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {a.course?.title || a.quiz?.topic || "General"}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                    <span className="text-green-600">✓ {correct}</span>
                    <span className="text-red-500">✗ {incorrect}</span>
                    {skipped > 0 && <span className="text-amber-600">— {skipped} skipped</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-on-surface-variant">
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : "Recent"}
                  </p>
                  <span className="material-symbols-outlined text-outline text-base mt-1">
                    chevron_right
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Router Component ── */
export default function Results() {
  const { id } = useParams();
  return id ? <ResultDetail id={id} /> : <AllResults />;
}
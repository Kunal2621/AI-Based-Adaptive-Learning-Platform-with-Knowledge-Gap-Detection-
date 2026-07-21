import { Link } from "react-router-dom";

/**
 * QuizCard — two modes:
 *
 * mode="start"   – pre-quiz info screen (default)
 *   Props: quiz, questions, onStart
 *
 * mode="list"    – compact card shown in quiz listing
 *   Props: quiz, attempted, courseTitle
 */
export default function QuizCard({ quiz, questions = [], onStart, mode = "start", attempted, courseTitle }) {

  /* ── LIST CARD ── */
  if (mode === "list") {
    return (
      <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            attempted ? "bg-green-100" : "bg-violet-100"
          }`}
        >
          <span
            className={`material-symbols-outlined text-xl ${
              attempted ? "text-green-600" : "text-violet-600"
            }`}
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {attempted ? "check_circle" : "quiz"}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className="font-semibold text-sm flex-1 truncate">{quiz.title}</p>
            {attempted && (
              <span className="flex-shrink-0 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                DONE
              </span>
            )}
          </div>
          {courseTitle && (
            <p className="text-xs text-on-surface-variant mt-0.5">{courseTitle}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">help_outline</span>
              {quiz.questions?.length || 0} questions
            </span>
            {quiz.timeLimit && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">timer</span>
                {quiz.timeLimit} min
              </span>
            )}
            {quiz.totalMarks > 0 && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">stars</span>
                {quiz.totalMarks} marks
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/student/quiz/${quiz._id}`}
          className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
            attempted
              ? "bg-surface-container text-on-surface hover:bg-primary/10"
              : "primary-gradient text-white hover:opacity-90"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {attempted ? "replay" : "play_arrow"}
          </span>
          {attempted ? "Retake" : "Start Quiz"}
        </Link>
      </div>
    );
  }

  /* ── START SCREEN ── */
  const stats = [
    { icon: "help_outline",        label: "Questions",   val: questions.length },
    { icon: "timer",               label: "Time Limit",  val: quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit" },
    { icon: "stars",               label: "Total Marks", val: quiz.totalMarks || questions.length },
    { icon: "percent",             label: "Passing",     val: "50%" },
  ];

  const instructions = [
    "Read each question carefully before selecting",
    "You can navigate freely between questions",
    quiz.timeLimit && "Timer starts immediately after you click Start",
    "Confirm your answers before final submission",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">

        {/* Icon */}
        <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <span
            className="material-symbols-outlined text-white text-3xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            quiz
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-on-surface">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface-container rounded-xl p-3 text-center">
              <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
              <p className="text-lg font-bold mt-1 text-on-surface">{s.val}</p>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: '"FILL" 1' }}>info</span>
            Before you start:
          </p>
          {instructions.map((t, i) => (
            <p key={i} className="text-xs text-amber-700 flex items-start gap-2">
              <span
                className="material-symbols-outlined text-xs mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                check_circle
              </span>
              {t}
            </p>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Link
            to="/student/quiz"
            className="flex-1 py-3 bg-white border border-outline-variant text-on-surface-variant text-sm font-semibold rounded-xl hover:bg-surface-container transition-colors text-center"
          >
            ← Back
          </Link>
          <button
            onClick={onStart}
            className="flex-1 py-3 primary-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

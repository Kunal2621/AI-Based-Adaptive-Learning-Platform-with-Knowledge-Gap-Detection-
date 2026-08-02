import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Loader from "../../components/common/Loader";

const PRIORITY_CONFIG = {
  high:   { bg: "bg-red-50",    border: "border-red-100",    badge: "bg-red-100 text-red-600",    dot: "bg-red-500"  },
  medium: { bg: "bg-amber-50",  border: "border-amber-100",  badge: "bg-amber-100 text-amber-600", dot: "bg-amber-500" },
  low:    { bg: "bg-blue-50",   border: "border-blue-100",   badge: "bg-blue-100 text-blue-600",   dot: "bg-blue-400" },
};

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  // 🟢 Interactive Study Material States
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    API.get("/recommendations/my")
      .then((r) => setRecs(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 🟢 Trigger Live Flashcard Generation
  const handleGenerateMaterial = async (topic) => {
    try {
      setSelectedTopic(topic);
      setStudyMaterial(null);
      setLoadingMaterial(true);
      setCurrentFlashcardIdx(0);
      setIsFlipped(false);

      const res = await API.post("/recommendations/generate", { topic });
      setStudyMaterial(res.data?.data || null);
    } catch (err) {
      console.error("Error generating study material:", err);
      alert(err.response?.data?.message || "Failed to generate study assets.");
      setSelectedTopic(null);
    } finally {
      setLoadingMaterial(false);
    }
  };

  if (loading) return <Loader fullScreen={false} />;

  if (!recs.length) {
    return (
      <div className="p-5 md:p-6">
        <h1 className="text-xl font-bold">AI Recommendations</h1>
        <div className="mt-12 text-center space-y-4">
          <div className="w-20 h-20 primary-gradient/10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              auto_awesome
            </span>
          </div>
          <p className="font-semibold">No recommendations yet</p>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Take a quiz first — our AI will analyze your performance and generate personalized learning recommendations.
          </p>
          <Link
            to="/student/courses"
            className="inline-block px-5 py-2.5 primary-gradient text-white text-sm font-semibold rounded-xl"
          >
            Start Learning
          </Link>
        </div>
      </div>
    );
  }

  const current = recs[active];
  const allWeakTopics = [...new Set(recs.flatMap((r) => r.weakTopics || []))];

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="primary-gradient rounded-2xl p-5 text-white relative overflow-hidden shadow-md">
        <div className="blob-animation" style={{ width: 200, height: 200, top: -60, right: -40, opacity: 0.15 }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
              auto_awesome
            </span>
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
              Powered by Gemini AI
            </span>
          </div>
          <h1 className="text-xl font-bold">Your Learning Roadmap</h1>
          <p className="text-white/80 text-sm mt-1">Personalized based on your quiz performance</p>
          <div className="flex gap-4 mt-4 text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">psychology</span>
              {allWeakTopics.length} gaps detected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">lightbulb</span>
              {recs.reduce((s, r) => s + (r.recommendations?.length || 0), 0)} suggestions
            </span>
          </div>
        </div>
      </div>

      {/* Weak topics pills */}
      {allWeakTopics.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-outline-variant/30">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2 text-on-surface">
            <span
              className="material-symbols-outlined text-red-500 text-base"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              warning
            </span>
            Knowledge Gaps Identified
          </h2>
          <div className="flex flex-wrap gap-2">
            {allWeakTopics.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Session picker */}
      {recs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {recs.map((r, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                active === i
                  ? "bg-primary text-white"
                  : "bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              Session {i + 1} · {new Date(r.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </button>
          ))}
        </div>
      )}

      {/* Action Plan Cards */}
      <div className="space-y-4">
        <h2 className="font-semibold text-sm text-on-surface">Action Plan & Remediation</h2>
        {current?.recommendations?.map((rec, i) => {
          const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
          return (
            <div key={i} className={`border rounded-2xl p-5 ${cfg.bg} ${cfg.border} space-y-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                  <h3 className="font-bold text-sm text-on-surface">{rec.topic}</h3>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>
                  {rec.priority} priority
                </span>
              </div>

              <p className="text-sm text-on-surface-variant ml-5 leading-relaxed">{rec.suggestion}</p>

              {rec.resources?.length > 0 && (
                <div className="ml-5 space-y-1.5">
                  <p className="text-xs font-semibold text-on-surface-variant">Suggested Resources:</p>
                  {rec.resources.map((r, j) => (
                    <p key={j} className="text-xs flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs text-primary mt-0.5">bookmark</span>
                      {r}
                    </p>
                  ))}
                </div>
              )}

              {/* 🟢 Interactive Flashcard Generation Trigger */}
              <div className="ml-5 pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerateMaterial(rec.topic)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">style</span>
                  <span>Practice AI Flashcards & Study Notes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Study Plan */}
      {current?.studyPlan && (
        <div className="glass-card rounded-2xl p-5 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
              calendar_month
            </span>
            <h2 className="font-bold text-sm text-on-surface">AI Diagnostic Study Plan</h2>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-primary/10">
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">{current.studyPlan}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Link
          to="/student/chatbot"
          className="flex-1 py-3 primary-gradient text-white text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-base">smart_toy</span>
          Ask AI Tutor
        </Link>
        <Link
          to="/student/courses"
          className="flex-1 py-3 bg-white border border-outline-variant text-on-surface text-sm font-semibold rounded-xl text-center hover:bg-surface-container transition-colors"
        >
          Browse Courses
        </Link>
      </div>

      {/* 🟢 FLASHCARDS & STUDY NOTES MODAL */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-purple-100 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">AI Remediation Asset</span>
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{selectedTopic}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {loadingMaterial ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-gray-700">Gemini AI compiling flashcards & study notes...</p>
                <p className="text-xs text-gray-400">Crafting targeted technical scenarios for fast retention.</p>
              </div>
            ) : studyMaterial ? (
              <div className="space-y-6">
                {/* Core Study Notes */}
                {studyMaterial.studyNotes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                    <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-purple-600">description</span>
                      Core Revision Rules
                    </h3>
                    <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-medium">
                      {studyMaterial.studyNotes}
                    </div>
                  </div>
                )}

                {/* Interactive Flashcards Deck */}
                {studyMaterial.flashcards?.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                      <span>Interactive Flashcard Deck</span>
                      <span>Card {currentFlashcardIdx + 1} of {studyMaterial.flashcards.length}</span>
                    </div>

                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`cursor-pointer min-h-[200px] p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between shadow-sm ${
                        isFlipped
                          ? "bg-purple-900 border-purple-800 text-white"
                          : "bg-purple-50/60 border-purple-200 hover:border-purple-400 text-purple-950"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold opacity-75">
                        <span>{isFlipped ? "ANSWER / RESOLUTION" : "QUESTION / SCENARIO"}</span>
                        <span className="material-symbols-outlined text-sm">cached</span>
                      </div>

                      <div className="text-center py-6">
                        <p className={`text-base md:text-lg font-bold leading-relaxed ${isFlipped ? "text-purple-100" : "text-gray-900"}`}>
                          {isFlipped
                            ? studyMaterial.flashcards[currentFlashcardIdx].back
                            : studyMaterial.flashcards[currentFlashcardIdx].front}
                        </p>
                      </div>

                      <p className="text-center text-[11px] opacity-60 font-medium">
                        Click card to flip ({isFlipped ? "Show Question" : "Show Answer"})
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={currentFlashcardIdx === 0}
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIdx((prev) => prev - 1);
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ← Previous Card
                      </button>

                      <button
                        type="button"
                        disabled={currentFlashcardIdx === studyMaterial.flashcards.length - 1}
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentFlashcardIdx((prev) => prev + 1);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next Card →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
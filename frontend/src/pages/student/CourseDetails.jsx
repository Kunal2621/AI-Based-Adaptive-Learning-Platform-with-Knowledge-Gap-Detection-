import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import Loader from "../../components/common/Loader";

export default function CourseDetails() {
  const { id } = useParams();
  const [course,   setCourse]   = useState(null);
  const [quizzes,  setQuizzes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("materials");
  const [expanded, setExpanded] = useState(0);

  useEffect(() => {
    Promise.all([
      API.get(`/courses/${id}`),
      API.get(`/quizzes?courseId=${id}`),
    ]).then(([cRes, qRes]) => {
      setCourse(cRes.data.data);
      setQuizzes(qRes.data.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen={false} />;
  if (!course)  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <span className="material-symbols-outlined text-5xl text-outline">error_outline</span>
      <p className="text-on-surface-variant mt-2">Course not found</p>
    </div>
  );

  const tabs = [
    { id: "materials", icon: "description",  label: "Study Materials" },
    { id: "quizzes",   icon: "quiz",         label: `Quizzes (${quizzes.length})` },
    { id: "videos",    icon: "play_circle",  label: "Video Lectures" },
  ];

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Header card */}
      <div className="primary-gradient rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="blob-animation" style={{ width: 200, height: 200, top: -50, right: -50, opacity: 0.2 }} />
        <Link to="/student/courses" className="flex items-center gap-1 text-white/70 text-xs mb-4 hover:text-white w-fit">
          <span className="material-symbols-outlined text-base">arrow_back</span> Back to Courses
        </Link>
        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{course.subject || "Course"}</span>
        <h1 className="text-xl font-bold mt-2">{course.title}</h1>
        <p className="text-white/70 text-sm mt-1 leading-relaxed">{course.description}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/80">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">person</span>
            {course.teacher?.fullName || "Instructor"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">layers</span>
            {course.topics?.length || 0} Topics
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">quiz</span>
            {quizzes.length} Quizzes
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span>Course Progress</span>
          <span className="text-primary">{course.progress ?? 0}%</span>
        </div>
        <div className="h-2 bg-surface-dim rounded-full overflow-hidden">
          <div className="h-full primary-gradient rounded-full transition-all duration-700"
            style={{ width: `${course.progress ?? 0}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? "bg-primary text-white" : "bg-white border border-outline-variant text-on-surface-variant hover:border-primary/50"
            }`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Materials ── */}
      {tab === "materials" && (
        <div className="space-y-3">
          {!course.topics?.length ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline">folder_open</span>
              <p className="text-on-surface-variant text-sm mt-2">No materials uploaded yet</p>
            </div>
          ) : course.topics.map((topic, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === i ? -1 : i)}
                className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="font-semibold text-sm">{topic.title || topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  {topic.materials?.length > 0 && (
                    <span className="text-xs text-on-surface-variant">{topic.materials.length} files</span>
                  )}
                  <span className={`material-symbols-outlined text-outline transition-transform ${expanded === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </div>
              </button>
              {expanded === i && (
                <div className="px-4 pb-4 border-t border-outline-variant/20 space-y-2 pt-3">
                  {!topic.materials?.length ? (
                    <p className="text-xs text-on-surface-variant">No materials for this topic yet.</p>
                  ) : topic.materials.map((m, j) => {
                    const cfg = {
                      pdf:   { icon: "picture_as_pdf", color: "text-red-500",   bg: "bg-red-50" },
                      video: { icon: "play_circle",    color: "text-blue-500",  bg: "bg-blue-50" },
                      link:  { icon: "link",           color: "text-green-600", bg: "bg-green-50" },
                      ppt:   { icon: "slideshow",      color: "text-orange-500",bg: "bg-orange-50" },
                      note:  { icon: "description",    color: "text-primary",   bg: "bg-primary/10" },
                    }[m.type] || { icon: "attachment", color: "text-outline", bg: "bg-surface-container" };

                    // Lessons written by the teacher are plain text notes (no
                    // file/URL), so render them inline instead of as a link.
                    if (m.type === "note" || !m.url) {
                      return (
                        <div key={j} className="flex items-start gap-3 p-3 bg-surface-container rounded-xl">
                          <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                            <span className={`material-symbols-outlined text-lg ${cfg.color}`}
                              style={{ fontVariationSettings: '"FILL" 1' }}>{cfg.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{m.title}</p>
                            {m.content && (
                              <p className="text-xs text-on-surface-variant mt-1 whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <a key={j} href={m.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-primary/5 transition-colors group">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <span className={`material-symbols-outlined text-lg ${cfg.color}`}
                            style={{ fontVariationSettings: '"FILL" 1' }}>{cfg.icon}</span>
                        </div>
                        <span className="text-sm flex-1">{m.title}</span>
                        <span className="material-symbols-outlined text-outline text-sm group-hover:text-primary transition-colors">open_in_new</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Quizzes ── */}
      {tab === "quizzes" && (
        <div className="space-y-3">
          {!quizzes.length ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline">quiz</span>
              <p className="text-on-surface-variant text-sm mt-2">No quizzes available yet</p>
            </div>
          ) : quizzes.map(q => (
            <div key={q._id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-violet-600"
                    style={{ fontVariationSettings: '"FILL" 1' }}>quiz</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{q.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-on-surface-variant">
                    <span>{q.questions?.length || 0} questions</span>
                    {q.timeLimit && <span>· {q.timeLimit} mins</span>}
                    {q.attempted && (
                      <span className="text-green-600 font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">check_circle</span> Attempted
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link to={`/student/quiz/${q._id}`}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl text-center whitespace-nowrap ${
                  q.attempted ? "bg-surface-container text-on-surface" : "bg-primary text-white hover:bg-primary/90"
                } transition-colors`}>
                {q.attempted ? "Retake Quiz" : "Start Quiz"}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── Videos ── */}
      {tab === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!course.videos?.length ? (
            <div className="col-span-2 text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline">videocam_off</span>
              <p className="text-on-surface-variant text-sm mt-2">No video lectures added yet</p>
            </div>
          ) : course.videos.map((v, i) => (
            <a key={i} href={v.url} target="_blank" rel="noreferrer"
              className="glass-card rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-5xl text-primary/40 group-hover:text-primary transition-colors"
                  style={{ fontVariationSettings: '"FILL" 1' }}>play_circle</span>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm">{v.title}</p>
                {v.duration && <p className="text-xs text-on-surface-variant mt-0.5">{v.duration}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
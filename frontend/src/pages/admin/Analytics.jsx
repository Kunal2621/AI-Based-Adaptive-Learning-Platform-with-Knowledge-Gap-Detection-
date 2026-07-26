// src/pages/admin/Analytics.jsx
// ============================================================
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminService from "../../services/adminService";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6 text-on-surface-variant text-sm">Loading analytics...</div>;
  if (error) return <div className="p-6 text-error text-sm">{error}</div>;

  const { userGrowth = [], globalKnowledgeGaps = [] } = analytics;
  const maxGrowth = Math.max(...userGrowth.map((g) => g.count), 1);
  const maxGap = Math.max(...globalKnowledgeGaps.map((g) => g.count), 1);

  return (
    <div className="p-3 md:p-4 max-w-6xl mx-auto space-y-5">
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-on-surface">
        Analytics
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="glass-card rounded-2xl border border-black/5 p-6"
      >
        <h2 className="font-semibold text-on-surface mb-1">User Growth</h2>
        <p className="text-xs text-on-surface-variant mb-4">Monthly signups</p>
        {userGrowth.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No registration data yet.</p>
        ) : (
          <div className="space-y-3">
            {userGrowth.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <span className="w-10 text-xs text-on-surface-variant shrink-0">{MONTH_NAMES[m._id]}</span>
                <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(m.count / maxGrowth) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-xs font-bold text-on-surface text-right shrink-0">{m.count}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl border border-black/5 p-6"
      >
        <h2 className="font-semibold text-on-surface mb-1">Top Platform-Wide Knowledge Gaps</h2>
        <p className="text-xs text-on-surface-variant mb-4">Where students struggle most</p>
        {globalKnowledgeGaps.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No knowledge gap data yet.</p>
        ) : (
          <div className="space-y-3">
            {globalKnowledgeGaps.map((gap, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-40 text-xs text-on-surface truncate shrink-0">{gap._id}</span>
                <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-error transition-all duration-500"
                    style={{ width: `${(gap.count / maxGap) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-xs font-bold text-on-surface text-right shrink-0">{gap.count}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}


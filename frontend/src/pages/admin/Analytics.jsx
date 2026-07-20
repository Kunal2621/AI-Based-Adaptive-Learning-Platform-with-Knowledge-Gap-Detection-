import { useState, useEffect } from "react";
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

  if (loading) return <div className="p-6 text-on-surface-variant text-label-md">Loading analytics...</div>;
  if (error) return <div className="p-6 text-error text-label-md">{error}</div>;

  const { userGrowth = [], globalKnowledgeGaps = [] } = analytics;
  const maxGrowth = Math.max(...userGrowth.map((g) => g.count), 1);
  const maxGap = Math.max(...globalKnowledgeGaps.map((g) => g.count), 1);

  return (
    <div className="max-w-container-max mx-auto space-y-6">
      <h1 className="text-headline-lg font-bold text-on-surface">Analytics</h1>

      <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6">
        <h2 className="text-headline-md font-bold text-on-surface mb-4">User Growth (Monthly Signups)</h2>
        {userGrowth.length === 0 ? (
          <p className="text-label-sm text-on-surface-variant">No registration data yet.</p>
        ) : (
          <div className="space-y-3">
            {userGrowth.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <span className="w-10 text-label-sm text-on-surface-variant flex-shrink-0">{MONTH_NAMES[m._id]}</span>
                <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(m.count / maxGrowth) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-label-sm font-bold text-on-surface text-right flex-shrink-0">{m.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6">
        <h2 className="text-headline-md font-bold text-on-surface mb-4">Top Platform-Wide Knowledge Gaps</h2>
        {globalKnowledgeGaps.length === 0 ? (
          <p className="text-label-sm text-on-surface-variant">No knowledge gap data yet.</p>
        ) : (
          <div className="space-y-3">
            {globalKnowledgeGaps.map((gap, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-40 text-label-sm text-on-surface truncate flex-shrink-0">{gap._id}</span>
                <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(gap.count / maxGap) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-label-sm font-bold text-on-surface text-right flex-shrink-0">{gap.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
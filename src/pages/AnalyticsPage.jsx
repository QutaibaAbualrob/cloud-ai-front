import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  fetchAnalyticsSummary,
  fetchAnalyticsTimeline,
  fetchCategoryDistribution,
  fetchDigest,
  fetchUrgentItems,
} from '../api/client';
import './AnalyticsPage.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [digest, setDigest] = useState(null);
  const [urgent, setUrgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [digestDays, setDigestDays] = useState(1);
  const [digestLoading, setDigestLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [sumRes, timeRes, distRes, urgRes] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchAnalyticsTimeline(30),
        fetchCategoryDistribution(),
        fetchUrgentItems(),
      ]);
      setSummary(sumRes.data);
      setTimeline(timeRes.data);
      setDistribution(distRes.data);
      setUrgent(urgRes.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDigest = async () => {
    setDigestLoading(true);
    try {
      const res = await fetchDigest(digestDays);
      setDigest(res.data);
    } catch (err) {
      console.error('Failed to load digest', err);
    } finally {
      setDigestLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading analytics…</p>;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>AI Learning Dashboard</h1>
          <p>Monitor classification accuracy and AI learning progress</p>
        </div>
      </div>

      {summary && summary.total_classified > 0 ? (
        <>
          <div className="analytics-stats">
            <div className="analytics-stat">
              <h3>Accuracy</h3>
              <div className="analytics-stat-value">
                {(summary.accuracy * 100).toFixed(1)}%
              </div>
              <div className="analytics-stat-desc">Last {summary.window_days} days</div>
            </div>
            <div className="analytics-stat">
              <h3>Emails Classified</h3>
              <div className="analytics-stat-value">{summary.total_classified}</div>
              <div className="analytics-stat-desc">By AI</div>
            </div>
            <div className="analytics-stat">
              <h3>Corrections</h3>
              <div className="analytics-stat-value">{summary.corrections}</div>
              <div className="analytics-stat-desc">Manual recategorizations</div>
            </div>
          </div>

          <div className="analytics-panels">
            <div className="chart-section analytics-panel-full">
              <h2>Accuracy Over Time</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,64,175,0.2)" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    stroke="#6b7280"
                    fontSize={11}
                  />
                  <Tooltip
                    formatter={(v) => `${(v * 100).toFixed(1)}%`}
                    contentStyle={{
                      background: 'rgba(15,23,42,0.98)',
                      border: '1px solid rgba(30,64,175,0.7)',
                      borderRadius: '8px',
                      color: '#e5e7eb',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h2>Category Distribution</h2>
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ category, count }) => `${category} (${count})`}
                      labelLine={false}
                    >
                      {distribution.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.color || COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="empty-text" style={{ padding: '2rem' }}>No data yet.</p>
              )}
            </div>

            <div className="analytics-panel">
              <h2>Generate Digest</h2>
              <div className="digest-controls">
                <label>Days:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={digestDays}
                  onChange={(e) => setDigestDays(Number(e.target.value))}
                />
                <button className="btn-ghost" onClick={loadDigest} disabled={digestLoading}>
                  {digestLoading ? 'Generating…' : 'Generate'}
                </button>
              </div>
              {digest && digest.daily_overview ? (
                <div className="digest-result">
                  <p>{digest.daily_overview}</p>
                  {digest.key_deadlines && digest.key_deadlines.length > 0 && (
                    <>
                      <h3>Key Deadlines</h3>
                      <ul>
                        {digest.key_deadlines.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {digest.category_highlights && (
                    <>
                      <h3>Category Highlights</h3>
                      <ul>
                        {Object.entries(digest.category_highlights).map(([cat, hl]) => (
                          <li key={cat}><strong>{cat}:</strong> {hl}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : digest ? (
                <p className="empty-text" style={{ padding: '1rem', fontSize: '0.85rem' }}>
                  No digest data for this period.
                </p>
              ) : (
                <p className="empty-text" style={{ padding: '1rem', fontSize: '0.85rem' }}>
                  Click Generate to create a daily digest.
                </p>
              )}
            </div>

            <div className="analytics-panel">
              <h2>Urgent Items</h2>
              {urgent && urgent.items && urgent.items.length > 0 ? (
                urgent.items.map((item) => (
                  <div key={item.id} className="urgent-panel-item">
                    <div>
                      <span className="urgent-subject">
                        {item.subject || '(no subject)'}
                      </span>
                      {item.category_name && (
                        <span className="urgent-cat">{item.category_name}</span>
                      )}
                    </div>
                    {item.summary && (
                      <div className="urgent-summary">{item.summary}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-text" style={{ padding: '1rem', fontSize: '0.85rem' }}>
                  No urgent items flagged.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="empty-text">
          No data available yet. Start syncing your email to see analytics.
        </p>
      )}
    </div>
  );
}

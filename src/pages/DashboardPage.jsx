import { useState, useEffect } from 'react';
import {
  fetchAnalyticsSummary, fetchDigest, fetchUrgentItems,
} from '../api/client';
import './DashboardPage.css';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [digest, setDigest] = useState(null);
  const [urgent, setUrgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [sumRes, digRes, urgRes] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchDigest(1),
        fetchUrgentItems(),
      ]);
      setSummary(sumRes.data);
      setDigest(digRes.data);
      setUrgent(urgRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading dashboard…</p>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Dashboard</h1>
          <p>Overview of your AI-organized inbox</p>
        </div>
      </div>

      {summary && (
        <div className="dash-stats">
          <div className="dash-stat">
            <h3>AI Accuracy</h3>
            <div className="stat-value">
              {summary.accuracy != null
                ? `${(summary.accuracy * 100).toFixed(1)}%`
                : '—'}
            </div>
            <div className="stat-desc">Last {summary.window_days} days</div>
          </div>
          <div className="dash-stat">
            <h3>Emails Classified</h3>
            <div className="stat-value">{summary.total_classified}</div>
            <div className="stat-desc">By AI in this window</div>
          </div>
          <div className="dash-stat">
            <h3>Corrections</h3>
            <div className="stat-value">{summary.corrections}</div>
            <div className="stat-desc">Manual recategorizations</div>
          </div>
          {urgent && (
            <div className="dash-stat">
              <h3>Urgent</h3>
              <div className="stat-value">{urgent.urgent_count}</div>
              <div className="stat-desc">Flagged emails</div>
            </div>
          )}
        </div>
      )}

      <div className="dash-panels">
        {digest && digest.daily_overview && (
          <div className="dash-panel">
            <h2>📋 Daily Digest</h2>
            <p className="digest-overview">{digest.daily_overview}</p>

            {digest.category_highlights && (
              <div className="highlight-grid">
                {Object.entries(digest.category_highlights).map(([cat, hl]) => (
                  <div key={cat} className="highlight-cat">
                    <strong>{cat}:</strong> {hl}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {urgent && urgent.items && urgent.items.length > 0 && (
          <div className="dash-panel">
            <h2>
              🔴 Urgent Items
              <span className="count-badge">{urgent.items.length}</span>
            </h2>
            <ul className="urgent-list">
              {urgent.items.map((item) => (
                <li key={item.id} className="urgent-item">
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
                </li>
              ))}
            </ul>
          </div>
        )}

        {digest && digest.key_deadlines && digest.key_deadlines.length > 0 && (
          <div className="dash-panel">
            <h2>⏰ Key Deadlines</h2>
            <ul className="deadline-list">
              {digest.key_deadlines.map((d, i) => (
                <li key={i} className="deadline-item">{d}</li>
              ))}
            </ul>
          </div>
        )}

        {digest && (
          <div className="dash-panel">
            <h2>📊 Summary</h2>
            <div className="dash-stats" style={{ margin: 0, gridTemplateColumns: '1fr 1fr' }}>
              <div className="dash-stat">
                <h3>Action Items</h3>
                <div className="stat-value">{digest.action_item_count ?? 0}</div>
              </div>
              <div className="dash-stat">
                <h3>Urgent Today</h3>
                <div className="stat-value">{digest.urgent_count ?? 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!digest?.daily_overview && !urgent?.items?.length && (
        <p className="empty-text">
          No data available yet. Connect an email account and sync to get started.
        </p>
      )}
    </div>
  );
}

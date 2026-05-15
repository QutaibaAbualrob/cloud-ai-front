import { useState, useEffect } from 'react';
import { fetchFeedbackLogs } from '../api/client';
import './FeedbackPage.css';

export default function FeedbackPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchFeedbackLogs({ page });
      setLogs(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load feedback logs', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString();
  };

  if (loading) return <p className="loading-text">Loading feedback history…</p>;

  return (
    <div className="feedback-page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Feedback History</h1>
          <p>Every time you correct an AI classification, it&apos;s recorded here to improve future predictions</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="empty-text">
          No corrections yet. When you recategorize an AI-classified email,
          it will appear here.
        </p>
      ) : (
        <div className="card">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Sender</th>
                <th>Category Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td className="email-subject-cell" title={log.email_subject}>
                    {log.email_subject || '(no subject)'}
                  </td>
                  <td className="email-sender-cell" title={log.email_sender}>
                    {log.email_sender || '—'}
                  </td>
                  <td>
                    <span className="feedback-cat-from">
                      {log.predicted_category_name || 'Unknown'}
                    </span>
                    <span className="feedback-arrow">→</span>
                    <span className="feedback-cat-to">
                      {log.corrected_category_name || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <span className={`feedback-applied ${log.is_applied ? 'feedback-applied-yes' : 'feedback-applied-no'}`}>
                      {log.is_applied ? '● Applied' : '○ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          ← Previous
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>Page {page}</span>
        <button className="btn-ghost" onClick={() => setPage((p) => p + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}

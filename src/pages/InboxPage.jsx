import { useState, useEffect } from 'react';
import {
  fetchEmails, fetchCategories, updateEmailCategory, fetchEmail,
} from '../api/client';
import './InboxPage.css';

const PRIORITY_CLASS = {
  high: 'badge-priority-high',
  medium: 'badge-priority-medium',
  low: 'badge-priority-low',
};

export default function InboxPage() {
  const [emails, setEmails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uncategorizedOnly, setUncategorizedOnly] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadEmails();
    loadCategories();
  }, [page, search, selectedCategory, uncategorizedOnly]);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (uncategorizedOnly) {
        params.is_ai_classified = false;
        params.category__isnull = true;
      }
      const res = await fetchEmails(params);
      setEmails(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load emails', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleCategoryChange = async (emailId, categoryId) => {
    try {
      await updateEmailCategory(emailId, categoryId);
      setEmails((prev) =>
        prev.map((e) =>
          e.id === emailId
            ? {
                ...e,
                category: categoryId,
                category_name:
                  categories.find((c) => c.id === categoryId)?.name ?? null,
                category_color:
                  categories.find((c) => c.id === categoryId)?.color ?? null,
              }
            : e,
        ),
      );
      if (expandedId === emailId) {
        setExpandedEmail((prev) =>
          prev
            ? {
                ...prev,
                category: categoryId,
                category_name:
                  categories.find((c) => c.id === categoryId)?.name ?? null,
                category_color:
                  categories.find((c) => c.id === categoryId)?.color ?? null,
              }
            : prev,
        );
      }
    } catch (err) {
      console.error('Failed to update category', err);
    }
  };

  const toggleExpand = async (email) => {
    if (expandedId === email.id) {
      setExpandedId(null);
      setExpandedEmail(null);
      return;
    }
    setExpandedId(email.id);
    setExpandedEmail(email);
    if (!email.body_text && !email.summary) {
      setLoadingDetail(true);
      try {
        const res = await fetchEmail(email.id);
        setExpandedEmail(res.data);
      } catch (err) {
        console.error('Failed to load email detail', err);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const now = new Date();
    const diff = now - dt;
    if (diff < 86400000 && now.getDate() === dt.getDate()) {
      return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 172800000) return 'Yesterday';
    return dt.toLocaleDateString();
  };

  return (
    <div className="inbox-page">
      <div className="inbox-layout">
        <aside className="inbox-filter-sidebar">
          <h3>Filter by Category</h3>
          <ul className="filter-cat-list">
            <li
              className={`filter-cat-item ${!selectedCategory && !uncategorizedOnly ? 'filter-cat-item-active' : ''}`}
              onClick={() => { setSelectedCategory(null); setUncategorizedOnly(false); setPage(1); }}
            >
              <span className="filter-cat-dot" style={{ background: 'conic-gradient(#4f46e5, #22c55e, #facc15, #f97316, #ec4899, #4f46e5)' }} />
              All mail
            </li>
            <li
              className={`filter-cat-item ${uncategorizedOnly ? 'filter-cat-item-active' : ''}`}
              onClick={() => { setUncategorizedOnly(!uncategorizedOnly); setSelectedCategory(null); setPage(1); }}
            >
              <span className="filter-cat-dot" style={{ background: '#6b7280' }} />
              Uncategorized
            </li>
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`filter-cat-item ${selectedCategory === cat.id ? 'filter-cat-item-active' : ''}`}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                  setUncategorizedOnly(false);
                  setPage(1);
                }}
              >
                <span className="filter-cat-dot" style={{ background: cat.color }} />
                {cat.name}
                <span className="filter-cat-count">{cat.email_count}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="inbox-main">
          <div className="page-header" style={{ marginBottom: '0.75rem' }}>
            <div className="page-header-title">
              <h1>Inbox</h1>
              <p>Review and organize emails categorized by InboxIQ</p>
            </div>
          </div>

          <div className="inbox-toolbar">
            <input
              type="search"
              className="search-input"
              placeholder="Search subject, sender, or content…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {uncategorizedOnly && (
              <span className="badge" style={{ background: 'rgba(107,114,128,0.15)', color: 'var(--text-dim)', fontSize: '12px' }}>
                Uncategorized only
              </span>
            )}
          </div>

          {loading ? (
            <p className="loading-text">Loading emails…</p>
          ) : emails.length === 0 ? (
            <p className="empty-text">No emails found.</p>
          ) : (
            <>
              <div className="email-cards">
                {emails.map((email) => {
                  const isExpanded = expandedId === email.id;
                  const detail = isExpanded ? expandedEmail : null;

                  return (
                    <div
                      key={email.id}
                      className={`email-card ${isExpanded ? 'email-card-expanded' : ''} ${!email.is_read ? 'email-card-unread' : ''}`}
                    >
                      <div onClick={() => toggleExpand(email)}>
                        <div className="email-card-header">
                          <span className="email-card-sender">
                            {email.sender_name || email.sender_email}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="email-card-subject">
                              {email.subject || '(no subject)'}
                            </div>
                            <div className="email-card-snippet">
                              {email.snippet}
                            </div>
                          </div>
                        </div>
                        <div className="email-card-meta">
                          {email.category_name && (
                            <span
                              className="category-badge"
                              style={{
                                background: `${email.category_color}22`,
                                color: email.category_color || '#9ca3af',
                                borderColor: `${email.category_color}66`,
                              }}
                            >
                              {email.category_name}
                            </span>
                          )}
                          {email.priority && (
                            <span className={`badge ${PRIORITY_CLASS[email.priority] || ''}`}>
                              {email.priority}
                            </span>
                          )}
                          {email.is_urgent && (
                            <span className="badge badge-urgent">Urgent</span>
                          )}
                          {email.has_deadline && (
                            <span className="badge badge-deadline">Deadline</span>
                          )}
                          {email.confidence_score != null && (
                            <span className="confidence-text">
                              {(email.confidence_score * 100).toFixed(0)}%
                            </span>
                          )}
                          <span className="email-card-date">
                            {formatDate(email.received_at)}
                          </span>
                          <div className="email-card-actions" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={email.category ?? ''}
                              onChange={(e) => handleCategoryChange(email.id, Number(e.target.value))}
                            >
                              <option value="">Move to…</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="email-detail">
                          {loadingDetail ? (
                            <p className="loading-text" style={{ padding: '1rem' }}>
                              Loading detail…
                            </p>
                          ) : (
                            <>
                              {detail?.summary && (
                                <div className="email-ai-summary">
                                  <span className="ai-label">AI Summary</span>
                                  {detail.summary}
                                </div>
                              )}

                              {detail?.action_items && (
                                <div className="email-action-items">
                                  <span className="ai-label">Action Items</span>
                                  <p>{detail.action_items}</p>
                                </div>
                              )}

                              <div className="email-detail-grid" style={{ marginTop: '0.75rem' }}>
                                <div className="email-detail-field">
                                  <div className="field-label">From</div>
                                  <div className="field-value">
                                    {detail?.sender_name || email.sender_name} &lt;{detail?.sender_email || email.sender_email}&gt;
                                  </div>
                                </div>
                                <div className="email-detail-field">
                                  <div className="field-label">To</div>
                                  <div className="field-value">
                                    {detail?.recipient_email || email.recipient_email || '—'}
                                  </div>
                                </div>
                                {detail?.priority && (
                                  <div className="email-detail-field">
                                    <div className="field-label">Priority</div>
                                    <div className="field-value" style={{ textTransform: 'capitalize' }}>
                                      {detail.priority}
                                    </div>
                                  </div>
                                )}
                                {detail?.deadline_date && (
                                  <div className="email-detail-field">
                                    <div className="field-label">Deadline</div>
                                    <div className="field-value">
                                      {new Date(detail.deadline_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {detail?.body_text && (
                                <div className="email-detail-body">
                                  {detail.body_text}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pagination">
                <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ← Previous
                </button>
                <span>Page {page}</span>
                <button className="btn-ghost" onClick={() => setPage((p) => p + 1)}>
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

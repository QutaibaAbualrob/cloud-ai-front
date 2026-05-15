import { useState, useEffect } from 'react';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
} from '../api/client';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', color: '#4f46e5' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Category name is required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await updateCategory(editing, { name: form.name, color: form.color });
        setEditing(null);
      } else {
        await createCategory({ name: form.name, color: form.color });
      }
      setForm({ name: '', color: '#4f46e5' });
      setShowForm(false);
      loadCategories();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join('; ') : 'Failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, color: cat.color });
    setEditing(cat.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (cat) => {
    if (cat.is_builtin) {
      setError('Cannot delete built-in categories.');
      return;
    }
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      loadCategories();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? d.error || Object.values(d).flat().join('; ') : 'Delete failed.');
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', color: '#4f46e5' });
    setShowForm(false);
    setError('');
  };

  if (loading) return <p className="loading-text">Loading categories…</p>;

  return (
    <div className="categories-page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Categories</h1>
          <p>Manage your email categories and colors</p>
        </div>
        <div className="page-header-actions">
          {!showForm && (
            <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', color: '#4f46e5' }); setError(''); }}>
              + New Category
            </button>
          )}
        </div>
      </div>

      {error && !showForm && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>
      )}

      {showForm && (
        <form className="cat-form" onSubmit={handleCreate}>
          <h3>{editing ? 'Edit Category' : 'Create Category'}</h3>
          {error && <div className="error-banner" style={{ width: '100%' }}>{error}</div>}
          <div className="field">
            <label>Name</label>
            <input type="text" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Category name" autoFocus />
          </div>
          <div className="field">
            <label>Color</label>
            <input type="color" value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn-ghost" onClick={cancelEdit}>
            Cancel
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="empty-text">No categories defined yet.</p>
      ) : (
        <div className="cat-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="cat-card">
              <div className="cat-color-bar" style={{ background: cat.color }} />
              <div className="cat-info">
                <div className="cat-name">
                  {cat.name}
                  {cat.is_builtin && <span className="cat-badge-builtin">built-in</span>}
                </div>
                <div className="cat-meta">
                  {cat.email_count ?? 0} emails · slug: {cat.slug}
                </div>
              </div>
              <div className="cat-actions">
                <button className="btn-ghost" onClick={() => handleEdit(cat)}
                  style={{ padding: '3px 8px', fontSize: '11px' }}>
                  Edit
                </button>
                {!cat.is_builtin && (
                  <button className="btn-danger" onClick={() => handleDelete(cat)}
                    style={{ padding: '3px 8px', fontSize: '11px' }}>
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

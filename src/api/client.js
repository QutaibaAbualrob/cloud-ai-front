/**
 * Axios-based API client for the InboxIQ backend.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── interceptors ────────────────────────────────────────────────

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── auth ─────────────────────────────────────────────────────────

export const login = (username, password) =>
  client.post('/dj-rest-auth/login/', { username, password });

export const register = (username, email, password1, password2) =>
  client.post('/dj-rest-auth/registration/', { username, email, password1, password2 });

export const logout = () =>
  client.post('/dj-rest-auth/logout/');

// ── emails ───────────────────────────────────────────────────────

export const fetchEmails = (params = {}) =>
  client.get('/emails/', { params });

export const fetchEmail = (id) =>
  client.get(`/emails/${id}/`);

export const fetchUncategorizedEmails = () =>
  client.get('/emails/uncategorized/');

export const updateEmailCategory = (emailId, categoryId) =>
  client.patch(`/emails/${emailId}/category/`, { category_id: categoryId });

export const updateEmail = (id, data) =>
  client.put(`/emails/${id}/`, data);

export const batchCategorize = () =>
  client.post('/emails/batch_categorize/');

// ── categories ───────────────────────────────────────────────────

export const fetchCategories = () =>
  client.get('/categories/');

export const createCategory = (data) =>
  client.post('/categories/', data);

export const updateCategory = (id, data) =>
  client.put(`/categories/${id}/`, data);

export const deleteCategory = (id) =>
  client.delete(`/categories/${id}/`);

// ── email accounts ───────────────────────────────────────────────

export const fetchAccounts = () =>
  client.get('/accounts/');

export const connectAccount = (data) =>
  client.post('/accounts/', data);

export const deleteAccount = (id) =>
  client.delete(`/accounts/${id}/`);

export const syncAccount = (id) =>
  client.post(`/accounts/${id}/sync/`);

// ── social auth ──────────────────────────────────────────────────

export const googleLogin = (accessToken) =>
  client.post('/auth/google/', { access_token: accessToken });

// ── analytics ────────────────────────────────────────────────────

export const fetchAnalyticsSummary = () =>
  client.get('/analytics/summary/');

export const fetchAnalyticsTimeline = (days = 30) =>
  client.get('/analytics/timeline/', { params: { days } });

export const fetchCategoryDistribution = () =>
  client.get('/analytics/distribution/');

export const fetchDigest = (days = 1) =>
  client.get('/analytics/digest/', { params: { days } });

export const fetchCategoryDigest = (slug, days = 7) =>
  client.get('/analytics/category_digest/', { params: { slug, days } });

export const fetchUrgentItems = () =>
  client.get('/analytics/urgent/');

export const fetchFeedbackPendingCount = () =>
  client.get('/analytics/feedback_pending/');

// ── feedback ─────────────────────────────────────────────────────

export const fetchFeedbackLogs = (params = {}) =>
  client.get('/feedback/', { params });

export default client;

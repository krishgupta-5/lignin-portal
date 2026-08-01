/**
 * API Service Layer — connects React frontend to FastAPI backend.
 * Base URL: http://localhost:8000/api
 */

const API_BASE = 'http://localhost:8000/api';

// --- Token Management ---
function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token) {
  localStorage.setItem('auth_token', token);
}

export function removeToken() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getToken();
}

// --- Fetch Helper ---
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    // Optionally redirect to login
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'API request failed');
  }

  return data;
}

// --- Auth API ---
export async function apiSignup(name, email, password) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function apiLogin(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function apiGetMe() {
  return apiFetch('/auth/me');
}

export function apiLogout() {
  removeToken();
}

// --- Prediction API ---
export async function apiPredict(formData) {
  return apiFetch('/predict', {
    method: 'POST',
    body: JSON.stringify({
      plant: formData.plant,
      chemical: formData.chemical,
      temperature: Number(formData.temperature),
      time_range: formData.timeRange,
      ratio: formData.ratio,
      ph: Number(formData.ph),
      model: formData.model || 'node_augmented',
    }),
  });
}

export async function apiGetPrediction(id) {
  return apiFetch(`/predictions/${id}`);
}

// --- History API ---
export async function apiGetHistory(search = '', performance = 'All', page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (performance && performance !== 'All') params.set('performance', performance);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return apiFetch(`/history?${params.toString()}`);
}

export async function apiDeletePrediction(id) {
  return apiFetch(`/history/${id}`, { method: 'DELETE' });
}

// --- Compare API ---
export async function apiCompare(predictionIds) {
  return apiFetch('/compare', {
    method: 'POST',
    body: JSON.stringify({ prediction_ids: predictionIds }),
  });
}

// --- Reports API ---
export async function apiGetReports() {
  return apiFetch('/reports');
}

export async function apiGenerateReport(title, predictionIds) {
  return apiFetch('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ title, prediction_ids: predictionIds }),
  });
}

export async function apiDeleteReport(id) {
  return apiFetch(`/reports/${id}`, { method: 'DELETE' });
}

// --- Health ---
export async function apiHealthCheck() {
  return apiFetch('/health');
}

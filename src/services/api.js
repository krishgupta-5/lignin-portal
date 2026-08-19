/**
 * API Service Layer — connects React frontend to FastAPI backend.
 * Base URL: http://localhost:8000/api
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// --- Token Management ---
export function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
  }
}

export function removeToken() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
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

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new Error('Unable to connect to server. Please check if the backend is running.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    let message = 'API request failed';
    if (typeof data.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail
        .map((d) => {
          const field = d.loc ? d.loc.filter((x) => x !== 'body').join('.') : '';
          return field ? `${field}: ${d.msg}` : (d.msg || JSON.stringify(d));
        })
        .join(' | ');
    } else if (data.message) {
      message = data.message;
    }

    const error = new Error(message);
    error.status = res.status;

    // If explicitly 401 on protected endpoint, clear stale token
    if (res.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/signup')) {
      removeToken();
    }

    throw error;
  }

  return data;
}



// --- Auth API ---
export async function apiSignup(name, email, password) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data.access_token) {
    setToken(data.access_token);
    setStoredUser(data.user);
  }
  return data;
}

export async function apiVerifyOTP(email, otp) {
  const data = await apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  if (data.access_token) {
    setToken(data.access_token);
    setStoredUser(data.user);
  }
  return data;
}

export async function apiResendOTP(email) {
  return apiFetch('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
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

export async function apiUpdateProfile(name) {
  const data = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
  setStoredUser(data);
  return data;
}

export async function apiChangePassword(currentPassword, newPassword) {
  return apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export async function apiForgotPassword(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(email, otp, newPassword) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword,
    }),
  });
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
      time_range: formData.time_range || formData.timeRange || '10 – 180',
      ratio: formData.ratio || '1:20',
      ph: Number(formData.ph ?? 7.0),
      model: formData.model || 'node_augmented',
      cellulose_percent: formData.cellulose_percent !== undefined ? Number(formData.cellulose_percent) : undefined,
      hemicellulose_percent: formData.hemicellulose_percent !== undefined ? Number(formData.hemicellulose_percent) : undefined,
      lignin_percent: formData.lignin_percent !== undefined ? Number(formData.lignin_percent) : undefined,
      size_mm: formData.size_mm !== undefined ? Number(formData.size_mm) : undefined,
      hbd_hba_ratio: formData.hbd_hba_ratio !== undefined ? Number(formData.hbd_hba_ratio) : undefined,
      liquid_solid_ratio: formData.liquid_solid_ratio !== undefined ? Number(formData.liquid_solid_ratio) : undefined,
    }),
  });
}

export async function apiPredictAll(formData) {
  return apiFetch('/predict-all', {
    method: 'POST',
    body: JSON.stringify({
      plant: formData.plant,
      chemical: formData.chemical,
      temperature: Number(formData.temperature),
      time_range: formData.time_range || formData.timeRange || '10 – 180',
      ratio: formData.ratio || '1:20',
      ph: Number(formData.ph ?? 7.0),
      cellulose_percent: formData.cellulose_percent !== undefined ? Number(formData.cellulose_percent) : undefined,
      hemicellulose_percent: formData.hemicellulose_percent !== undefined ? Number(formData.hemicellulose_percent) : undefined,
      lignin_percent: formData.lignin_percent !== undefined ? Number(formData.lignin_percent) : undefined,
      size_mm: formData.size_mm !== undefined ? Number(formData.size_mm) : undefined,
      hbd_hba_ratio: formData.hbd_hba_ratio !== undefined ? Number(formData.hbd_hba_ratio) : undefined,
      liquid_solid_ratio: formData.liquid_solid_ratio !== undefined ? Number(formData.liquid_solid_ratio) : undefined,
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

export async function apiGetReports() {
  return apiFetch('/reports');
}

export async function apiGetReportDetails(id) {
  return apiFetch(`/reports/${id}/details`);
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

// --- Options (Biomass & Chemical Systems) ---
export async function apiGetOptions() {
  return apiFetch('/options');
}

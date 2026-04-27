// FeedLink API Client
const BASE_URL = 'https://api.feedlink.tech/api';

let accessToken: string | null = null;

// Storage helpers (will use AsyncStorage in AppContext)
let storage: { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void>; removeItem: (k: string) => Promise<void> } | null = null;

export function setStorage(st: typeof storage) { storage = st; }

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  storage?.setItem('fl_access_token', access);
  storage?.setItem('fl_refresh_token', refresh);
}

export function getToken() { return accessToken; }

export async function loadTokens() {
  if (!storage) return;
  accessToken = await storage.getItem('fl_access_token');
}

export function clearTokens() {
  accessToken = null;
  storage?.removeItem('fl_access_token');
  storage?.removeItem('fl_refresh_token');
}

export async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Something went wrong');
  }
  return json;
}

// Auth
export const auth = {
  register: (data: { name: string; email: string; contact: string; password: string; role: string; location: { lat: number; long: number }; terms_accepted: boolean }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  verifyOtp: (data: { email: string; otp: string }) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  resendOtp: (data: { email: string }) =>
    request('/auth/resend-otp', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (data: { email: string }) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),

  resetPassword: (data: { email: string; otp: string; password: string; password_confirmation: string }) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (data: { refresh_token: string }) =>
    request('/auth/refresh-token', { method: 'POST', body: JSON.stringify(data) }),

  getProfile: () => request('/user/profile'),

  logout: () => request('/auth/logout', { method: 'GET' }),
};

// Shared
export const shared = {
  uploadPhoto: (formData: FormData) =>
    fetch(`${BASE_URL}/upload/photo`, {
      method: 'POST',
      headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      body: formData,
    }).then(r => r.json()),
};

// Notifications (shared between donor and recipient)
export const notifications = {
  getNotifications: (query = '') => request(`/notifications${query}`),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
};

// FeedLink API Client
const BASE_URL = 'https://api.feedlink.tech/api';

function getToken() { return localStorage.getItem('fl_access_token'); }
function setTokens(access, refresh) {
  localStorage.setItem('fl_access_token', access);
  localStorage.setItem('fl_refresh_token', refresh);
}
function clearTokens() {
  localStorage.removeItem('fl_access_token');
  localStorage.removeItem('fl_refresh_token');
}

async function request(method, path, body, isFormData) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (!isFormData) headers['Accept'] = 'application/json';

  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(BASE_URL + path, opts);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(method, path, body, isFormData);
    clearTokens();
    window.__feedlinkLogout && window.__feedlinkLogout();
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

async function tryRefresh() {
  const refresh = localStorage.getItem('fl_refresh_token');
  if (!refresh) return false;
  try {
    const res = await fetch(BASE_URL + '/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh })
    });
    const data = await res.json();
    if (data.data?.access_token) {
      setTokens(data.data.access_token, data.data.refresh_token);
      return true;
    }
  } catch {}
  return false;
}

const api = {
  // Auth
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  logout: () => request('GET', '/auth/logout'),
  verifyOtp: (body) => request('POST', '/auth/verify-otp', body),
  resendOtp: (body) => request('POST', '/auth/resend-otp', body),
  forgotPassword: (body) => request('POST', '/auth/forgot-password', body),
  resetPassword: (body) => request('POST', '/auth/reset-password', body),

  // User
  getProfile: () => request('GET', '/user/profile'),
  updateProfile: (body) => request('PUT', '/user/profile', body),
  updateLocation: (body) => request('PUT', '/user/location', body),
  registerDeviceToken: (body) => request('POST', '/user/device-token', body),
  uploadPhoto: (formData) => request('POST', '/upload/photo', formData, true),

  // Notifications
  getNotifications: (params = '') => request('GET', `/notifications${params}`),
  markNotificationRead: (id) => request('PUT', `/notifications/${id}/read`),
  markAllRead: () => request('PUT', '/notifications/read-all'),

  // Donor - Listings
  getDonorListings: (params = '') => request('GET', `/donor/listings${params}`),
  createListing: (body) => request('POST', '/donor/listings', body),
  getDonorListing: (id) => request('GET', `/donor/listings/${id}`),
  updateListing: (id, body) => request('PUT', `/donor/listings/${id}`, body),
  cancelListing: (id) => request('DELETE', `/donor/listings/${id}`),
  getDonorStats: () => request('GET', '/donor/stats'),
  relistListing: (id) => request('POST', `/donor/listings/${id}/relist`),
  reopenListing: (id) => request('POST', `/donor/listings/${id}/reopen`),

  // Donor - Claims
  getListingClaims: (listingId) => request('GET', `/donor/listings/${listingId}/claims`),
  confirmClaim: (listingId, claimId) => request('POST', `/donor/listings/${listingId}/claims/${claimId}/confirm`),
  rejectClaim: (listingId, claimId) => request('POST', `/donor/listings/${listingId}/claims/${claimId}/reject`),

  // Donor - Requests
  getDonorRequests: (params = '') => request('GET', `/donor/requests${params}`),
  acceptRequest: (requestId, body) => request('POST', `/donor/requests/${requestId}/accept`, body),
  withdrawAcceptance: (requestId) => request('DELETE', `/donor/requests/${requestId}/accept`),

  // Recipient - Listings
  getRecipientListings: (params = '') => request('GET', `/recipient/listings${params}`),
  getRecipientListing: (id) => request('GET', `/recipient/listings/${id}`),
  claimListing: (id, body) => request('POST', `/recipient/listings/${id}/claim`, body),
  cancelClaim: (id) => request('DELETE', `/recipient/listings/${id}/claim`),
  completeListing: (id) => request('POST', `/recipient/listings/${id}/complete`),

  // Recipient - Claims
  getMyClaimsRecipient: (params = '') => request('GET', `/recipient/claims${params}`),

  // Recipient - Requests
  getMyRequests: () => request('GET', '/recipient/requests'),
  createRequest: (body) => request('POST', '/recipient/requests', body),
  getRequest: (id) => request('GET', `/recipient/requests/${id}`),
  updateRequest: (id, body) => request('PUT', `/recipient/requests/${id}`, body),
  deleteRequest: (id) => request('DELETE', `/recipient/requests/${id}`),
  getRequestAcceptances: (id) => request('GET', `/recipient/requests/${id}/acceptances`),
  confirmAcceptance: (reqId, accId) => request('POST', `/recipient/requests/${reqId}/acceptances/${accId}/confirm`),
  rejectAcceptance: (reqId, accId) => request('POST', `/recipient/requests/${reqId}/acceptances/${accId}/reject`),
  completeRequest: (id) => request('POST', `/recipient/requests/${id}/complete`),

  // Nearby
  getNearbyListings: (params) => request('GET', `/listings/nearby${params}`),
  getNearbyRequests: (params) => request('GET', `/requests/nearby${params}`),

  setTokens,
  clearTokens,
  getToken
};

window.api = api;

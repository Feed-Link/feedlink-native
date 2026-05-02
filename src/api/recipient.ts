import * as client from './client';

export const recipient = {
  // Nearby listings (for home screen)
  getNearbyListings: (query = '') => client.request(`/listings/nearby${query}`),

  // Single listing by ID (for detail screens from notifications)
  getListing: (id: string) => client.request(`/recipient/listings/${id}`),

  // My claims
  getClaims: (query = '') => client.request(`/recipient/claims${query}`),
  createClaim: (listingId: string, data?: any) =>
    client.request(`/recipient/listings/${listingId}/claim`, { method: 'POST', body: JSON.stringify(data) }),
  cancelClaim: (listingId: string) =>
    client.request(`/recipient/listings/${listingId}/claim`, { method: 'DELETE' }),
  markCollected: (listingId: string) =>
    client.request(`/recipient/listings/${listingId}/complete`, { method: 'POST' }),

  // My requests (CRUD)
  getRequests: (query = '') => client.request(`/recipient/requests${query}`),
  getRequest: (id: string) => client.request(`/recipient/requests/${id}`),
  createRequest: (data: any) =>
    client.request('/recipient/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequest: (id: string, data: any) =>
    client.request(`/recipient/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRequest: (id: string) =>
    client.request(`/recipient/requests/${id}`, { method: 'DELETE' }),

  // Request acceptances (donor offers)
  getAcceptances: (requestId: string) =>
    client.request(`/recipient/requests/${requestId}/acceptances`),
  confirmAcceptance: (requestId: string, acceptanceId: string) =>
    client.request(`/recipient/requests/${requestId}/acceptances/${acceptanceId}/confirm`, { method: 'POST' }),
  rejectAcceptance: (requestId: string, acceptanceId: string) =>
    client.request(`/recipient/requests/${requestId}/acceptances/${acceptanceId}/reject`, { method: 'POST' }),
  completeRequest: (requestId: string) =>
    client.request(`/recipient/requests/${requestId}/complete`, { method: 'POST' }),
};
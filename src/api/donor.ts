import * as client from './client';

export const donor = {
  getStats: () => client.request('/donor/stats'),

  getListings: (query = '') => client.request(`/donor/listings${query}`),

  getListing: (id: string) => client.request(`/donor/listings/${id}`),

  createListing: (data: any) =>
    client.request('/donor/listings', { method: 'POST', body: JSON.stringify(data) }),

  updateListing: (id: string, data: any) =>
    client.request(`/donor/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteListing: (id: string) =>
    client.request(`/donor/listings/${id}`, { method: 'DELETE' }),

  relistListing: (id: string) =>
    client.request(`/donor/listings/${id}/relist`, { method: 'POST' }),

  reopenListing: (id: string) =>
    client.request(`/donor/listings/${id}/reopen`, { method: 'POST' }),

  getListingClaims: (listingId: string) =>
    client.request(`/donor/listings/${listingId}/claims`),

  confirmClaim: (listingId: string, claimId: string) =>
    client.request(`/donor/listings/${listingId}/claims/${claimId}/confirm`, { method: 'POST' }),

  rejectClaim: (listingId: string, claimId: string) =>
    client.request(`/donor/listings/${listingId}/claims/${claimId}/reject`, { method: 'POST' }),

  getRequests: (query = '') => client.request(`/donor/requests${query}`),

  acceptRequest: (requestId: string, data: any) =>
    client.request(`/donor/requests/${requestId}/accept`, { method: 'POST', body: JSON.stringify(data) }),

  cancelAcceptance: (requestId: string) =>
    client.request(`/donor/requests/${requestId}/accept`, { method: 'DELETE' }),
};

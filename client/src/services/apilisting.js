import { API } from "../../apis"; 

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const apiToggleHide = async (token, listingId) => {
  const res = await fetch(`${API.PROPERTY}/api/actions/${listingId}/hide`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  return res.json();
};

export const apiRefreshListing = async (token, listingId) => {
  const res = await fetch(`${API.PROPERTY}/api/actions/${listingId}/refresh`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  return res.json();
};

export const apiUpdateStatus = async (token, listingId, status) => {
  const res = await fetch(`${API.PROPERTY}/api/actions/${listingId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const apiGetOwnerDashboard = async (token) => {
  const res = await fetch(`${API.PROPERTY}/api/actions/dashboard/owner`, {
    headers: authHeaders(token),
  });
  return res.json();
};
import { API } from "../../apis";

export const trackInteraction = async (propertyId, action) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const key = `tracked:${propertyId}:${action}`;
    const lastTracked = localStorage.getItem(key);
    const now = Date.now();

    if (lastTracked && now - Number(lastTracked) < 30 * 60 * 1000) return;

    localStorage.setItem(key, now);

    fetch(`${API.PROPERTY}/api/property/interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ propertyId, action }),
    });
  } catch {
    // silent
  }
};
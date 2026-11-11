
import { API } from "../../apis";

export const historyPath = (id) =>
  `/api/property/evaluations/${encodeURIComponent(id)}/history`;

export async function fetchEvaluationHistory(propertyId, signal) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API.PROPERTY}${historyPath(propertyId)}`,
    {
      method: "GET",
      signal,
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch evaluation history"
    );
  }

  return data;
}

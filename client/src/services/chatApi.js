 const CHAT_API = "http://localhost:5005";

 
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
 
 
export const createConversation = async (params) => {
  const res = await fetch(`${CHAT_API}/conversations/start`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to start conversation.");
  }

  return res.json();
};
 
export const getConversations = async () => {
  const res = await fetch(`${CHAT_API}/conversations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch conversations.");
  return res.json();
};

 
export const getConversation = async (slug) => {
  const res = await fetch(`${CHAT_API}/conversations/${slug}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch conversation.");
  return res.json();
};

 
export const getMessages = async (slug, before = null) => {
  const url = before
    ? `${CHAT_API}/messages/${slug}?before=${before}`
    : `${CHAT_API}/messages/${slug}`;

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
 
  if (!res.ok) throw new Error("Failed to fetch messages.");
  return res.json();
};

 
export const sendMessage = async (conversationSlug, text) => {
  const res = await fetch(`${CHAT_API}/messages/send`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      conversationSlug,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to send message.");
  }

  return res.json();
};

 
export const markRead = async (conversationSlug) => {
  const res = await fetch(`${CHAT_API}/messages/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ conversationSlug }),
  });

  if (!res.ok) throw new Error("Failed to mark messages as read.");
  return res.json();
};

 
export const archiveConversation = async (slug) => {
  const res = await fetch(`${CHAT_API}/conversations/archive/${slug}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to archive conversation.");
  return res.json();
};
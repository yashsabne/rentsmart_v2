const REDIS_SERVICE_URL = process.env.REDIS_SERVICE_URL;

const safeParse = async (res) => {
  const text = await res.text();
  if (!res.ok || text.startsWith("<") || text.startsWith("Too")) return null;
  try { return JSON.parse(text); } catch { return null; }
};

export const redisPost = async (path, body) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await safeParse(res);
  } catch (error) {
    console.error("Redis service POST failed:", error.message);
    return null;
  }
};

export const redisGet = async (path) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`);
    return await safeParse(res);
  } catch (error) {
    console.error("Redis service GET failed:", error.message);
    return null;
  }
};

export const redisDelete = async (path) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`, {
      method: "DELETE",
    });
    return await safeParse(res);
  } catch (error) {
    console.error("Redis service DELETE failed:", error.message);
    return null;
  }
};

export const redisPatch = async (path, body = {}) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await safeParse(res);
  } catch (error) {
    console.error("Redis service PATCH failed:", error.message);
    return null;
  }
};
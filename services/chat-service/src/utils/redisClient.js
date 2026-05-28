const REDIS_SERVICE_URL = process.env.REDIS_SERVICE_URL;

 const redisPost = async (path, body) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (error) {
    console.error("Redis service POST failed:", error.message);
    return null;
  }
};

 const redisGet = async (path) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`);
    return await res.json();
  } catch (error) {
    console.error("Redis service GET failed:", error.message);
    return null;
  }
};

 const redisDelete = async (path) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Redis service DELETE failed:", error.message);
    return null;
  }
};

 const redisPatch = async (path, body = {}) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (error) {
    console.error("Redis service PATCH failed:", error.message);
    return null;
  }
};

module.exports = { redisPost, redisGet,redisDelete,redisPatch };

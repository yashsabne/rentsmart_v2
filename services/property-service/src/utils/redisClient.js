const REDIS_SERVICE_URL = process.env.REDIS_SERVICE_URL;

console.log(REDIS_SERVICE_URL,"this is redis url")

export const redisPost = async (path, body) => {
  try {
    const res = await fetch(`${REDIS_SERVICE_URL}/api/redis${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
 

    console.log("this is what we are fetching",`${REDIS_SERVICE_URL}/api/redis${path}`)

    return await res.json();
  } catch (error) {
    console.error("Redis service POST failed:", error.message);
    return null;
  }
};

export const redisGet = async (path) => {
  console.log("\n========== REDIS GET ==========");
  console.log("Path:", path);

  const url = `${REDIS_SERVICE_URL}/api/redis${path}`;

  console.log("URL:", url);

  // Detect bad requests
  if (path === "/cache" || path === "/cache/" || !path) {
    console.error("🚨 BAD CACHE REQUEST DETECTED");
    console.trace("Call Stack");
  }

  const start = Date.now();

  try {
    const res = await fetch(url);

    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log(`Request took ${Date.now() - start}ms`);

    const text = await res.text();

    console.log(
      "Response Preview:",
      text.substring(0, 300)
    );

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("❌ JSON Parse Failed");
      console.error("Raw Response:", text);
      return null;
    }
  } catch (error) {
    console.error("Redis service GET failed:", error.message);
    console.error(`Failed after ${Date.now() - start}ms`);
    console.trace("GET Error Trace");
    return null;
  }
};

export const redisDelete = async (path) => {
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

export const redisPatch = async (path, body = {}) => {
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


import "dotenv/config";

import express from "express";
import cors from "cors";
import { timingSafeEqual } from "node:crypto";

const app = express();

// Load application modules after environment variables.
const [{ default: notificationRoutes }, { emailWorker }, { default: redis }] =
  await Promise.all([
    import("./src/routes/notificationRoutes.js"),
    import("./src/workers/emailWorker.js"),
    import("./src/config/redis.js"),
  ]);

app.use(cors());
app.use(express.json());

app.post("/api/wakeup", (req, res) => {
  const configuredSecret = process.env.INTERNAL_NOTIFICATION_SECRET;
  const receivedSecret = req.get("x-internal-secret");

  if (!configuredSecret) {
    console.error("[NOTIFICATION SERVICE] Wake-up secret is not configured");
    return res.status(500).json({
      success: false,
      message: "Internal configuration error",
    });
  }

  if (!receivedSecret) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const expected = Buffer.from(configuredSecret);
  const received = Buffer.from(receivedSecret);

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  console.log("[NOTIFICATION SERVICE] Authenticated wake-up request received");

  return res.status(200).json({
    success: true,
    message: "Notification Service is awake",
  });
});

app.use("/api/notify", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Notification Service Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "notification-service",
  });
});

const PORT = process.env.PORT || 5003;

// Ensure the email worker connects before declaring startup complete.
await emailWorker.waitUntilReady();

console.log("[NOTIFICATION SERVICE] Email worker is ready");

const server = app.listen(PORT, () => {
  console.log(`[NOTIFICATION SERVICE] Running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`[NOTIFICATION SERVICE] Received ${signal}`);

  server.close(async () => {
    try {
      await emailWorker.close();
      await redis.quit();

      console.log("[NOTIFICATION SERVICE] Shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("[NOTIFICATION SERVICE] Shutdown error:", error);
      process.exit(1);
    }
  });
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

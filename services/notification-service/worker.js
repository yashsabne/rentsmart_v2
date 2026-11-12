
import "dotenv/config";

// Load the worker after environment variables are initialized.
const { emailWorker } = await import("./src/workers/emailWorker.js");

await emailWorker.waitUntilReady();

console.log("[NOTIFICATION SERVICE] Email worker is ready");

const shutdown = async (signal) => {
  console.log(`[NOTIFICATION SERVICE] Received ${signal}`);

  try {
    await emailWorker.close();
    console.log("[NOTIFICATION SERVICE] Worker shut down gracefully");
    process.exit(0);
  } catch (error) {
    console.error("[NOTIFICATION SERVICE] Shutdown error:", error.message);
    process.exit(1);
  }
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

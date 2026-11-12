
import "dotenv/config";
import { emailQueue } from "./src/queue/emailQueue.js";

try {
  const job = await emailQueue.add("TEST_NOTIFICATION", {
    message: "RentSmart BullMQ is working!",
  });

  console.log("Job added successfully!");
  console.log("Job ID:", job.id);
  console.log("Job Name:", job.name);

  const waitingJobs = await emailQueue.getWaiting();
  console.log("Waiting jobs:", waitingJobs.length);

} catch (error) {
  console.error("Queue test failed:", error.message);
} finally {
  await emailQueue.close();
  process.exit(0);
}


import { Queue } from "bullmq";
import { createHash } from "node:crypto";

import redis from "../config/redis.js";
import { encryptPayload } from "../utils/payloadEncryption.js";

import { wakeNotificationService } from "../utils/wakeNotificationService.js";


const EMAIL_QUEUE_NAME = "rentsmart-emails";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redis,
});

export const enqueueEmail = async (
  eventType,
  payload,
  idempotencyKey
) => {
  if (
    !eventType ||
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    !idempotencyKey
  ) {
    throw new Error("Invalid email job details");
  }

  const jobId = createHash("sha256")
    .update(`${eventType}:${idempotencyKey}`)
    .digest("hex");

  const encryptedPayload = encryptPayload(payload);

 
  const job = await emailQueue.add(eventType, encryptedPayload, {
  jobId,
  attempts: 5,
  backoff: { type: "exponential", delay: 5000 },
});

  console.log(`[AUTH] Email queued | Event: ${eventType} | Job: ${job.id}`);

 
void wakeNotificationService();

return job;
};

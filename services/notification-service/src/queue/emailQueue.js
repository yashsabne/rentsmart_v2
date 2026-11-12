
import { Queue } from "bullmq";
import redis from "../config/redis.js";

import { createHash } from "node:crypto";
import { encryptPayload } from "../utils/payloadEncryption.js";

export const EMAIL_QUEUE_NAME = "rentsmart-emails";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redis,

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      age: 3600,
      count: 1000,
    },

    removeOnFail: {
      age: 86400,
      count: 500,
    },
  },
});

emailQueue.on("error", (error) => {
  console.error("Email Queue Error:", error.message);
});



// Creates a stable BullMQ job ID for the same business event.
const createEmailJobId = (eventType, idempotencyKey) => {
  return createHash("sha256")
    .update(`${eventType}:${idempotencyKey}`)
    .digest("hex");
};


export const enqueueEmail = async (
  eventType,
  payload,
  idempotencyKey
) => {
  if (!eventType || !payload || !idempotencyKey) {
    throw new Error(
      "eventType, payload and idempotencyKey are required"
    );
  }

  const jobId = createEmailJobId(eventType, idempotencyKey);
 
  const encryptedPayload = encryptPayload(payload);

  return emailQueue.add(eventType, encryptedPayload, {
    jobId,
  });
};


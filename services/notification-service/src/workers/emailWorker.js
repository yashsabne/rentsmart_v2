
import { Worker, UnrecoverableError } from "bullmq";

import redis from "../config/redis.js";
import { generateEmail } from "../services/templateService.js";
import { sendEmail } from "../services/emailService.js";
import { decryptPayload } from "../utils/payloadEncryption.js";


const EMAIL_QUEUE_NAME = "rentsmart-emails";

const getRecipientName = (payload) => {
    return (
        payload.firstName ||
        payload.tenantName ||
        payload.ownerName ||
        payload.recipientName ||
        payload.name ||
        ""
    );
};

// Errors that should not consume BullMQ retry attempts.
const isPermanentHttpError = (statusCode) => {
    return (
        statusCode >= 400 &&
        statusCode < 500 &&
        ![408, 425, 429].includes(statusCode)
    );
};

export const emailWorker = new Worker(
    EMAIL_QUEUE_NAME,

    async (job) => {
        console.log(
            `[EMAIL_WORKER] Processing ${job.name} | Job: ${job.id}`
        );

        // Step 1: Validate and generate the email.
        let payload;
        let email;

        try {
            // Decrypt the payload received from Redis.
            payload = decryptPayload(job.data);

            // Generate the email using the decrypted payload.
            email = generateEmail(job.name, payload);
        } catch (error) {
            throw new UnrecoverableError(
                `Email payload processing failed: ${error.message}`
            );
        }
        // Step 2: Send the email through Brevo.
        try {
            const response = await sendEmail({
                to: email.to,
                name: getRecipientName(payload),
                subject: email.subject,
                html: email.html,
            });

            console.log(
                `[EMAIL_WORKER] Email accepted by Brevo | Job: ${job.id}`
            );

            return {
                success: true,
                messageId: response.messageId || null,
            };
        } catch (error) {
            // Permanent Brevo 4xx errors should not be retried.
            if (
                error.statusCode &&
                isPermanentHttpError(error.statusCode)
            ) {
                throw new UnrecoverableError(
                    `Permanent Brevo error (${error.statusCode}): ${error.message}`
                );
            }

            // Network errors, timeouts, 408, 425, 429 and 5xx
            // remain retryable by BullMQ.
            throw error;
        }
    },

    {
        connection: redis,
        concurrency: 5,
    }
);

emailWorker.on("completed", (job) => {
    console.log(
        `[EMAIL_WORKER] Completed | Job: ${job.id} | Event: ${job.name}`
    );
});

emailWorker.on("failed", (job, error) => {
    console.error(
        `[EMAIL_WORKER] Failed | Job: ${job?.id} | Event: ${job?.name} | Attempt: ${job?.attemptsMade} | Error: ${error.message}`
    );
});

emailWorker.on("error", (error) => {
    console.error("[EMAIL_WORKER] Worker error:", error.message);
});

console.log("[EMAIL_WORKER] Worker initialized");

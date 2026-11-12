import "dotenv/config";
import { enqueueEmail } from "./src/queue/emailQueue.js";

const payload = {
  email: "yashsabne39@gmail.com",
  tenantName: "Test Tenant",
  ownerName: "Test Owner",
  propertyTitle: "Encryption Test Property",
};

const job = await enqueueEmail(
  "PAYMENT_SUCCESS",
  payload,
  `encryption-test-${Date.now()}`
);

console.log("Job ID:", job.id);
console.log("Stored job data:", job.data);

process.exit(0);
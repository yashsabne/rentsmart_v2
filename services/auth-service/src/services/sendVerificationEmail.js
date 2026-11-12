
import { enqueueEmail } from "../queue/emailQueue.js";

export const sendVerificationEmail = async (
  email,
  firstName,
  verificationToken,
  idempotencyKey
) => {
  return enqueueEmail(
    "AUTH_VERIFICATION",
    {
      email,
      firstName,
      verificationToken,
    },
    idempotencyKey
  );
};

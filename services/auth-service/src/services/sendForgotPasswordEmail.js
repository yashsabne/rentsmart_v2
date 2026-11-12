
import { enqueueEmail } from "../queue/emailQueue.js";

export const sendForgotPasswordEmail = async (
  email,
  firstName,
  resetToken,
  idempotencyKey
) => {
  return enqueueEmail(
    "AUTH_PASSWORD_RESET",
    {
      email,
      firstName,
      resetToken,
    },
    idempotencyKey
  );
};

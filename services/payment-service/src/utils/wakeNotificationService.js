
export const wakeNotificationService = async () => {
  try {
    const serviceUrl = process.env.NOTIFICATION_SERVICE_URL;
    const secret = process.env.INTERNAL_NOTIFICATION_SECRET;

    if (!serviceUrl || !secret) {
      throw new Error("Notification Service URL or secret is missing");
    }

    const response = await fetch(
      `${serviceUrl.replace(/\/+$/, "")}/api/wakeup`,
      {
        method: "POST",
        headers: {
          "x-internal-secret": secret,
        },
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!response.ok) {
      throw new Error(`Wake-up failed with status ${response.status}`);
    }

    console.log("[PAYMENT] Notification Service wake-up successful");
  } catch (error) {
    console.error(
      "[PAYMENT] Notification Service wake-up failed:",
      error.message
    );
  }
};

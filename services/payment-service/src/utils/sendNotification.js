const NOTIFICATION_SERVICE_URL=process.env.NOTIFICATION_SERVICE_URL


export const sendNotification = async (endpoint, payload) => {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/api/notify/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.log("Notification Error:", err.message);
  }
};
const ACTIVITY_SERVICE_URL  = process.env.ACTIVITY_SERVICE_URL

export const logActivity = async (
  userId,
  type,
  meta = {}
) => {
  try {

    await fetch(
      `${ACTIVITY_SERVICE_URL}/api/activities`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          type,
          meta
        })
      }
    );

  } catch (error) {

    console.error(
      "Activity Service Error:",
      error.message
    );

  }
};
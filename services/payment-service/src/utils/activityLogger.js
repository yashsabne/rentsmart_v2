const ACTIVITY_SERVICE_URL = process.env.ACTIVITY_SERVICE_URL;

export const logActivity = async (
  userId,
  type,
  meta = {}
) => {
  try {
    const response = await fetch(
      `${ACTIVITY_SERVICE_URL}/api/activities`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          type,
          meta,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Activity Service Response:",
        response.status,
        data
      );
      return;
    }

    console.log(
      "Activity Logged:",
      type,
      "for",
      userId
    );

  } catch (error) {
    console.error(
      "Activity Service Error:",
      error.message
    );
  }
};
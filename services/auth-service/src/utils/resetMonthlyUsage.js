// utils/resetMonthlyUsage.js

export const resetMonthlyUsageIfNeeded = (user) => {
  const now = new Date();

  const lastReset = new Date(
    user.contactAccess.monthlyEmailResetAt
  );

  const isNewMonth =
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (isNewMonth) {
    user.contactAccess.monthlyEmailReveals = 0;
    user.contactAccess.monthlyEmailResetAt = now;
  }
};
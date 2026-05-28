export const keys = {
  cache: (identifier) => `cache:${identifier}`,
  session: (userId) => `session:${userId}`,
  otp: (target) => `otp:${target}`,
  rateLimit: (identifier) => `rate:${identifier}`,
  queue: (queueName) => `queue:${queueName}`,
  tokenBlacklist: (token) => `blacklist:${token}`,
  pubsub: (channel) => `channel:${channel}`,
};

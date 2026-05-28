import Redis from "ioredis";

const createPubSubClient = () =>
  new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  });

let publisher = null;
let subscriber = null;

export const getPublisher = () => {
  if (!publisher) {
    publisher = createPubSubClient();
    publisher.on("error", (err) => console.error("Publisher error:", err));
  }
  return publisher;
};

export const getSubscriber = () => {
  if (!subscriber) {
    subscriber = createPubSubClient();
    subscriber.on("error", (err) => console.error("Subscriber error:", err));
  }
  return subscriber;
};

export const publish = async (channel, payload) => {
  const pub = getPublisher();
  const message = JSON.stringify(payload);
  await pub.publish(channel, message);
};

export const subscribe = (channel, handler) => {
  const sub = getSubscriber();
  sub.subscribe(channel);
  sub.on("message", (ch, message) => {
    if (ch === channel) {
      try {
        handler(JSON.parse(message));
      } catch {
        handler(message);
      }
    }
  });
};

export const unsubscribe = async (channel) => {
  const sub = getSubscriber();
  await sub.unsubscribe(channel);
};

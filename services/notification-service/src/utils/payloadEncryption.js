
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const getEncryptionKey = () => {
  const key = process.env.EMAIL_PAYLOAD_ENCRYPTION_KEY;

  if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      "EMAIL_PAYLOAD_ENCRYPTION_KEY must be 64 hexadecimal characters"
    );
  }

  return Buffer.from(key, "hex");
};

export const encryptPayload = (payload) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);

  return {
    version: 1,
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
};

export const decryptPayload = (encryptedPayload) => {
  if (
    !encryptedPayload ||
    encryptedPayload.version !== 1 ||
    !encryptedPayload.iv ||
    !encryptedPayload.authTag ||
    !encryptedPayload.ciphertext
  ) {
    throw new Error("Invalid encrypted email payload");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(encryptedPayload.iv, "hex")
  );

  decipher.setAuthTag(
    Buffer.from(encryptedPayload.authTag, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(encryptedPayload.ciphertext, "hex")
    ),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8"));
};

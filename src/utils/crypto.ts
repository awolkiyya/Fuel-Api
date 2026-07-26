import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV is the recommended size for GCM
const KEY_LENGTH = 32; // AES-256 needs a 32-byte key

const KEY = Buffer.from(process.env.CAMERA_SECRET_KEY ?? "", "hex");

if (KEY.length !== KEY_LENGTH) {
  throw new Error(
    `CAMERA_SECRET_KEY must be a ${KEY_LENGTH * 2}-character hex string ` +
      `(${KEY_LENGTH} bytes) — got ${KEY.length} bytes. Check your env config.`
  );
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(value: string) {
  const [ivHex, authTagHex, encryptedHex] = value.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Malformed encrypted value — expected iv:authTag:ciphertext");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  // If the ciphertext was tampered with, or the key/IV is wrong,
  // this throws instead of returning corrupted data.
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
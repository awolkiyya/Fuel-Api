/* =========================================================
   ONE-TIME MIGRATION: re-encrypt camera passwords from the old
   AES-256-CBC format (iv:ciphertext) to the new AES-256-GCM
   format (iv:authTag:ciphertext).

   Run once: npx ts-node src/scripts/migrateCameraPasswords.ts
========================================================= */
import crypto from "crypto";
import prisma from "../config/db";
import { encrypt } from "../utils/crypto"; // the new GCM encrypt()

const KEY = Buffer.from(process.env.CAMERA_SECRET_KEY!, "hex");

// Old CBC decrypt, kept only for this migration — do not use elsewhere.
function legacyDecryptCbc(value: string): string {
  const [ivHex, encryptedHex] = value.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    KEY,
    Buffer.from(ivHex, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

async function main() {
  const cameras = await prisma.camera.findMany({
    where: { passwordEncrypted: { not: null } },
    select: { id: true, name: true, passwordEncrypted: true },
  });

  console.log(`Found ${cameras.length} camera(s) with a stored password.`);

  let migrated = 0;
  let alreadyNew = 0;
  let failed = 0;

  for (const camera of cameras) {
    const value = camera.passwordEncrypted!;
    const parts = value.split(":");

    if (parts.length === 3) {
      // Already iv:authTag:ciphertext — new format, nothing to do.
      alreadyNew++;
      continue;
    }

    try {
      const plainPassword = legacyDecryptCbc(value);
      const reEncrypted = encrypt(plainPassword);

      await prisma.camera.update({
        where: { id: camera.id },
        data: { passwordEncrypted: reEncrypted },
      });

      migrated++;
      console.log(`✅ Migrated: ${camera.name} (${camera.id})`);
    } catch (err: any) {
      failed++;
      console.error(`❌ Failed: ${camera.name} (${camera.id}) — ${err.message}`);
    }
  }

  console.log(
    `\nDone. Migrated: ${migrated}, already new format: ${alreadyNew}, failed: ${failed}`
  );
}

main()
  .catch((err) => {
    console.error("Migration script crashed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
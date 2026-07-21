import app from "./app";
import dotenv from "dotenv";
import { startLicenseExpiryJob } from "./jobs/licenseExpiry.job";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.NODE_ENV == "production"
  ? "0.0.0.0"
  : "192.168.3.1";

async function bootstrap() {
  try {
    // 1. Start background jobs FIRST
    startLicenseExpiryJob();
    

    // 2. Start HTTP server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at: http://${HOST}:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();
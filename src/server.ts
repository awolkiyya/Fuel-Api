import app from "./app";
import dotenv from "dotenv";
import { startLicenseExpiryJob } from "./jobs/licenseExpiry.job";

dotenv.config();


const PORT = Number(process.env.PORT) || 8080;

const HOST = "0.0.0.0";


async function bootstrap() {

  try {

    console.log("🚀 Starting Fuel API...");


    // Start background jobs
    startLicenseExpiryJob();



    const server = app.listen(PORT, HOST, () => {

      console.log(
        `✅ Server running on http://${HOST}:${PORT}`
      );

    });



    // Handle unexpected server errors
    server.on("error", (error) => {

      console.error("❌ Server error:", error);

      process.exit(1);

    });



    // Graceful shutdown
    const shutdown = () => {

      console.log("🛑 Shutting down server...");


      server.close(() => {

        console.log("✅ HTTP server closed");

        process.exit(0);

      });

    };



    process.on("SIGTERM", shutdown);

    process.on("SIGINT", shutdown);



  } catch (err) {

    console.error("❌ Failed to start server:", err);

    process.exit(1);

  }

}


bootstrap();
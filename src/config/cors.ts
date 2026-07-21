import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://localhost:3001"
];

export const corsConfig = cors({
  origin: (origin, callback) => {
    // allow server-to-server / curl / postman
    if (!origin) return callback(null, true);

    // allow localhost exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 🔥 allow ANY local network (192.168.x.x)
    if (/^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
});
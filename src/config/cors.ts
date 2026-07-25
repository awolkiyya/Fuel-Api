import cors from "cors";

const allowedOrigins = [
  "http://196.190.216.29",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://localhost:3001",
];

export const corsConfig = cors({
  origin: (origin, callback) => {
    // allow server-to-server / curl / postman
    if (!origin) {
      return callback(null, true);
    }

    // exact allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // allow local network development
    if (/^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
});
import express from "express";
import userRoutes from "./routes";
import { corsConfig } from "./config/cors";
import { sendError } from "./utils/apiError";
import { requestLogger } from "./middlewares/requestLogger";
import path from "path";


const app = express();


/* ---------------------------------------
   MIDDLEWARES
----------------------------------------*/

app.use(corsConfig);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);


/* ---------------------------------------
   ROUTES
----------------------------------------*/

app.use("/api", userRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Fuel System API Running 🚀"
  });
});


/* ---------------------------------------
   STATIC FILES
----------------------------------------*/

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);


/* ---------------------------------------
   GLOBAL ERROR HANDLER
----------------------------------------*/

app.use(
  (
    err: any,
    req: any,
    res: any,
    next: any
  ) => {

    return sendError(res, {
      message: err.message,
      statusCode: err.statusCode || 500,
      code: err.code || "INTERNAL_ERROR",
      details: err.errors || null,
    });

  }
);


export default app;
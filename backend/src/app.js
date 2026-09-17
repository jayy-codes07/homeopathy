import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes
// import userRoute from "./routes/user.route.js";
import patientRoute from "./routes/patient.route.js";
import followUpRoute from "./routes/followUP.route.js";
import doctorRoute from "./routes/doctor.route.js";
import { errorHandler } from "./middleware/error.middleware.js";
import ratelimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import mongoose from "mongoose";
import connectDB from "./db/db.js";

const app = express();
app.set('trust proxy', 1)
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
const limiter = ratelimit({
  windowMs: 1000 * 60,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "you hit rate limit try after some seconds",
  validate: { xForwardedForHeader: false }, 
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express 5 exposes req.query as a read-only getter, so sanitize in place.
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.headers) mongoSanitize.sanitize(req.headers);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

app.use(compression());
app.use(limiter);
app.use(cookieParser());
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Homeopathy API is running",
  });
});

// Kept free of any DB dependency so it answers even when Mongo is unreachable.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    db: mongoose.connection.readyState === 1,
  });
});

// Vercel loads app.js directly and never runs index.js, so the connection is
// established lazily on the first request that actually needs the database.
app.use("/api/v1", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api/v1/patient", patientRoute);
app.use("/api/v1/doctor", doctorRoute);
app.use("/api/v1/followup", followUpRoute);
app.use(errorHandler);

export { app };
// Vercel's Node runtime imports this module and requires the default export to
// be a request handler; an Express app is exactly that.
export default app;

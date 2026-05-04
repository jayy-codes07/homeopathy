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

const app = express();
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
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorHandler);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Homeopathy API is running",
  });
});

// app.use("/api/v1/user", userRoute);
app.use("/api/v1/patient", patientRoute);
app.use("/api/v1/doctor", doctorRoute);
app.use("/api/v1/followup", followUpRoute);

export { app };

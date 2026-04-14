import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes
// import userRoute from "./routes/user.route.js";
import patientRoute from "./routes/patient.route.js";
import followUpRoute from "./routes/followUP.route.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Homeopathy API is running",
  });
});

// app.use("/api/v1/user", userRoute);
app.use("/api/v1/patient", patientRoute);
app.use("/api/v1/followup", followUpRoute);

export { app };

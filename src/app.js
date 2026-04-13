import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";

const app = express();
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Homeopathy API is running",
  });
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/v1/user", userRoute);


export { app };
import { Router } from "express";
import { registerPatient } from "../controllers/patient.controller.js";

const router = Router();

router.route("/register").post(registerPatient);

export default router;

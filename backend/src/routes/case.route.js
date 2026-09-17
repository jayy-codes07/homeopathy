import { Router } from "express";
import { createCase, getPatientCases } from "../controllers/case.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-case/:patientId").post(verifyJWT, createCase);
router.route("/patient-case/:patientId").get(verifyJWT, getPatientCases);

export default router;

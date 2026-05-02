import { Router } from "express";
import {
  createFollowup,
  getPatientFollowup,
  updatePatientFollowup,
} from "../controllers/followUP.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-followup/:patientId").post(verifyJWT, createFollowup);
router.route("/patient-followup/:patientId").get(verifyJWT, getPatientFollowup);
router.route("/patient-followup/:followupId").patch(verifyJWT, updatePatientFollowup);

export default router;

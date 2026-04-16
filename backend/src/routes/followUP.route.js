import { Router } from "express";
import {
  createFollowup,
  getPatientFollowup,
  updatePatientFollowup,
} from "../controllers/followUP.controller.js";

const router = Router();

router.route("/create-followup/:patientId").post(createFollowup);
router.route("/patient-followup/:patientId").get(getPatientFollowup);
router.route("/patient-followup/:followupId").patch(updatePatientFollowup);

export default router;

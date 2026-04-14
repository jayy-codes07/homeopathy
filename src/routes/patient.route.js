import { Router } from "express";
import {
  registerPatient,
  fetchAllPatient,
  findOnePatient,
  updatePatientDetails,
  deletePatient,
} from "../controllers/patient.controller.js";

const router = Router();

router.route("/register").post(registerPatient);
router.route("/all-patient").get(fetchAllPatient);
router.route("/:patientId").get(findOnePatient);
router.route("/:patientId").patch(updatePatientDetails);
router.route("/:patientId").delete(deletePatient);

export default router;

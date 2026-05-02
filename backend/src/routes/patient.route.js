import { Router } from "express";
import {
  registerPatient,
  fetchAllPatient,
  findOnePatient,
  updatePatientDetails,
  deletePatient,
  searchPatient,
} from "../controllers/patient.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT, registerPatient);
router.route("/all-patient").get(verifyJWT, fetchAllPatient);
router.route("/search").get(verifyJWT, searchPatient);
router.route("/:patientId").get(verifyJWT, findOnePatient);
router.route("/:patientId").patch(verifyJWT, updatePatientDetails);
router.route("/:patientId").delete(verifyJWT, deletePatient);

export default router;

import { Router } from "express";

import {
  registerDoctor,
  loginDoctor,
  updateDoctorPassword,
  updateDoctorAvatar,
  updateDoctorDetails,
  DeleteDoctor,
} from "../controllers/doctor.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.route("/register").post(upload.single("avatar"), registerDoctor);
router.route("/login").post(loginDoctor);
router.route("/Password/:doctorId").patch(verifyJWT, updateDoctorPassword);
router.route("/Details/:doctorId").patch(verifyJWT, updateDoctorDetails);
router
  .route("/Avatar/:doctorId")
  .patch(verifyJWT, upload.single("avatar"), updateDoctorAvatar);
router.route("/doctor/:doctorId").delete(verifyJWT, DeleteDoctor);

export default router;

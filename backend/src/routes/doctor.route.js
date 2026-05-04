import { Router } from "express";

import {
  registerDoctor,
  loginDoctor,
  updateDoctorPassword,
  updateDoctorAvatar,
  updateDoctorDetails,
  DeleteDoctor,
  logoutDoctor,
  refreshAccessToken,
} from "../controllers/doctor.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerDoctor);
router.route("/login").post(loginDoctor);
router.route("/logout").post(verifyJWT, logoutDoctor);
router.route("/generateToken").post(refreshAccessToken);
router.route("/Password/:doctorId").patch(verifyJWT, updateDoctorPassword);
router.route("/Details/:doctorId").patch(verifyJWT, updateDoctorDetails);
router
  .route("/Avatar/:doctorId")
  .patch(verifyJWT, upload.single("avatar"), updateDoctorAvatar);
router.route("/doctor/:doctorId").delete(verifyJWT, DeleteDoctor);

export default router;

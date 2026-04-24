import { isValidObjectId } from "mongoose";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utility/apiError.js";
import { ApiResponse } from "../utility/apiResponse.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { uploadtocloudinary } from "../utility/cloudinary.js";

const registerDoctor = asyncHandler(async (req, res) => {
  const { fullname, email, password, degree } = req.body;

  // const { avatar } = req?.file;

  if (
    !fullname?.trim() ||
    !email?.trim() ||
    !password?.trim() ||
    !degree?.trim()
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existingDoctor = await Doctor.findOne({ email: email.trim() });

  if (existingDoctor) {
    throw new ApiError(400, "this email is already used");
  }

  let upload = {
    fullname: fullname.trim(),
    email: email.trim(),
    password: password.trim(),
    degree: degree.trim(),
  };

  if (req?.file?.path) {
    const uploadedAvatar = await uploadtocloudinary(req?.file?.path);
    upload = { ...upload, avatar: uploadedAvatar?.url };
  }

  const doctor = await Doctor.create(upload);

  const createdDoctor = await Doctor.findById(doctor._id).select(
    "-password -refreshToken",
  );
  if (!createdDoctor) {
    throw new ApiError(500, "problem in registering doctor");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdDoctor, "doctor registered successfully"),
    );
});

const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, "provide email and password");
  }

  const findDoctor = await Doctor.findOne({ email: email?.trim() });

  if (!findDoctor) {
    throw new ApiError(400, "this email is not in database");
  }

  const validatePassword = await findDoctor.isPasswordCorrect(password);
  if (!validatePassword) {
    throw new ApiError(400, "password is incorrect provide valid password");
  }

  const Accesstoken = await findDoctor.generateAccesstoken();
  const RefreshToken = await findDoctor.generateRefreshToken();

  const doctor = await Doctor.findByIdAndUpdate(
    findDoctor?._id,
    { refreshToken: RefreshToken },
    { new: true },
  ).select("-password -refreshToken");

  const cookieOption = { httpOnly: true, secure: true };
  res
    .status(200)
    .cookie("Accesstoken", Accesstoken, cookieOption)
    .cookie("refreshToken", RefreshToken, cookieOption)

    .json(
      new ApiResponse(
        200,
        { doctor, Accesstoken, RefreshToken },
        "doctor logged successfully ",
      ),
    );
});

const updateDoctorDetails = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { fullname, email, degree } = req.body;

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "provide valid doctorId");
  }
  let update = {};

  if (fullname?.trim()) {
    update = { ...update, fullname: fullname?.trim() };
  }

  if (email?.trim()) {
    update = { ...update, email: email?.trim() };
  }

  if (degree?.trim()) {
    update = { ...update, degree: degree?.trim() };
  }

  const doctor = await Doctor.findByIdAndUpdate(doctorId, update, {
    new: true,
  }).select("-password -refreshToken");

  if (!doctor) {
    throw new ApiError(404, "doctor does not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, doctor, "doctor details updated successfully"));
});

const updateDoctorPassword = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const { password } = req.body;

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "provide valid doctor id");
  }

  if (!password.trim()) {
    throw new ApiError(400, "provide password");
  }
  const existDoctor = await Doctor.findById(doctorId);

  if (!existDoctor) {
    throw new ApiError(400, "doctor does not exist");
  }

  existDoctor.password = password.trim();

  await existDoctor.save();
  const updatedDoctor = await Doctor.findById(doctorId).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, "password updated successfully"));
});

const updateDoctorAvatar = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "provide valid doctor id");
  }

  if (!req?.file?.path) {
    throw new ApiError(400, "file is not provided");
  }

  const uploadedAvatar = await uploadtocloudinary(req?.file?.path);

  if (!uploadToLocal?.url) {
    throw new ApiError(500, "problem in saving image to local");
  }

  if (!uploadedAvatar) {
    throw new ApiError(500, "problem in uploading to cloudinary");
  }
  const uploading = { avatar: uploadedAvatar?.url };

  const doctor = await Doctor.findByIdAndUpdate(doctorId, uploading, {
    new: true,
  }).select("-password -refreshToken");

  if (!doctor) {
    throw new ApiError(500, "problem in updating database ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Avatar updated successfully"));
});

const DeleteDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "provide valid doctor id");
  }

  const doctor = await Doctor.findByIdAndDelete(doctorId);

  if (!doctor) {
    throw new ApiError(404, "this doctor does not exist in database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "doctor deleted successfully"));
});

export {
  registerDoctor,
  loginDoctor,
  updateDoctorPassword,
  updateDoctorAvatar,
  updateDoctorDetails,
  DeleteDoctor,
};

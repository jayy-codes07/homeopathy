import jwt from "jsonwebtoken"
import { ApiError } from "../utility/apiError.js"
import { Doctor } from "../models/doctor.model.js"
import { asyncHandler } from "../utility/asyncHandler.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req?.cookies.Accesstoken

    if (!token) {
        throw new ApiError(400, "unauthorized user")
    }


    const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!verifyToken) {
        throw new ApiError(400, "Accesstoken is incorrect")
    }
    const userid = verifyToken?.id

    const doctor = await Doctor.findById(userid).select('-password -refreshToken')

    if (!doctor) {
        throw new ApiError(400, "doctor does not found")
    }

    req.doctor = doctor

    next()
})
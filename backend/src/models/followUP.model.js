import mongoose from "mongoose";
// import { Patient } from "./patient.model";

const followupSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    followUpDate: {
      required: true,
      type: Date,
    },
    symptoms: {
      required: true,
      type: String,
    },
    advise: {
      required: true,
      type: String,
    },
    medicine: {
      required: true,
      type: String,
    },
  },
  { timestamps: true },
);

export const FollowUP = mongoose.model("FollowUP", followupSchema);

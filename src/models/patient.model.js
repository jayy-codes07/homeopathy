import mongoose from "mongoose";

const PatientSchema = mongoose.Schema(
  {
    PatientName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medicine: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    diet: {
      type: String,
      enum: ["VEG", "NON VEG", "MIXED"],
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    familySize: Number,
    occupation: String,
    followUpDate: Date,
  },
  { timestamps: true },
);

export const Patient = mongoose.model("Patient", PatientSchema);

import mongoose from "mongoose";

const PatientSchema = mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", 
      required: true,
    },
    patientName: {
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
      trim: true,
    },
    
    familySize: Number,
    occupation: String,
    followUpDate: Date,
  },
  { timestamps: true },
);

PatientSchema.index({ doctor: 1, phoneNumber: 1 }, { unique: true });

export const Patient = mongoose.model("Patient", PatientSchema);
import bcrypt, { hash } from "bcrypt";
import mongoose from "mongoose";

const doctorSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

doctorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Doctor = mongoose.model("Doctor", doctorSchema);

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionToDB = await mongoose.connect(process.env.MONGODB_URI);
    console.log("mongoDB connected SuccessFully");
    console.log(`database => ${connectionToDB.connection.host}`);
  } catch (error) {
    console.log("mongoDB connection failed", error);
    throw error;
  }
};

export default connectDB;

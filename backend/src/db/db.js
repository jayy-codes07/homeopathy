import mongoose from "mongoose";

// Reused across warm serverless invocations so each request does not open a
// new connection. On a normal server this simply runs once at boot.
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    if (!connectionPromise) {
      connectionPromise = mongoose.connect(process.env.MONGODB_URI);
    }
    const connectionToDB = await connectionPromise;
    console.log("mongoDB connected SuccessFully");
    console.log(`database => ${connectionToDB.connection.host}`);
  } catch (error) {
    connectionPromise = null;
    console.log("mongoDB connection failed", error);
    throw error;
  }
};

export default connectDB;

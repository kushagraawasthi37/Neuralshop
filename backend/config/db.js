import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected Successfully");
  } catch (error) {
    console.log("MongoDb Connection failed");
  }
};


export default connectDB;
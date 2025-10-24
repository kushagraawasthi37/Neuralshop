import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

app.use(
  cors({
    origin: process.env.FROTNEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

//Body se data json format mai ayega
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import isAuth from "./middlewares/isAuth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

console.log(process.env.FRONTEND_URL_USER);
console.log(process.env.FRONTEND_URL_ADMIN);
app.use(
  cors({
    origin: [process.env.FRONTEND_URL_USER, process.env.FRONTEND_URL_ADMIN],
    credentials: true,
  })
);

//Body se data json format mai ayega
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

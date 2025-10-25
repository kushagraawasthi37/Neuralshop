import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // exact secret from dashboard
  });

  // Debug: Check configuration
  console.log("Cloudinary Config Check:", {
    cloud_name: process.env.CLOUDINARY_NAME ? "✓" : "✗ MISSING",
    api_key: process.env.CLOUDINARY_API_KEY ? "✓" : "✗ MISSING",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "✓" : "✗ MISSING",
    api_secret_length: process.env.CLOUDINARY_API_SECRET?.length || 0,
  });

  try {
    if (!filePath) {
      console.log("No file path provided");
      return null;
    }

    console.log("Uploading file:", filePath);
    const uploadResult = await cloudinary.uploader.upload(filePath);
    console.log("Upload successful:", uploadResult.secure_url);

    fs.unlinkSync(filePath);
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null; // Return null instead of just logging
  }
};

export default uploadOnCloudinary;

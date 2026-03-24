import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "./environment.config.js";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: config.cloudinary.name,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  console.log("Cloudinary Config Check:", {
    cloud_name: config.cloudinary.name ? "✓" : "✗ MISSING",
    api_key: config.cloudinary.apiKey ? "✓" : "✗ MISSING",
    api_secret: config.cloudinary.apiSecret ? "✓" : "✗ MISSING",
    api_secret_length: config.cloudinary.apiSecret?.length || 0,
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
    return null;
  }
};

export default uploadOnCloudinary;

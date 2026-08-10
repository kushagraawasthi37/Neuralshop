import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";


// Instead of storing uploaded files permanently, they are temporarily saved in the OS temp folder before being processed or uploaded to cloud storage (e.g., Cloudinary or S3).
const uploadDir = path.join(os.tmpdir(), "neuralshop-uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export default upload;

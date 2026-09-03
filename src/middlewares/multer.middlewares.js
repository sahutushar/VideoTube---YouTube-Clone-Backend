// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "/public/temp");
//   },
//   filename: function (req, file, cb) {
//     // todo for us
//     // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname.originalname);
//   },
// });

// export const upload = multer({
//     storage
// })

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload folder path
const uploadPath = path.join(__dirname, "../uploads");

// Ensure the folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // ✅ This must be a valid string path
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });
export default upload;


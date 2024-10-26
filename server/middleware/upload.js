import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName, maxCount) => {
  return upload.array(fieldName, maxCount);
};

export default upload;

import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_PROFILE_IMAGE_SIZE_BYTES) || 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file?.mimetype?.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Only image files are allowed."));
  },
});

export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName, maxCount) => {
  return upload.array(fieldName, maxCount);
};

export default upload;

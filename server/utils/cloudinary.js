import axios from "axios";
import crypto from "crypto";

const getCloudinaryConfig = () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  defaultFolder: process.env.CLOUDINARY_FOLDER || "healthcare/profile-images",
});

export const isCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
};

const buildSignature = (params, apiSecret) => {
  const signaturePayload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${signaturePayload}${apiSecret}`).digest("hex");
};

export const uploadImageBuffer = async (
  buffer,
  { folder, publicId, mimeType = "image/jpeg" } = {},
) => {
  if (!buffer) {
    throw new Error("Missing image buffer for upload.");
  }

  const { cloudName, apiKey, apiSecret, defaultFolder } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const uploadFolder = folder || defaultFolder;
  const signatureParams = {
    timestamp,
    folder: uploadFolder,
    ...(publicId ? { public_id: publicId } : {}),
  };

  const signature = buildSignature(signatureParams, apiSecret);
  const fileData = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const payload = new URLSearchParams({
    file: fileData,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
    folder: uploadFolder,
    ...(publicId ? { public_id: publicId } : {}),
  });

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await axios.post(endpoint, payload.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return {
      secureUrl: response.data?.secure_url,
      publicId: response.data?.public_id,
    };
  } catch (error) {
    const uploadError =
      error?.response?.data?.error?.message || error.message || "Cloudinary upload failed.";
    throw new Error(uploadError);
  }
};

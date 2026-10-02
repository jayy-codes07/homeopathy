import { v2 as cloudinary } from "cloudinary";
import { unlink } from "node:fs/promises";

// Uploads a file Multer wrote to disk and returns Cloudinary's upload result
// (callers read `.url`). The temp file is removed whether or not the upload
// succeeded; an upload failure is thrown so the caller can answer with a 500.
export const uploadtocloudinary = async function (localPath) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  try {
    return await cloudinary.uploader.upload(localPath);
  } finally {
    await unlink(localPath).catch(() => {});
  }
};

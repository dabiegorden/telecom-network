import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {String} folder - Cloudinary folder name
 * @returns {Object} - Upload result with secure_url
 */
export const uploadToCloudinary = async (
  filePath,
  folder = "telecom-network",
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Public ID of the image
 * @returns {Object} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

export default cloudinary;

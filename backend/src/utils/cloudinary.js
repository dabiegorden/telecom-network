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
 * Upload a file to Cloudinary.
 *
 * Accepts either an in-memory Buffer (multer.memoryStorage) or a file path
 * string (multer.diskStorage). On serverless platforms like Vercel the
 * filesystem is read-only except for /tmp, so memory buffers are preferred.
 *
 * @param {Buffer|String} file - File buffer or path to the file
 * @param {String} folder - Cloudinary folder name
 * @param {Object} [options] - Extra Cloudinary upload options (e.g. resource_type)
 * @returns {Promise<{url: String, publicId: String}>}
 */
export const uploadToCloudinary = async (
  file,
  folder = "telecom-network",
  options = {},
) => {
  try {
    const uploadOptions = {
      folder,
      resource_type: "auto",
      ...options,
    };

    let result;
    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, res) => (error ? reject(error) : resolve(res)),
        );
        stream.end(file);
      });
    } else {
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudinary.
 *
 * @param {String} publicId - Public ID of the asset
 * @param {String} [resourceType] - "image" | "raw" | "video"
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

export default cloudinary;

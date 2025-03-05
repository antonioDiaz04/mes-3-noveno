const cloudinary = require("cloudinary").v2;
const fs = require("fs-extra");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (
  filePath,
  folder = process.env.CARPETA_CLOUDINARY
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    await fs.unlink(filePath); // Eliminar el archivo local después de subirlo
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    logger.error("Error al subir la imagen a Cloudinary:", error);
    console.error("Error al subir la imagen a Cloudinary:", error);
    throw new Error("Error al subir la imagen");
  }
};

// Función para eliminar una imagen de Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error("Error al eliminar la imagen de Cloudinary:", error);
    console.error("Error al eliminar la imagen de Cloudinary:", error);
    throw new Error("Error al eliminar la imagen de Cloudinary");
  }
};

module.exports = { cloudinary, uploadImage, deleteImage };

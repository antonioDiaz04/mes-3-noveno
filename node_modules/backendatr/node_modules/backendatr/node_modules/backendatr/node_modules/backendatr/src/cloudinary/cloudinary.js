// primer paso instalar cloudinary xd y despues ya continuar
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//Funcion para subir archivos a cloudinary
async function uploadImage(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    folder: process.env.CLOUDINARY_FOLDER,
    crop: "limit",
  });
}

//funcion para eliminar imagenes
async function deleteImage(publicId) {
  return await cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadImage, deleteImage };
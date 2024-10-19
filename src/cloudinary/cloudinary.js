// primer paso instalar cloudinary xd y despues ya continuar
import { v2 as cloudinary } from "cloudinary";

//mis datos del cloudinary
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,CLOUDINARY_FOLDER,
} from "../config.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

//Funcion para subir archivos a cloudinary
export async function uploadImage(filePath) {
  return await cloudinary.uploader.upload(filePath, {
    // folder: myfolder,
    folder: CLOUDINARY_FOLDER,
    crop: "limit",
  });
}

//funcion para eliminar imagenes
export async function deleteImage(publicId) {
  return await cloudinary.uploader.destroy(publicId);
}

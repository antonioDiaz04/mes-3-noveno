//importamos nuestras funciones personalizadas (crud) xd
import { uploadImage, deleteImage } from "../util/cloudinary.js";
import fs from "fs-extra";

export const eliminarImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagenesParaEliminar } = req.body;

    // Verifica si se proporcionan imágenes para eliminar
    if (!imagenesParaEliminar || !Array.isArray(imagenesParaEliminar)) {
      return res
        .status(400)
        .json({ mensaje: "No se proporcionaron imágenes para eliminar" });
    }

    // Busca el informe técnico por ID
    const informe = await InformeTecnico.findById(id);
    if (!informe) {
      return res.status(404).json({ mensaje: "Informe técnico no encontrado" });
    }

    // Elimina las imágenes de Cloudinary
    for (const imagen of imagenesParaEliminar) {
      try {
        await deleteImage(imagen.public_id);
      } catch (error) {
        console.error("Error al eliminar la imagen de Cloudinary:", error);
        return res
          .status(500)
          .json({ mensaje: "Error al eliminar una de las imágenes" });
      }
    }

    // Actualiza el informe técnico para remover las imágenes eliminadas
    informe.informe.solicitud.imagenes =
      informe.informe.solicitud.imagenes.filter(
        (img) =>
          !imagenesParaEliminar.some(
            (elimImg) => elimImg.public_id === img.public_id
          )
      );

    // Guarda los cambios en la base de datos
    await informe.save();
    res.status(200).json({ mensaje: "Imágenes eliminadas correctamente" });
  } catch (error) {
    console.error("Error al eliminar imágenes del informe técnico:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};
export const subirImagenes = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica si se han proporcionado archivos en la solicitud
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ mensaje: "No se proporcionaron imágenes para subir" });
    }

    // Busca el informe técnico por ID
    const informe = await InformeTecnico.findById(id);
    if (!informe) {
      return res.status(404).json({ mensaje: "Informe técnico no encontrado" });
    }

    const imagenes = [];
    const fileKeys = Object.keys(req.files);

    // Procesa y sube cada archivo
    for (const key of fileKeys) {
      const file = req.files[key];
      try {
        const result = await uploadImage(file.tempFilePath || file.path);
        imagenes.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
        await fs.unlink(file.tempFilePath || file.path); // Elimina el archivo temporal después de subirlo
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        return res
          .status(500)
          .json({ mensaje: "Error al procesar una de las imágenes" });
      }
    }

    // Actualiza el informe técnico con las nuevas imágenes
    informe.informe.solicitud.imagenes = [
      ...informe.informe.solicitud.imagenes,
      ...imagenes,
    ];

    // Guarda los cambios en la base de datos
    await informe.save();
    res
      .status(200)
      .json({ mensaje: "Imágenes subidas correctamente", imagenes });
  } catch (error) {
    console.error("Error al subir imágenes al informe técnico:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

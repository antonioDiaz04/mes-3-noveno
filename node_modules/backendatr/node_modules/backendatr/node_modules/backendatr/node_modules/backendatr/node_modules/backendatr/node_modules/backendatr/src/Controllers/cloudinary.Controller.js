// Importamos nuestras funciones personalizadas (CRUD)
const { v2: cloudinary } = require("cloudinary");
const {deleteImage,uploadImage } = require("../cloudinary/cloudinary");
const fs = require("fs-extra");

// Función de prueba para subir imágenes
exports.pruebaSubirImagen = async (req, res) => {

  console.log(req)
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ mensaje: "No se proporcionaron imágenes para subir" });
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

    console.log("todo correcto");
    res
      .status(200)
      .json({ mensaje: "Imágenes subidas correctamente", imagenes });
  } catch (error) {
    console.error("Error del servidor:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

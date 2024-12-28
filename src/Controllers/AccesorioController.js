// const { v2: cloudinary } = require("cloudinary");
// const { uploadImage } = require("../cloudinary/cloudinary");
const fs = require("fs-extra");
const Accesorio = require("../Models/AccesorioModel"); // Asegúrate de importar tu modelo de Accesorio
// import path from 'path'
// Importa multerConfig
const upload = require('../Midlewares/multer');


const cloudinary = require("cloudinary").v2;
// const Accesorio = require("../models/Accesorio"); // Importa el modelo de Accesorio
// const fs = require("fs/promises");

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "dvvhnrvav",
  api_key: "982632489651298",
  api_secret: "TTIZcgIMiC8F4t8cE-t6XkQnPyQ",
});

// const fs = require('fs').promises; // Asegúrate de usar 'fs/promises' para funciones asíncronas
// const cloudinary = require('cloudinary').v2;
// const Accesorio = require('../models/Accesorio'); // Asegúrate de que la ruta del modelo sea correcta
exports.crearAccesorio = async (req, res) => {
  try {
    // Imprimir el contenido de req para depuración
    console.log("Contenido de req.body:", req.body);
    console.log("Contenido de req.file:", req.file);
    
    // // Verificar si se está enviando una imagen principal
    // if (!req.file || !req.file.imagenPrincipal) {
    // console.log("No se ha proporcionado una imagen principal del accesorio.")
    //   return res.status(400).json({ message: 'No se ha proporcionado una imagen principal del accesorio.' });
    // }

    const imagenPrincipalFile = req.file;

    // Subir la imagen a Cloudinary
    const resultadoCloudinary = await cloudinary.uploader.upload(imagenPrincipalFile.path, {
      folder: "Accesorios",
    });

    // Crea un nuevo objeto de Accesorio con los datos del cuerpo
    const accesorio = new Accesorio({
      nombre: req.body.nombre,
      imagenPrincipal: resultadoCloudinary.url,
      estado: {
        disponible: req.body.disponible, // Asegúrate de que 'disponible' esté en el cuerpo
      },
    });

    // Guardar el Accesorio en la base de datos
    const resultadoAccesorio = await accesorio.save();

    // Eliminar el archivo temporal de la imagen principal
    await fs.unlink(imagenPrincipalFile.path);

    // Enviar la respuesta con el Accesorio creado
    res.status(201).json({ message: "Accesorio creado exitosamente", accesorio: resultadoAccesorio });
  } catch (error) {
    console.error("Error al crear el Accesorio:", error);
    res.status(500).json({ error: "Ocurrió un error al crear el Accesorio." });
  }
};




exports.editarAccesorio = async (req, res) => {

  
  try {
    const { imagenPrincipal, otrasImagenes, ...AccesorioData } = req.body;

    // Subir y actualizar imagen principal si se proporciona una nueva
    if (imagenPrincipal) {
      const result = await uploadImage(
        imagenPrincipal.tempFilePath || imagenPrincipal.path
      );
      AccesorioData.imagenPrincipal = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
      await fs.unlink(imagenPrincipal.tempFilePath || imagenPrincipal.path);
    }

    // Subir y actualizar las otras imágenes si se proporcionan nuevas
    if (otrasImagenes && Array.isArray(otrasImagenes)) {
      AccesorioData.otrasImagenes = [];
      for (const imagen of otrasImagenes) {
        const result = await uploadImage(imagen.tempFilePath || imagen.path);
        AccesorioData.otrasImagenes.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
        await fs.unlink(imagen.tempFilePath || imagen.path);
      }
    }

    // Actualizar el Accesorio en la base de datos
    const AccesorioActualizado = await Accesorio.findByIdAndUpdate(
      req.params.id,
      AccesorioData,
      { new: true, runValidators: true }
    );

    if (!AccesorioActualizado) {
      return res.status(404).json({ message: "Accesorio no encontrado" });
    }

    res.status(200).json(AccesorioActualizado);
  } catch (error) {
    console.error("Error al editar el Accesorio:", error);
    res.status(500).json({ message: "Error al editar el Accesorio", error });
  }
};

// Eliminar un Accesorio
exports.eliminarAccesorio = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Accesorio.deleteOne({ _id: id });
    res.status(200).json({ message: "Accesorio eliminado con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor: " + error);
  }
};


// Obtener todos los Accesorios
exports.obtenerAccesorio = async (req, res) => {
  try {
    const Accesorios = await Accesorio.find();
    res.status(200).json(Accesorios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los Accesorios", error });
  }
};
// Obtener todos los Accesorios
exports.obtenerAccesorioById = async (req, res) => {
  try {
    // Obtener el ID del Accesorio desde los parámetros de la ruta
    const AccesorioId = req.params.id;

    // Buscar el Accesorio por su ID en la base de datos
    const Accesorio = await Accesorio.findById(AccesorioId);

    // Enviar la respuesta con el Accesorio encontrado
    res.status(200).json(Accesorio);
  } catch (error) {
    // En caso de error, enviar una respuesta con código 500 y el mensaje de error
    res.status(500).json({ message: "Error al obtener los detalles del Accesorio", error });
  }
};

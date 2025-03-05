const fs = require("fs-extra");
const Accesorio = require("../Models/AccesorioModel");
const { uploadImage, deleteImage } = require("../cloudinary/cloudinaryConfig");
const sanitizeObject = require("../util/sanitize");
const {logger} = require("../util/logger");

// Crear un accesorio
exports.crearAccesorio = async (req, res) => {
  try {
    if (!req.file) {
      logger.warn("No se proporcionó imagen principal.");
      return res
        .status(400)
        .json({ error: "Debe proporcionar una imagen principal." });
    }

    const resultadoCloudinary = await uploadImage(req.file.path);
    const {nombre, disponible}= sanitizeObject(req.body);

    // Crear accesorio
    const accesorio = new Accesorio({
      nombre: nombre,
      imagenPrincipal: {
        public_id: resultadoCloudinary.public_id,
        secure_url: resultadoCloudinary.secure_url,
      },
      estado: {
        disponible: disponible,
      },
    });

    const resultadoAccesorio = await accesorio.save();

    // Eliminar archivo temporal
    await fs.unlink(req.file.path);

    res.status(201).json({
      message: "Accesorio creado exitosamente",
      accesorio: resultadoAccesorio,
    });
  } catch (error) {
    logger.error("Error al crear el Accesorio:", error);
    res.status(500).json({
      message: "Ocurrió un error al crear el Accesorio.",
      error: error.message,
    });
  }
};

// Editar un accesorio
exports.editarAccesorio = async (req, res) => {
  try {
    const accesorioExistente = await Accesorio.findById(req.params.id);
    if (!accesorioExistente) {
      logger.warn(`Accesorio con ID ${req.params.id} no encontrado.`);
      return res.status(404).json({ message: "Accesorio no encontrado" });
    }

    // Manejo de imagen principal
    if (req.file) {
      if (accesorioExistente.imagenPrincipal?.public_id) {
        await deleteImage(accesorioExistente.imagenPrincipal.public_id);
      }

      const result = await uploadImage(req.file.path);
      req.body.imagenPrincipal = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
      await fs.unlink(req.file.path);
    }

    const sanitizedData = sanitizeObject(req.body);

    // Actualizar accesorio
    const accesorioActualizado = await Accesorio.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Accesorio actualizado correctamente",
      accesorio: accesorioActualizado,
    });
  } catch (error) {
    logger.error("Error al editar el Accesorio:", error);
    res
      .status(500)
      .json({ message: "Error al editar el Accesorio.", error: error.message });
  }
};

// Eliminar un accesorio
exports.eliminarAccesorio = async (req, res) => {
  try {
    const accesorio = await Accesorio.findById(req.params.id);
    if (!accesorio) {
      logger.warn(`Accesorio con ID ${req.params.id} no encontrado.`);
      return res.status(404).json({ message: "Accesorio no encontrado" });
    }

    if (accesorio.imagenPrincipal?.public_id) {
      await deleteImage(accesorio.imagenPrincipal.public_id);
    }

    await Accesorio.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Accesorio eliminado con éxito." });
  } catch (error) {
    logger.error("Error al eliminar el Accesorio:", error);
    res.status(500).json({
      message: "Error en el servidor al eliminar el accesorio.",
      error: error.message,
    });
  }
};

// Obtener todos los accesorios
exports.obtenerAccesorios = async (req, res) => {
  try {
    const accesorios = await Accesorio.find();

    res.status(200).json(accesorios);
  } catch (error) {
    logger.error("Error al obtener los accesorios:", error);
    res.status(500).json({
      message: "Error al obtener los accesorios.",
      error: error.message,
    });
  }
};

// Obtener accesorio por ID
exports.obtenerAccesorioById = async (req, res) => {
  try {
    const accesorio = await Accesorio.findById(req.params.id);
    if (!accesorio) {
      logger.warn(`Accesorio con ID ${req.params.id} no encontrado.`);
      return res.status(404).json({ message: "Accesorio no encontrado" });
    }

    res.status(200).json(accesorio);
  } catch (error) {
    logger.error("Error al obtener el accesorio por ID:", error);
    res.status(500).json({
      message: "Error al obtener los detalles del accesorio.",
      error: error.message,
    });
  }
};

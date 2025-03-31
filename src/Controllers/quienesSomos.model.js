const {
  Mision,
  Vision,
  Valores,
  PreguntaFrecuente,
} = require("../Models/quienesSomos.mode"); // Ajusta la ruta según tu estructura
const sanitizeObject = require("../util/sanitize");
const { logger } = require("../util/logger");

// ==============================================
// Controlador para Misión
// ==============================================
exports.getMision = async (req, res) => {
  try {
    const mision = await Mision.findOne();
    res.json(mision);
  } catch (error) {
    logger.error("Error al traer la mision:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.saveMision = async (req, res) => {
  try {
    const { contenido } = sanitizeObject(req.body);

    // Verificar si ya existe una misión
    let mision = await Mision.findOne();

    if (mision) {
      // Actualizar
      mision.contenido = contenido;
      mision.fechaActualizacion = Date.now();
      await mision.save();
    } else {
      // Crear nueva
      mision = new Mision({ contenido });
      await mision.save();
    }

    res.json(mision);
  } catch (error) {
    logger.error("Error al guardar la mision:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.deleteMision = async (req, res) => {
  try {
    const id = req.params;
    const mision = await Mision.findById({ _id: id });
    if (!mision) {
      return res.status(404).json({ error: "No se encontró la misión" });
    }

    mision.activo = !mision.activo;
    await mision.save();

    res.json(mision);
  } catch (error) {
    logger.error("Error al cambiar el estado de la mision:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// Controlador para Visión
// ==============================================

// Obtener la visión
exports.getVision = async (req, res) => {
  try {
    const vision = await Vision.findOne();
    res.json(vision);
  } catch (error) {
    logger.error("Error al traer la vision:", error);
    res.status(500).json({ error: error.message });
  }
};
// Crear o actualizar visión
exports.saveVision = async (req, res) => {
  try {
    const { contenido } = sanitizeObject(req.body);

    let vision = await Vision.findOne();

    if (vision) {
      // Actualizar
      vision.contenido = contenido;
      vision.fechaActualizacion = Date.now();
      await vision.save();
    } else {
      // Crear nueva
      vision = new Vision({ contenido });
      await vision.save();
    }

    res.json(vision);
  } catch (error) {
    logger.error("Error al guardar la vision:", error);
    res.status(500).json({ error: error.message });
  }
};

// Cambiar estado activo
exports.deleteVision = async (req, res) => {
  try {
    const id = req.params;
    const vision = await Vision.findById({ _id: id });
    if (!vision) {
      return res.status(404).json({ error: "No se encontró la visión" });
    }

    vision.activo = !vision.activo;
    await vision.save();

    res.json(vision);
  } catch (error) {
    logger.error("Error al cambiar el estado de la vision:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// Controlador para Valores
// ==============================================

// Obtener todos los valores activos
exports.getValores = async (req, res) => {
  try {
    const valores = await Valores.find({ activo: true }).sort({ orden: 1 });
    res.json(valores);
  } catch (error) {
    logger.error("Error al traer todos los valores", error);
    res.status(500).json({ error: error.message });
  }
};
// Obtener todos los valores (incluyendo inactivos - para admin)
exports.getAllValores = async (req, res) => {
  try {
    const valores = await Valores.find().sort({ orden: 1 });
    res.json(valores);
  } catch (error) {
    logger.error("Error al traer todos de la vision:", error);
    res.status(500).json({ error: error.message });
  }
};
// Crear un nuevo valor
exports.createValor = async (req, res) => {
  try {
    const { nombre, descripcion, icono, orden } = sanitizeObject(req.body);
    const valor = new Valores({
      nombre,
      descripcion,
      icono,
      orden: orden || 0,
    });

    await valor.save();
    res.status(201).json(valor);
  } catch (error) {
    logger.error("Error al crear los valores:", error);
    res.status(500).json({ error: error.message });
  }
};
// Actualizar un valor
exports.updateValor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono, orden, activo } = sanitizeObject(
      req.body
    );

    const valor = await Valores.findByIdAndUpdate(
      id,
      { nombre, descripcion, icono, orden, activo },
      { new: true }
    );

    if (!valor) {
      return res.status(404).json({ error: "Valor no encontrado" });
    }

    res.json(valor);
  } catch (error) {
    logger.error("Error al actualizar los valores:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un valor (soft delete)
exports.deleteValor = async (req, res) => {
  try {
    const { id } = req.params;
    const valor = await Valores.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!valor) {
      return res.status(404).json({ error: "Valor no encontrado" });
    }

    res.json({ message: "Valor desactivado correctamente" });
  } catch (error) {
    logger.error("Error al eliminar los valores:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// Controlador para Preguntas Frecuentes
// ==============================================

// Obtener todas las preguntas activas
exports.getPreguntas = async (req, res) => {
  try {
    const { categoria } = sanitizeObject(req.query);

    const filter = { activo: true };
    if (categoria) filter.categoria = categoria;

    const preguntas = await PreguntaFrecuente.find(filter).sort({ orden: 1 });
    res.json(preguntas);
  } catch (error) {
    logger.error("Error al traer la primera pregunta registrada", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las preguntas (incluyendo inactivas - para admin)
exports.getAllPreguntas = async (req, res) => {
  try {
    const preguntas = await PreguntaFrecuente.find().sort({ orden: 1 });
    res.json(preguntas);
  } catch (error) {
    logger.error("Error al traer todas las preguntas:", error);
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva pregunta
exports.createPregunta = async (req, res) => {
  try {
    const { pregunta, respuesta, categoria, orden } = sanitizeObject(req.body);
    const nuevaPregunta = new PreguntaFrecuente({
      pregunta,
      respuesta,
      categoria,
      orden: orden || 0,
    });

    await nuevaPregunta.save();
    res.status(201).json(nuevaPregunta);
  } catch (error) {
    logger.error("Error al registrar la pregunta:", error);
    res.status(500).json({ error: error.message });
  }
};
// Actualizar una pregunta
exports.updatePregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const { pregunta, respuesta, categoria, orden, activo } = sanitizeObject(
      req.body
    );

    const preguntaActualizada = await PreguntaFrecuente.findByIdAndUpdate(
      id,
      { pregunta, respuesta, categoria, orden, activo },
      { new: true }
    );

    if (!preguntaActualizada) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    res.json(preguntaActualizada);
  } catch (error) {
    logger.error("Error al actualizar la pregunta:", error);
    res.status(500).json({ error: error.message });
  }
};
// Eliminar una pregunta (soft delete)
exports.deletePregunta = async (req, res) => {
  try {
    const { id } = req.params;
    const pregunta = await PreguntaFrecuente.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    res.json({ message: "Pregunta desactivada correctamente" });
  } catch (error) {
    logger.error("Error al eliminar la pregunta:", error);
    res.status(500).json({ error: error.message });
  }
};

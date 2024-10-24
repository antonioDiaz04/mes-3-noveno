const { Politicas } = require("../Models/PrivadoModel");
const { AcercaDe, Contacto, Pregunta } = require("../Models/PrivadoModel.js");

exports.createAcercaDe = async (req, res) => {
  try {
    const { titulo, contenido } = req.body;

    if (!titulo) return res.status(400).json({ message: "Título vacío" });
    if (!contenido) return res.status(400).json({ message: "Contenido vacío" });

    const acercaDe = new AcercaDe({ titulo, contenido });
    await acercaDe.save();
    res.status(201).json(acercaDe);
  } catch (error) {
    console.error("Error al crear AcercaDe:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.deleteAcercaDe = async (req, res) => {
  try {
    const { id } = req.params;
    const acercaDe = await AcercaDe.findByIdAndDelete(id);
    if (!acercaDe)
      return res.status(404).json({ message: "AcercaDe no encontrado" });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar AcercaDe:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.updateAcercaDe = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido } = req.body;

    if (!id) return res.status(400).json({ message: "ID vacío" });
    if (!titulo) return res.status(400).json({ message: "Título vacío" });
    if (!contenido) return res.status(400).json({ message: "Contenido vacío" });

    const acercaDe = await AcercaDe.findByIdAndUpdate(
      id,
      { titulo, contenido },
      { new: true }
    );

    if (!acercaDe)
      return res.status(404).json({ message: "AcercaDe no encontrado" });

    res.status(200).json(acercaDe);
  } catch (error) {
    console.error("Error al actualizar AcercaDe:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Crear nuevas políticas o actualizar la existente
exports.crearPoliticas = async (req, res) => {
  try {
    const { titulo, contenido } = req.body;

    const nuevaVersion = "1.0";

    // Crear una nueva instancia de la política
    const nuevaPolitica = new Politicas({
      titulo: titulo,
      contenido: contenido,
      version: nuevaVersion,
      estado: "vigente",
      historial: [],
    });

    // Guardar la nueva política
    await nuevaPolitica.save();

    return res.status(201).json({
      message: "Política creada exitosamente",
      politica: nuevaPolitica,
    });
  } catch (error) {
    console.log("Error al crear políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

// Obtener todas las políticas
exports.obtenerPoliticas = async (req, res) => {
  try {
    const politicas = await Politicas.find({ estado: { $ne: "eliminado" } });
    return res.status(200).json(politicas);
  } catch (error) {
    console.log("Error al obtener políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};
// Actualizar políticas existentes
exports.actualizarPoliticas = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido } = req.body;

    const politicaExistente = await Politicas.findById(id);

    if (!politicaExistente) {
      return res.status(404).send("Política no encontrada");
    }

    politicaExistente.historial.push({
      version: politicaExistente.version,
      titulo: politicaExistente.titulo,
      contenido: politicaExistente.contenido,
      estado: "no vigente",
      fechaCreacion: new Date(),
    });

    // Incrementar la versión
    const nuevaVersion = (parseFloat(politicaExistente.version) + 1).toFixed(1);

    // Actualizar los campos de la política
    politicaExistente.titulo = titulo;
    politicaExistente.contenido = contenido;
    politicaExistente.version = nuevaVersion;
    politicaExistente.estado = "vigente"; // Asumiendo que el nuevo contenido es vigente

    const politicaActualizada = await politicaExistente.save();

    return res.status(200).json({
      message: "Política actualizada exitosamente",
      politica: politicaActualizada,
    });
  } catch (error) {
    console.log("Error al actualizar políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

// Eliminar una política específica
exports.eliminarPolitica = async (req, res) => {
  try {
    const { id } = req.params;

    const politica = await Politicas.findById(id).populate("historial");

    if (!politica) {
      return res.status(404).json({ message: "Política no encontrada" });
    }

    console.log(politica.estado);
    politica.estado = "eliminado";

    await politica.save();
    res.status(204).json({
      message: "Politica eliminada",
    });
  } catch (error) {
    console.error("Error al eliminar política:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.obtenerHistorialPolitica = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la política por su ID
    const politica = await Politicas.findById(id);
    if (!politica) {
      return res.status(404).send("Política no encontrada");
    }

    const historialCompleto = [
      {
        version: politica.version,
        titulo: politica.titulo,
        contenido: politica.contenido,
        estado: politica.estado,
        fechaCreacion: politica.fechaCreacion, // Asegúrate de tener esta propiedad en tu esquema
      },
      ...politica.historial, // Agregar el historial anterior
    ];

    return res.status(200).json({
      historial: historialCompleto,
    });
  } catch (error) {
    console.log("Error al obtener el historial de la política:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

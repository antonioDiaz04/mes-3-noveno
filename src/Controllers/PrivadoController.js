const { Politicas } = require("../Models/PrivadoModel");
const {
  AcercaDe,
  Contacto,
  Politica,
  Pregunta,
} = require("../Models/PrivadoModel.js");

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

// Crear nuevas políticas
exports.crearPoliticas = async (req, res) => {
  try {
    const nuevaPolitica = new Politica(req.body);
    await nuevaPolitica.save();
    return res.status(201).json({ message: "Política creada exitosamente" });
  } catch (error) {
    console.log("Error al crear políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

// Obtener todas las políticas
exports.obtenerPoliticas = async (req, res) => {
  try {
    const politicas = await Politicas.find();
    return res.status(200).json(politicas);
  } catch (error) {
    console.log("Error al obtener políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

// Actualizar políticas existentes
exports.actualizarPoliticas = async (req, res) => {
  try {
    const { id } = req.body;
    const politicaActualizada = await Politica.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!politicaActualizada) {
      return res.status(404).send("Política no encontrada");
    }
    return res.status(200).json({
      message: "Política actualizada exitosamente",
      politica: politicaActualizada,
    });
  } catch (error) {
    console.log("Error al actualizar políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

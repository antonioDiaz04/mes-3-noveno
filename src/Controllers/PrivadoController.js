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

const { Politicas } = require("../Models/PrivadoModel");

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
    return res
      .status(200)
      .json({
        message: "Política actualizada exitosamente",
        politica: politicaActualizada,
      });
  } catch (error) {
    console.log("Error al actualizar políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

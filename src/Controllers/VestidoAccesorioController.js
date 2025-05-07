const VestidosAccesorioIncluidos = require("../Models/VestidoAccesorio"); // Asegúrate de importar tu modelo
const Producto = require("../Models/ProductModel"); // Asegúrate de importar tu modelo de Vestido
const Accesorio = require("../Models/AccesorioModel"); // Asegúrate de importar tu modelo de Accesorio
const {logger} = require("../util/logger");

// Crear una nueva relación entre un vestido y sus accesorios
exports.crearRelacion = async (req, res) => {
  try {
    const { vestidoId, accesorios } = req.body;


     console.log(req.body)
    // Verificar que el vestido existe
    const vestido = await Producto.findById(vestidoId);
    if (!vestido) {
      // logger.warn(`Vestido no encontrado: ${vestidoId}`);
      return res.status(404).json({ message: "Vestido no encontrado" });
    }

    // Verificar que todos los accesorios existen
    const accesoriosEncontrados = await Accesorio.find({ _id: { $in: accesorios } });
    if (accesoriosEncontrados.length !== accesorios.length) {
      return res.status(404).json({ message: "Uno o más accesorios no encontrados" });
    }

    // Crear la relación
    const nuevaRelacion = new VestidosAccesorioIncluidos({
      vestido: vestidoId,
      accesorios: accesorios,
    });

    const resultado = await nuevaRelacion.save();

    res
      .status(201)
      .json({ message: "Relación creada exitosamente", relacion: resultado });
  } catch (error) {
    // logger.error(`Error al crear la relación: ${error.message}`);
    res.status(500).json({ error: "Ocurrió un error al crear la relación." });
  }
};

// Obtener todas las relaciones de vestidos y accesorios
exports.obtenerRelaciones = async (req, res) => {
  try {
    const relaciones = await VestidosAccesorioIncluidos.find()
      .populate("vestido") // Poblamos el vestido
      .populate("accesorios"); // Poblamos los accesorios

    res.status(200).json(relaciones);
  } catch (error) {
    // logger.error(`Error al obtener las relaciones: ${error.message}`);
    res.status(500).json({ message: "Error al obtener las relaciones", error });
  }
};

// Eliminar una relación por ID
exports.eliminarRelacion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await VestidosAccesorioIncluidos.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Relación no encontrada" });
    }

    res.status(200).json({ message: "Relación eliminada con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor: " + error);
  }
};

// Obtener una relación por ID
exports.obtenerRelacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const relacion = await VestidosAccesorioIncluidos.findById(id)
      .populate("vestido")
      .populate("accesorios");

    if (!relacion) {
      return res.status(404).json({ message: "Relación no encontrada" });
    }

    res.status(200).json(relacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la relación", error });
  }
};

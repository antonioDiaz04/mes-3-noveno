const {
  Politicas,
  TerminosYCondiciones,
  Deslindelegal,
} = require("../Models/PrivadoModel");
const { AcercaDe, Contacto, Pregunta } = require("../Models/PrivadoModel.js");

// Acerca de
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

//políticas
exports.crearPoliticas = async (req, res) => {
  try {
    const { titulo, contenido, fechaVigencia } = req.body;

    if (!fechaVigencia || isNaN(new Date(fechaVigencia).getTime())) {
      return res.status(400).json({ message: "Fecha de vigencia inválida" });
    }

    const nuevaVersion = "1.0";

    // Crear una nueva instancia de la política
    const nuevaPolitica = new Politicas({
      titulo: titulo,
      contenido: contenido,
      version: nuevaVersion,
      estado: "vigente",
      fechaVigencia: fechaVigencia,
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

exports.obtenerPoliticas = async (req, res) => {
  try {
    const politicas = await Politicas.find({ estado: { $ne: "eliminado" } });

    if (!politicas) {
      return res.status(404).json({ message: "No hay políticas disponibles" });
    }
    const fechaHoy = new Date();

    // Actualizar el estado de las políticas que han pasado su fecha de vigencia
    for (const politica of politicas) {
      if (
        new Date(politica.fechaVigencia) < fechaHoy &&
        politica.estado === "vigente"
      ) {
        politica.estado = "no vigente"; // Cambiar estado a "no vigente"
        await politica.save(); // Guardar los cambios
      }
    }

    return res.status(200).json(politicas);
  } catch (error) {
    console.log("Error al obtener políticas:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};
exports.actualizarPoliticas = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, fechaVigencia } = req.body;

    const politicaExistente = await Politicas.findById(id);

    if (!politicaExistente) {
      return res.status(404).send("Política no encontrada");
    }
    if (!fechaVigencia || isNaN(new Date(fechaVigencia).getTime())) {
      return res.status(400).json({ message: "Fecha de vigencia inválida" });
    }

    // Guardar el historial de la política existente
    politicaExistente.historial.push({
      version: politicaExistente.version,
      titulo: politicaExistente.titulo,
      contenido: politicaExistente.contenido,
      fechaVigencia: politicaExistente.fechaVigencia,
      estado: "no vigente",
      fechaCreacion: new Date(),
    });

    // Incrementar la versión
    const nuevaVersion = (parseFloat(politicaExistente.version) + 1).toFixed(1);

    // Actualizar los campos de la política
    politicaExistente.titulo = titulo;
    politicaExistente.contenido = contenido;
    politicaExistente.version = nuevaVersion;
    politicaExistente.fechaVigencia = fechaVigencia; // Actualizar la fecha de vigencia

    // Verificar si la nueva fecha de vigencia es válida
    if (new Date(fechaVigencia) > new Date()) {
      politicaExistente.estado = "vigente"; // La política es vigente si la fecha es futura
    } else {
      politicaExistente.estado = "no vigente"; // La política no es vigente si la fecha ya pasó
    }

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
        fechaVigencia: politica.fechaVigencia,
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

//Terminos y condiciones
exports.crearTerminosYCondiciones = async (req, res) => {
  try {
    const { titulo, contenido, fechaVigencia } = req.body;
    if (!fechaVigencia || isNaN(new Date(fechaVigencia).getTime())) {
      return res.status(400).json({ message: "Fecha de vigencia inválida" });
    }

    const nuevosTerminos = new TerminosYCondiciones({
      titulo: titulo,
      contenido: contenido,
      version: "1.0",
      estado: "vigente",
      fechaVigencia: fechaVigencia,
    });

    await nuevosTerminos.save();

    return res.status(201).json({
      message: "Términos y condiciones creados exitosamente",
      terminos: nuevosTerminos,
    });
  } catch (error) {
    console.error("Error al crear términos y condiciones:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

exports.obtenerTerminosYCondiciones = async (req, res) => {
  try {
    const terminos = await TerminosYCondiciones.find({
      estado: { $ne: "eliminado" },
    });
    if (!terminos) {
      return res
        .status(404)
        .json({ message: "No hay términos y condiciones disponibles" });
    }

    const fechaHoy = new Date();

    // Actualizar el estado de las políticas que han pasado su fecha de vigencia
    for (const termino of terminos) {
      if (
        new Date(termino.fechaVigencia) < fechaHoy &&
        termino.estado === "vigente"
      ) {
        termino.estado = "no vigente"; // Cambiar estado a "no vigente"
        await termino.save(); // Guardar los cambios
      }
    }
    return res.status(200).json(terminos);
  } catch (error) {
    console.error("Error al obtener términos y condiciones:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

exports.actualizarTerminosYCondiciones = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, fechaVigencia } = req.body;

    const terminosExistentes = await TerminosYCondiciones.findById(id);

    if (!terminosExistentes) {
      return res.status(404).send("Términos y condiciones no encontrados");
    }
    if (!fechaVigencia || isNaN(new Date(fechaVigencia).getTime())) {
      return res.status(400).json({ message: "Fecha de vigencia inválida" });
    }
    console.log(titulo, contenido, fechaVigencia);

    // Guardar el historial de la versión anterior
    terminosExistentes.historial.push({
      version: terminosExistentes.version,
      titulo: terminosExistentes.titulo,
      contenido: terminosExistentes.contenido,
      fechaVigencia: terminosExistentes.fechaVigencia,
      estado: "no vigente",
      fechaCreacion: new Date(),
    });

    // Incrementar la versión
    const nuevaVersion = (parseFloat(terminosExistentes.version) + 1).toFixed(
      1
    );

    // Actualizar los campos de los términos
    terminosExistentes.titulo = titulo;
    terminosExistentes.contenido = contenido;
    terminosExistentes.fechaVigencia = fechaVigencia;
    terminosExistentes.version = nuevaVersion;
    terminosExistentes.estado = "vigente"; // Asumiendo que el nuevo contenido es vigente

    const terminosActualizados = await terminosExistentes.save();

    return res.status(200).json({
      message: "Términos y condiciones actualizados exitosamente",
      terminos: terminosActualizados,
    });
  } catch (error) {
    console.error("Error al actualizar términos y condiciones:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

exports.eliminarTerminosYCondiciones = async (req, res) => {
  try {
    const { id } = req.params;

    const terminos = await TerminosYCondiciones.findById(id);

    if (!terminos) {
      return res
        .status(404)
        .json({ message: "Términos y condiciones no encontrados" });
    }

    terminos.estado = "eliminado"; // Cambiar estado a eliminado
    await terminos.save();

    return res.status(204).json({
      message: "Términos y condiciones eliminados",
    });
  } catch (error) {
    console.error("Error al eliminar términos y condiciones:", error);
    return res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.obtenerHistorialTerminosYCondiciones = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar los términos por su ID
    const terminos = await TerminosYCondiciones.findById(id);
    if (!terminos) {
      return res.status(404).send("Términos y condiciones no encontrados");
    }

    const historialCompleto = [
      {
        version: terminos.version,
        titulo: terminos.titulo,
        contenido: terminos.contenido,
        fechaVigencia: terminos.fechaVigencia,
        estado: terminos.estado,
        fechaCreacion: terminos.fechaCreacion,
      },
      ...terminos.historial, // Agregar el historial anterior
    ];

    return res.status(200).json({
      historial: historialCompleto,
    });
  } catch (error) {
    console.error(
      "Error al obtener el historial de términos y condiciones:",
      error
    );
    return res.status(500).send("Error en el servidor: " + error);
  }
};

exports.crearDeslindeLegal = async (req, res) => {
  try {
    const { titulo, contenido, fechaVigencia } = req.body;
    if (!fechaVigencia || isNaN(new Date(fechaVigencia).getTime())) {
      return res.status(400).json({ message: "Fecha de vigencia inválida" });
    }

    const nuevoDeslinde = new Deslindelegal({
      titulo: titulo,
      contenido: contenido,
      version: "1.0",
      estado: "vigente",
      fechaVigencia: fechaVigencia,
    });

    await nuevoDeslinde.save();

    return res.status(201).json({
      message: "Deslinde legal creado exitosamente",
      deslinde: nuevoDeslinde,
    });
  } catch (error) {
    console.error("Error al crear deslinde legal:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

// Obtener todos los Deslindes Legales
exports.obtenerDeslindesLegales = async (req, res) => {
  try {
    const deslindes = await Deslindelegal.find({
      estado: { $ne: "eliminado" },
    });

    if (!deslindes) {
      return res
        .status(404)
        .json({ message: "No hay deslindes legales disponibles" });
    }

    const fechaHoy = new Date();

    // Actualizar el estado de los deslindes que han pasado su fecha de vigencia
    for (const deslinde of deslindes) {
      if (
        new Date(deslinde.fechaVigencia) < fechaHoy &&
        deslinde.estado === "vigente"
      ) {
        deslinde.estado = "no vigente";
        await deslinde.save();
      }
    }

    return res.status(200).json(deslindes);
  } catch (error) {
    console.error("Error al obtener deslindes legales:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

// Actualizar Deslinde Legal
exports.actualizarDeslindeLegal = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, fechaVigencia } = req.body;

    const deslindeExistente = await Deslindelegal.findById(id);

    if (!deslindeExistente) {
      return res.status(404).send("Deslinde legal no encontrado");
    }
    if (!fechaVigencia || isNaN(new Date(fechaVigencia).getTime())) {
      return res.status(400).json({ message: "Fecha de vigencia inválida" });
    }

    // Guardar el historial de la versión anterior
    deslindeExistente.historial.push({
      version: deslindeExistente.version,
      titulo: deslindeExistente.titulo,
      contenido: deslindeExistente.contenido,
      fechaVigencia: deslindeExistente.fechaVigencia,
      estado: "no vigente",
      fechaCreacion: new Date(),
    });

    // Incrementar la versión
    const nuevaVersion = (parseFloat(deslindeExistente.version) + 1).toFixed(1);

    // Actualizar los campos del deslinde
    deslindeExistente.titulo = titulo;
    deslindeExistente.contenido = contenido;
    deslindeExistente.fechaVigencia = fechaVigencia;
    deslindeExistente.version = nuevaVersion;
    deslindeExistente.estado = "vigente";

    const deslindeActualizado = await deslindeExistente.save();

    return res.status(200).json({
      message: "Deslinde legal actualizado exitosamente",
      deslinde: deslindeActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar deslinde legal:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

// Eliminar Deslinde Legal (lógica)
exports.eliminarDeslindeLegal = async (req, res) => {
  try {
    const { id } = req.params;

    const deslinde = await Deslindelegal.findById(id);

    if (!deslinde) {
      return res.status(404).json({ message: "Deslinde legal no encontrado" });
    }

    deslinde.estado = "eliminado";
    await deslinde.save();

    return res.status(204).json({
      message: "Deslinde legal eliminado",
    });
  } catch (error) {
    console.error("Error al eliminar deslinde legal:", error);
    return res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener Historial del Deslinde Legal
exports.obtenerHistorialDeslindeLegal = async (req, res) => {
  try {
    const { id } = req.params;

    const deslinde = await Deslindelegal.findById(id);
    if (!deslinde) {
      return res.status(404).send("Deslinde legal no encontrado");
    }

    const historialCompleto = [
      {
        version: deslinde.version,
        titulo: deslinde.titulo,
        contenido: deslinde.contenido,
        fechaVigencia: deslinde.fechaVigencia,
        estado: deslinde.estado,
        fechaCreacion: deslinde.fechaCreacion,
      },
      ...deslinde.historial,
    ];

    return res.status(200).json({
      historial: historialCompleto,
    });
  } catch (error) {
    console.error("Error al obtener el historial del deslinde legal:", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};

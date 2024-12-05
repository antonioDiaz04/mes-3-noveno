const { DatosAtelier, RedesSociales } = require("../Models/EmpresaModel.js");
const { Usuario, EstadoCuenta } = require("../Models/UsuarioModel.js");
const { uploadImage, deleteImage } = require("../cloudinary/cloudinary");
const fs = require("fs-extra");

exports.crearPerfilEmpresa = async (req, res) => {
  try {
    const {
      redesSociales,
      slogan,
      tituloPagina,
      direccion,
      correoElectronico,
      telefono,
    } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ mensaje: "No se proporcionaron imágenes para subir" });
    }

    // Obtiene el primer archivo de imagen
    const fileKey = Object.keys(req.files)[0];
    const file = req.files[fileKey];

    if (!file) return res.status(400).json({ message: "Logo vacío" });
    if (!direccion) return res.status(400).json({ message: "Dirección vacía" });
    if (!correoElectronico)
      return res.status(400).json({ message: "Correo electrónico vacío" });

    // Subimos el logo
    const result = await uploadImage(file.tempFilePath || file.path);
    await fs.unlink(file.tempFilePath || file.path); // Elimina el archivo temporal después de subirlo

    const redesSocialesGuardadas = [];
    if (Array.isArray(req.body.redesSociales)) {
      for (const red of req.body.redesSociales) {
        const nuevaRed = new RedesSociales(red); // Crea la red social
        const redGuardada = await nuevaRed.save(); // Guarda en la base de datos
        redesSocialesGuardadas.push(redGuardada._id); // Agrega ID al arreglo
      }
    } else {
      return res
        .status(400)
        .json({ mensaje: "redesSociales debe ser un arreglo" });
    }
    const nuevoPerfil = new DatosAtelier({
      logo: result.secure_url, // Guarda la URL de la imagen subida
      redesSociales: redesSocialesGuardadas,
      slogan,
      tituloPagina,
      direccion,
      correoElectronico,
      telefono,
    });

    await nuevoPerfil.save();
    res.status(201).json(nuevoPerfil);
  } catch (error) {
    console.error("Error al crear el perfil de la empresa:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

exports.obtenerPerfilesEmpresa = async (req, res) => {
  try {
    const perfiles = await DatosAtelier.find().populate("redesSociales");
    res.status(200).json(perfiles);
  } catch (error) {
    console.error("Error al obtener perfiles de la empresa:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

exports.editarPerfilEmpresa = async (req, res) => {
  try {
    const {
      redesSociales,
      slogan,
      tituloPagina,
      direccion,
      correoElectronico,
      telefono,
    } = req.body;

    // Verifica si se ha subido una nueva imagen
    let logoUrl;

    if (req.files && Object.keys(req.files).length > 0) {
      const fileKey = Object.keys(req.files)[0];
      const file = req.files[fileKey];

      if (!file) return res.status(400).json({ message: "Logo vacío" });

      // Subimos el nuevo logo
      logoUrl = await uploadImage(file.tempFilePath || file.path);
      console.log(logoUrl);
      await fs.unlink(file.tempFilePath || file.path); // Elimina el archivo temporal después de subirlo
    }

    // Buscamos el perfil de la empresa existente
    const perfilExistente = await DatosAtelier.findOne({});
    if (!perfilExistente) {
      return res.status(404).json({ mensaje: "Perfil no encontrado" });
    }

    // Actualiza otros campos
    if (logoUrl) {
      perfilExistente.logo = logoUrl.secure_url; // Actualiza la URL del logo solo si hay uno nuevo
    }
    perfilExistente.slogan = slogan || perfilExistente.slogan;
    perfilExistente.tituloPagina = tituloPagina || perfilExistente.tituloPagina;
    perfilExistente.direccion = direccion || perfilExistente.direccion;
    perfilExistente.correoElectronico =
      correoElectronico || perfilExistente.correoElectronico;
    perfilExistente.telefono = telefono || perfilExistente.telefono;

    // Guarda los cambios en la base de datos
    await perfilExistente.save();
    res.status(200).json(perfilExistente);
  } catch (error) {
    console.error("Error al editar el perfil de la empresa:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

exports.eliminarImagenesPerfil = async (req, res) => {
  try {
    const { id } = req.params; // Asumiendo que pasas el ID del perfil
    const { imagenesParaEliminar } = req.body;

    // Verifica si se proporcionan imágenes para eliminar
    if (
      !imagenesParaEliminar ||
      !Array.isArray(imagenesParaEliminar) ||
      imagenesParaEliminar.length === 0
    ) {
      return res
        .status(400)
        .json({ mensaje: "No se proporcionaron imágenes para eliminar" });
    }

    // Busca el perfil de la empresa por ID
    const perfil = await DatosAtelier.findById(id);
    if (!perfil) {
      return res
        .status(404)
        .json({ mensaje: "Perfil de empresa no encontrado" });
    }

    // Elimina las imágenes de Cloudinary
    for (const imagen of imagenesParaEliminar) {
      try {
        await deleteImage(imagen.public_id);
      } catch (error) {
        console.error("Error al eliminar la imagen de Cloudinary:", error);
        return res
          .status(500)
          .json({ mensaje: "Error al eliminar una de las imágenes" });
      }
    }

    // Actualiza el perfil para remover las imágenes eliminadas
    perfil.redesSociales = perfil.redesSociales.filter(
      (red) =>
        !imagenesParaEliminar.some(
          (elimImg) => elimImg.public_id === red.public_id
        )
    );

    // Guarda los cambios en la base de datos
    await perfil.save();
    res
      .status(200)
      .json({ mensaje: "Imágenes eliminadas correctamente", perfil });
  } catch (error) {
    console.error(
      "Error al eliminar imágenes del perfil de la empresa:",
      error
    );
    res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

exports.consultarConfigurarEmpresa = async (req, res) => {
  try {
    const usuarios = await Usuario.find().populate("estadoCuenta");

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "No se encontró la empresa" });
    }

    // Buscar el primer usuario que pase la condición
    const usuarioConfigurado = usuarios.find((usuario) => {
      return (
        usuario.estadoCuenta &&
        usuario.estadoCuenta.intentosPermitidos !== undefined &&
        usuario.estadoCuenta.tiempoDeBloqueo !== undefined
      );
    });

    if (!usuarioConfigurado) {
      return res
        .status(404)
        .json({ message: "No se encontraron configuraciones válidas" });
    }

    res.status(200).json({
      message: "Configuración de empresa consultada exitosamente",
      configuracion: {
        nombre: usuarioConfigurado.nombre,
        intentosPermitidos: usuarioConfigurado.estadoCuenta.intentosPermitidos,
        tiempoDeBloqueo: usuarioConfigurado.estadoCuenta.tiempoDeBloqueo,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al consultar la configuración" });
  }
};
exports.editarConfigurarEmpresa = async (req, res) => {
  try {
    const { intentosPermitidos, tiempoDeBloqueo } = req.body;

    const usuarios = await Usuario.find().populate("estadoCuenta");

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ message: "No se encontraron usuarios" });
    }

    let totalActualizados = 0;

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];

      let actualizado = false;

      // Crear un estadoCuenta si no existe
      if (!usuario.estadoCuenta) {
        const nuevoEstadoCuenta = new EstadoCuenta({
          intentosPermitidos,
          tiempoDeBloqueo,
        });
        usuario.estadoCuenta = await nuevoEstadoCuenta.save();
        actualizado = true;
      } else {
        // Actualizar los campos si ya existe
        if (
          usuario.estadoCuenta.intentosPermitidos !== undefined &&
          usuario.estadoCuenta.intentosPermitidos !== intentosPermitidos
        ) {
          usuario.estadoCuenta.intentosPermitidos = intentosPermitidos;
          actualizado = true;
        }

        if (
          usuario.estadoCuenta.tiempoDeBloqueo !== undefined &&
          usuario.estadoCuenta.tiempoDeBloqueo !== tiempoDeBloqueo
        ) {
          usuario.estadoCuenta.tiempoDeBloqueo = tiempoDeBloqueo;
          actualizado = true;
        }
      }

      if (actualizado) {
        await usuario.estadoCuenta.save();
        await usuario.save();
        totalActualizados++;
      }
    }

    return totalActualizados
      ? res.status(200).json({
          message:
            "Configuración actualizada exitosamente para todos los usuarios",
          totalActualizados,
        })
      : res.status(500).json({ message: "Error al actualizar los usuarios" });
  } catch (error) {
    console.error("Error en editarConfigurarEmpresa:", error.message);
    res.status(500).json({
      message: "Error al actualizar la configuración",
      error: error.message,
    });
  }
};

exports.guardarRedSocial = async (req, res) => {
  try {
    const { enlace, plataforma } = req.body;

    const nuevaRedSocial = new RedesSociales({
      plataforma: plataforma,
      enlace: enlace,
    });
    const redSocialGuardada = await nuevaRedSocial.save();

    const perfilEmpresa = await DatosAtelier.find().populate("redesSociales");
    if (!perfilEmpresa) {
      return res
        .status(404)
        .json({ error: "Perfil de empresa no encontrado." });
    }s

    perfilEmpresa[0].redesSociales.push(redSocialGuardada._id);

    await perfilEmpresa[0].save();
    return res
      .status(200)
      .json({ message: "Red social guardada correctamente." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al guardar la red social." });
  }
};
exports.obtenerRedesSociales = async (req, res) => {
  try {
    const perfilEmpresa = await DatosAtelier.find().populate("redesSociales");

    if (!perfilEmpresa) {
      return res
        .status(404)
        .json({ error: "Perfil de empresa no encontrado." });
    }

    console.log(perfilEmpresa[0].RedesSociales);

    return res
      .status(200)
      .json({ message: "Red social guardada correctamente." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al guardar la red social." });
  }
};

exports.eliminarRedSocial = async (req, res) => {
  try {
    const { id } = req.params; // El _id de la red social se pasa como parámetro en la URL.
    console.log("Red social ID:", id);

    // Buscar el perfil de la empresa y hacer un populate de las redes sociales.
    const perfilEmpresa = await DatosAtelier.findOne().populate(
      "redesSociales"
    );

    // Verificar que perfilEmpresa existe y tiene el campo redesSociales
    if (
      !perfilEmpresa ||
      !perfilEmpresa.redesSociales ||
      perfilEmpresa.redesSociales.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "Perfil de empresa o redes sociales no encontradas." });
    }

    // Buscar el índice de la red social en el array
    const redSocialIndex = perfilEmpresa.redesSociales.findIndex(
      (red) => red._id.toString() === id
    );

    if (redSocialIndex === -1) {
      return res.status(404).json({ error: "Red social no encontrada." });
    }

    // Eliminar la red social del array de redes sociales.
    perfilEmpresa.redesSociales.splice(redSocialIndex, 1);

    // Eliminar la red social de la base de datos.
    await RedesSociales.findByIdAndDelete(id);

    // Guardar los cambios en el perfil de la empresa.
    await perfilEmpresa.save();

    return res
      .status(200)
      .json({ message: "Red social eliminada correctamente." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al eliminar la red social." });
  }
};

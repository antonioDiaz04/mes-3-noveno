const { DatosAtelier, RedesSociales } = require("../Models/EmpresaModel.js");
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
    console.log(req);
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

    // Actualizamos los datos del perfil
    perfilExistente.redesSociales = [];
    if (Array.isArray(redesSociales)) {
      for (const red of redesSociales) {
        const nuevaRed = new RedesSociales(red);
        const redGuardada = await nuevaRed.save();
        perfilExistente.redesSociales.push(redGuardada._id);
      }
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
    if (!imagenesParaEliminar || !Array.isArray(imagenesParaEliminar) || imagenesParaEliminar.length === 0) {
      return res.status(400).json({ mensaje: "No se proporcionaron imágenes para eliminar" });
    }

    // Busca el perfil de la empresa por ID
    const perfil = await DatosAtelier.findById(id);
    if (!perfil) {
      return res.status(404).json({ mensaje: "Perfil de empresa no encontrado" });
    }

    // Elimina las imágenes de Cloudinary
    for (const imagen of imagenesParaEliminar) {
      try {
        await deleteImage(imagen.public_id);
      } catch (error) {
        console.error("Error al eliminar la imagen de Cloudinary:", error);
        return res.status(500).json({ mensaje: "Error al eliminar una de las imágenes" });
      }
    }

    // Actualiza el perfil para remover las imágenes eliminadas
    perfil.redesSociales = perfil.redesSociales.filter(
      (red) => !imagenesParaEliminar.some((elimImg) => elimImg.public_id === red.public_id)
    );

    // Guarda los cambios en la base de datos
    await perfil.save();
    res.status(200).json({ mensaje: "Imágenes eliminadas correctamente", perfil });
  } catch (error) {
    console.error("Error al eliminar imágenes del perfil de la empresa:", error);
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

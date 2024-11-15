// const { v2: cloudinary } = require("cloudinary");
// const { uploadImage } = require("../cloudinary/cloudinary");
const fs = require("fs-extra");
const Producto = require("../Models/ProductModel"); // Asegúrate de importar tu modelo de producto
// import path from 'path'
// Importa multerConfig
const upload = require('../Midlewares/multer');


const cloudinary = require("cloudinary").v2;
// const Producto = require("../models/Producto"); // Importa el modelo de Producto
// const fs = require("fs/promises");

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "dvvhnrvav",
  api_key: "982632489651298",
  api_secret: "TTIZcgIMiC8F4t8cE-t6XkQnPyQ",
});

// const fs = require('fs').promises; // Asegúrate de usar 'fs/promises' para funciones asíncronas
// const cloudinary = require('cloudinary').v2;
// const Producto = require('../models/Producto'); // Asegúrate de que la ruta del modelo sea correcta
exports.crearProducto = async (req, res) => {
  try {
    // Imprimir el contenido de req para depuración
    console.log("Contenido de req.body:", req.body);
    console.log("Contenido de req.files:", req.files);

    // Verificar si se está enviando una imagen principal
    if (!req.files || !req.files.imagenPrincipal || req.files.imagenPrincipal.length === 0) {
      return res.status(400).json({ message: 'No se ha proporcionado una imagen principal.' });
    }

    console.log("paso aqui 0");

    // Subir la imagen principal a Cloudinary
    const imagenPrincipalFile = req.files.imagenPrincipal[0];
    const resultadoCloudinary = await cloudinary.uploader.upload(imagenPrincipalFile.path, {
      folder: "Productos",
    });
    console.log("paso aqui 1");

    // Array para almacenar las URLs de otras imágenes subidas
    const otrasImagenesSubidas = [];

    // Verificar y subir otras imágenes si están presentes
    if (req.files.otrasImagenes) {
      for (const imagenFile of req.files.otrasImagenes) {
        const resultadoOtraImagen = await cloudinary.uploader.upload(imagenFile.path, {
          folder: "ProductosAtelier",
        });
        // Agregar solo la URL al array
        otrasImagenesSubidas.push(resultadoOtraImagen.url);
      }
    }
    console.log("paso aqui 2");

    // Crea un nuevo objeto de Producto con los datos del cuerpo y las URLs de las imágenes
    const producto = new Producto({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      precio: req.body.precio,
      descripcion: req.body.descripcion,
      imagenPrincipal: resultadoCloudinary.url, // URL de la imagen principal
      otrasImagenes: otrasImagenesSubidas // Array de URLs de otras imágenes
    });
    console.log("paso aqui 3");

    // Guardar el producto en la base de datos
    const resultadoProducto = await producto.save();
    console.log("paso aqui 4");

    // Eliminar el archivo temporal de la imagen principal
    await fs.unlink(imagenPrincipalFile.path);

    // Eliminar los archivos temporales de otras imágenes si es necesario
    if (req.files.otrasImagenes) {
      for (const imagenFile of req.files.otrasImagenes) {
        await fs.unlink(imagenFile.path);
      }
    }
    console.log("paso aqui 5");


    // Enviar la respuesta con el producto creado
    res.status(201).json({ message: "Producto creado exitosamente", producto: resultadoProducto });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ error: "Ocurrió un error al crear el producto." });
  }
};


exports.editarProducto = async (req, res) => {

  
  try {
    const { imagenPrincipal, otrasImagenes, ...productoData } = req.body;

    // Subir y actualizar imagen principal si se proporciona una nueva
    if (imagenPrincipal) {
      const result = await uploadImage(
        imagenPrincipal.tempFilePath || imagenPrincipal.path
      );
      productoData.imagenPrincipal = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
      await fs.unlink(imagenPrincipal.tempFilePath || imagenPrincipal.path);
    }

    // Subir y actualizar las otras imágenes si se proporcionan nuevas
    if (otrasImagenes && Array.isArray(otrasImagenes)) {
      productoData.otrasImagenes = [];
      for (const imagen of otrasImagenes) {
        const result = await uploadImage(imagen.tempFilePath || imagen.path);
        productoData.otrasImagenes.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
        await fs.unlink(imagen.tempFilePath || imagen.path);
      }
    }

    // Actualizar el producto en la base de datos
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      productoData,
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error("Error al editar el producto:", error);
    res.status(500).json({ message: "Error al editar el producto", error });
  }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Producto.deleteOne({ _id: id });
    res.status(200).json({ message: "Producto eliminado con éxito." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor: " + error);
  }
};

// Obtener todos los productos
exports.obtenerProducto = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos", error });
  }
};

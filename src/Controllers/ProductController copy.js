const fs = require("fs-extra");
const Producto = require("../Models/ProductModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dvvhnrvav",
  api_key: "982632489651298",
  api_secret: "TTIZcgIMiC8F4t8cE-t6XkQnPyQ",
});

exports.crearProducto = async (req, res) => {
  try {
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
        otrasImagenesSubidas.push(resultadoOtraImagen.url);
      }
    }
    console.log("paso aqui 2");

    // Crea un nuevo objeto de Producto con los datos del formulario y las URLs de las imágenes
    const producto = new Producto({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      color: req.body.color,
      textura: req.body.textura,
      talla: req.body.talla,
      altura: req.body.altura,
      cintura: req.body.cintura,
      precio: req.body.precio,
      disponible: req.body.disponible === 'true', // Convertir string a booleano
      tipoVenta: req.body.tipoVenta,
      nuevo: req.body.nuevo === 'true', // Convertir string a booleano
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
// Obtener todos los productos
exports.obtenerProductoById = async (req, res) => {
  try {
    // Obtener el ID del producto desde los parámetros de la ruta
    const productoId = req.params.id;

    // Buscar el producto por su ID en la base de datos
    const producto = await Producto.findById(productoId);

    // Enviar la respuesta con el producto encontrado
    res.status(200).json(producto);
  } catch (error) {
    // En caso de error, enviar una respuesta con código 500 y el mensaje de error
    res.status(500).json({ message: "Error al obtener los detalles del producto", error });
  }
};



exports.buscarVestidos = async (req, res) => {
  try {
    const query = req.params.query;

    // Validación de query
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        mensaje: 'Término de búsqueda muy corto'
      });
    }

    // Dividir el término de búsqueda en palabras
    const palabras = query.trim().split(' ').filter(palabra => palabra.length > 0);

    // Construir la consulta con una búsqueda 'OR' para cada palabra en los campos
    const resultados = await Producto.find({
      $or: palabras.map(palabra => ({
        $or: [
          { nombre: { $regex: palabra, $options: 'i' } },
          { descripcion: { $regex: palabra, $options: 'i' } },
          { categoria: { $regex: palabra, $options: 'i' } },
          { color: { $regex: palabra, $options: 'i' } },
          { 'tallasDisponibles.talla': { $regex: palabra, $options: 'i' } }
        ]
      }))
    })
      .select('nombre imagenPrincipal precio categoria tallasDisponibles')
      .limit(50);

    // Manejo de resultados
    if (resultados.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron productos',
        resultados: []
      });
    }

    // Respuesta exitosa
    res.status(200).json({
      total: resultados.length,
      resultados: resultados
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};
exports.buscarProductosAvanzados = async (req, res) => {
  const filtros = req.body || {};
  const query = {}; // Objeto para construir los filtros dinámicamente

  console.log('Filtros recibidos:', filtros);

  // Filtrar por categoría si se proporciona
  if (filtros.categoria) {
    query.categoria = filtros.categoria;
    console.log('Filtrando por categoría:', filtros.categoria);
  }

  // Filtrar por color si se proporciona
  if (filtros.color) {
    query.color = filtros.color;
    console.log('Filtrando por color:', filtros.color);
  }

  // Filtrar por talla disponible, si se proporciona y no es 'todas'
  if (filtros.tallaDisponible && filtros.tallaDisponible !== 'todas') {
    query.tallaDisponible = filtros.tallaDisponible; // Buscar productos con la talla específica
    console.log('Filtrando por talla disponible:', filtros.tallaDisponible);
  }

  try {
    // Consulta a la base de datos con los filtros construidos
    const productos = await Producto.find(query) // Usar el objeto query completo
      .select('nombre imagenPrincipal precio categoria tallaDisponible color')
      .limit(50);

    console.log('Productos encontrados:', productos);

    // Enviar los resultados al cliente en formato JSON
    res.status(200).json({ resultados: productos });
  } catch (error) {
    console.error('Error al buscar productos:', error);

    // Responder al cliente con un error
    res.status(500).json({ error: 'Error al buscar productos' });
  }
};


const Categoria = require('../Models/CategoriaModel');
const Producto = require('../Models/ProductModel');

// Crear una nueva categoría
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ msg: 'El nombre de la categoría es obligatorio' });
    }

    const nuevaCategoria = new Categoria({ nombre });
    await nuevaCategoria.save();

    res.status(201).json({ msg: 'Categoría creada exitosamente', categoria: nuevaCategoria });
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

exports.crearMultiplesCategorias = async (req, res) => {
  try {
    const { nombres } = req.body;

    if (!Array.isArray(nombres) || nombres.length === 0) {
      return res.status(400).json({ msg: 'Se requiere un arreglo de nombres de categorías' });
    }

    // Filtra nombres vacíos y elimina duplicados
    const nombresUnicos = [...new Set(nombres.map(n => n.trim()).filter(n => n !== ''))];

    // Crea las categorías
    const categoriasCreadas = await Categoria.insertMany(
      nombresUnicos.map(nombre => ({ nombre }))
    );

    res.status(201).json({
      msg: 'Categorías creadas exitosamente',
      categorias: categoriasCreadas
    });
  } catch (error) {
    console.error('Error al crear las categorías:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};


// Obtener todas las categorías
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.status(200).json(categorias);
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Obtener una categoría por ID
exports.obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }

    res.status(200).json(categoria);
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

exports.obtenerProductosPorCategoriaId = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    const productos = await Producto.find({ idCategoria: id });

    res.json({
      _id: categoria._id,
      nombre: categoria.nombre,
      fechaDeCreacion: categoria.fechaDeCreacion,
      productos
    });
  } catch (error) {
    console.error('❌ Error al obtener productos por categoría:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
exports.obtenerCategoriasConProductos = async (req, res) => {
  try {
    const categoriasConProductos = await Categoria.aggregate([
      {
        $lookup: {
          from: 'productos',             // Relación con la colección de productos
          localField: '_id',             // Campo local (categoría)
          foreignField: 'idCategoria',   // Campo en productos que hace referencia
          as: 'productos'                // Nombre del campo resultante
        }
      },
      {
        $match: {
          'productos.0': { $exists: true } // Solo categorías con al menos un producto
        }
      }
    ]);

    res.status(200).json(categoriasConProductos);
  } catch (error) {
    console.error('Error al obtener categorías con productos:', error);
    res.status(500).json({ error: 'Error al obtener categorías con productos' });
  }
};

// Actualizar una categoría
exports.actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const categoriaActualizada = await Categoria.findByIdAndUpdate(
      id,
      { nombre },
      { new: true }
    );

    if (!categoriaActualizada) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }

    res.status(200).json({ msg: 'Categoría actualizada', categoria: categoriaActualizada });
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Eliminar una categoría
exports.eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoriaEliminada = await Categoria.findByIdAndDelete(id);

    if (!categoriaEliminada) {
      return res.status(404).json({ msg: 'Categoría no encontrada' });
    }

    res.status(200).json({ msg: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};
const Categoria = require('../Models/CategoriaModel');

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
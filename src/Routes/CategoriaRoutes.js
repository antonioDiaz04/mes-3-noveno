const express = require('express');
const router = express.Router();
const CategoriaController = require('../Controllers/CategoriaController');

// Rutas para categorías
router.post('/', CategoriaController.crearCategoria);
router.post('/crearMultiplesCategorias', CategoriaController.crearMultiplesCategorias);
router.get('/', CategoriaController.obtenerCategorias);
router.get('/obtenerProductosPorCategoriaId/:id', CategoriaController.obtenerProductosPorCategoriaId);
router.get('/con-productos', CategoriaController.obtenerCategoriasConProductos);
router.get('/:id', CategoriaController.obtenerCategoriaPorId);
router.put('/:id', CategoriaController.actualizarCategoria);
router.delete('/:id', CategoriaController.eliminarCategoria);

module.exports = router;
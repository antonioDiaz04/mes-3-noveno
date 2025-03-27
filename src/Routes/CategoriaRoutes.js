const express = require('express');
const router = express.Router();
const CategoriaController = require('../Controllers/CategoriaController');

// Rutas para categorías
router.post('/', CategoriaController.crearCategoria);
router.get('/', CategoriaController.obtenerCategorias);
router.get('/:id', CategoriaController.obtenerCategoriaPorId);
router.put('/:id', CategoriaController.actualizarCategoria);
router.delete('/:id', CategoriaController.eliminarCategoria);

module.exports = router;
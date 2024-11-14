const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Corregido: se debe usar 'jwt' en lugar de 'jw'
const upload = require("../Midlewares/multer"); // Asegúrate de importar y configurar 'multer' si lo estás usando para manejo de archivos
const ProductController = require("../Controllers/ProductController");

// Configuración de las rutas
router.post("/",upload.fields([{ name: "imagenPrincipal" }, { name: "otrasImagenes" }]),ProductController.crearProducto);
// router.post("/", upload.single("image"), ProductController.crearProducto);

//   upload.fields([{ name: "imagenPrincipal" }, { name: "otrasImagenes" }]),
router.put("/editarProducto/:id", ProductController.editarProducto); // Corregido el endpoint de edición para consistencia
router.delete("/:id", ProductController.eliminarProducto);
router.get("/", ProductController.obtenerProducto);

module.exports = router;

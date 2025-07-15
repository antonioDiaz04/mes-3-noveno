const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const ProductController = require("../Controllers/ProductController");

// Configuración de las rutas
router.post(
  "/",
  upload.fields([{name:"imagenes",maxCount:10}]),
  ProductController.crearProducto
);

router.get("/byId/:id", ProductController.obtenerProductoById);
// router.post("/", upload.single("image"), ProductController.crearProducto);

//   upload.fields([{ name: "imagenPrincipal" }, { name: "otrasImagenes" }]),
router.put(
  "/editarProducto/:id",
  upload.fields([{name:"imagenes",maxCount:10}]),

   ProductController.editarProducto
); // Corregido el endpoint de edición para consistencia
router.delete("/:id", ProductController.eliminarProducto);
router.get("/", ProductController.obtenerProducto);
// Ruta en routes/productos.js
router.get("/buscar/:query", ProductController.buscarVestidos);
router.post("/buscarAvanzados/", ProductController.buscarProductosAvanzados);

module.exports = router;

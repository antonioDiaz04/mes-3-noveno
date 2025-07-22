const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const ProductController = require("../Controllers/ProductController");


router.post(
  "/",
  upload.fields([{ name: "imagenes", maxCount: 10 }]),
  ProductController.crearProducto
);

router.get("/byId/:id", ProductController.obtenerProductoById);
router.put(
  "/editarProducto/:id",
  upload.fields([{ name: "imagenes", maxCount: 10 }]),
  ProductController.editarProducto
);
router.delete("/:id", ProductController.eliminarProducto);
router.get("/", ProductController.obtenerProducto);
router.get("/buscar/:query", ProductController.buscarVestidos);
router.post("/buscarAvanzados/", ProductController.buscarProductosAvanzados);

module.exports = router;

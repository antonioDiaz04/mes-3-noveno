
const express = require("express"); // Importa el framework Express para crear el enrutador.
const router = express.Router(); // Crea una nueva instancia del enrutador de Express.
const upload = require("../middleware/multer"); // Importa el middleware Multer para el manejo de la subida de archivos (imágenes).
const VestidoController = require("../Controllers/VestidoController"); // Importa el controlador que contiene la lógica de negocio para los vestidos.

// ==================================================
// RUTAS DE LA API PARA LA GESTIÓN DE VESTIDOS
// ==================================================

/**
 * @route POST /api/vestidos/
 * @desc Crea un nuevo vestido en la base de datos.
 * @access Public (o Private, si requiere autenticación de admin).
 *
 * @middleware upload.fields([{ name: "imagenes", maxCount: 10 }]):
 * Utiliza Multer para manejar la subida de hasta 10 imágenes bajo el nombre de campo 'imagenes'.
 * Estas imágenes se adjuntarán a `req.files`.
 *
 * @controller VestidoController.crearVestido:
 * Función del controlador que contiene la lógica para procesar los datos del vestido
 * y las imágenes subidas, guardándolos en la base de datos y en Cloudinary.
 */
router.post(
  "/",
  upload.fields([{ name: "imagenes", maxCount: 10 }]),
  VestidoController.crearVestido
);

/**
 * @route GET /api/vestidos/byId/:id
 * @desc Obtiene un vestido específico por su ID.
 * @access Public.
 *
 * @param {String} :id - El ID del vestido a buscar, proporcionado en la URL.
 *
 * @controller VestidoController.obtenerVestidoById:
 * Función del controlador que busca y devuelve los detalles de un vestido específico.
 * NOTA: Esta ruta es una adición que no estaba en el controlador original,
 * necesitarás agregar la función `obtenerVestidoById` en `VestidoController.js`.
 */
router.get("/byId/:id", VestidoController.obtenerVestidoById);

/**
 * @route PUT /api/vestidos/editarVestido/:id
 * @desc Actualiza la información de un vestido existente por su ID, incluyendo la gestión de imágenes.
 * @access Public (o Private, si requiere autenticación de admin).
 *
 * @param {String} :id - El ID del vestido a editar, proporcionado en la URL.
 *
 * @middleware upload.fields([{ name: "imagenes", maxCount: 10 }]):
 * Utiliza Multer para manejar la subida de hasta 10 nuevas imágenes para el vestido.
 * Las imágenes existentes a mantener deben ser enviadas como URLs en `req.body.imagenes`.
 *
 * @controller VestidoController.editarVestido:
 * Función del controlador que maneja la lógica de actualización del vestido,
 * subiendo nuevas imágenes y combinándolas con las existentes.
 */
router.put(
  "/:id", // Mantengo el endpoint como 'editarVestido' por si hay dependencias en el frontend/otras partes.
  upload.fields([{ name: "imagenes", maxCount: 10 }]),
  VestidoController.editarVestido
);

/**
 * @route DELETE /api/vestidos/:id
 * @desc Elimina un vestido de la base de datos por su ID.
 * @access Public (o Private, si requiere autenticación de admin).
 *
 * @param {String} :id - El ID del vestido a eliminar, proporcionado en la URL.
 *
 * @controller VestidoController.eliminarVestido:
 * Función del controlador que se encarga de eliminar el registro del vestido.
 * NOTA: Esta función en el controlador NO elimina las imágenes de Cloudinary,
 * lo cual sería una mejora para la gestión de recursos.
 */
router.delete("/:id", VestidoController.eliminarVestido);

/**
 * @route GET /api/vestido/
 * @desc Obtiene una lista de todos los vestidos disponibles.
 * @access Public.
 *
 * @controller VestidoController.obtenerVestido:
 * Función del controlador que recupera y devuelve todos los vestidos.
 * NOTA: El nombre de la función en el controlador original era `obtenerVestidos` o similar,
 * asegúrate de que el nombre de la función `obtenerVestido` esté definido en el controlador.
 * Se recomienda usar `obtenerTodosLosVestidos` o `listarVestidos` para mayor claridad.
 */
router.get("/", VestidoController.obtenerVestido); // Asumiendo que esta función recupera todos los vestidos.

/**
 * @route GET /api/vestidos/buscar/:query
 * @desc Busca vestidos cuyo nombre, descripción, color o categoría coincidan con un término de búsqueda.
 * @access Public.
 *
 * @param {String} :query - El término de búsqueda, proporcionado en la URL.
 *
 * @controller VestidoController.buscarVestidos:
 * Función del controlador que implementa la lógica de búsqueda de texto simple para vestidos.
 * NOTA: Esta ruta es una adición. Necesitarás implementar `buscarVestidos` en `VestidoController.js`.
 */
router.get("/buscar/:query", VestidoController.buscarVestidos);

/**
 * @route POST /api/vestidos/buscarAvanzados/
 * @desc Realiza una búsqueda avanzada de vestidos utilizando múltiples filtros (ej. categoría, color, rango de precio).
 * @access Public.
 *
 * @controller VestidoController.buscarVestidosAvanzados:
 * Función del controlador que maneja la lógica de búsqueda de vestidos con filtros complejos.
 * Utiliza un método POST para permitir un cuerpo de solicitud más detallado con los criterios de filtro.
 */
router.post("/buscarAvanzados/", VestidoController.buscarVestidosAvanzados);

// ==================================================
// RUTAS PARA MINERÍA DE DATOS Y RECOMENDACIONES DE VESTIDOS
// ==================================================

/**
 * @route GET /api/vestidos/:id/similares
 * @desc Obtiene vestidos recomendados que son similares a un vestido dado (basado en categoría, color, estilo).
 * @access Public.
 *
 * @param {String} :id - El ID del vestido base para generar recomendaciones.
 *
 * @controller VestidoController.recomendarVestidosSimilares:
 * Función del controlador que implementa la lógica de recomendación de vestidos basada en contenido.
 */
router.get("/:id/similares", VestidoController.recomendarVestidosSimilares);

/**
 * @route GET /api/vestidos/frecuentes-juntos
 * @desc Obtiene vestidos que frecuentemente se rentan/compran juntos (ej. vestidos y accesorios).
 * @access Public.
 *
 * @controller VestidoController.VestidosFrecuentesJuntos:
 * Función del controlador que implementa (o simula) la lógica de vestidos complementarios.
 */
router.get("/frecuentes-juntos", VestidoController.VestidosFrecuentesJuntos);

router.get('/por-temporadas', VestidoController.obtenerVestidosPorTemporadas);



module.exports = router; // Exporta el enrutador para ser utilizado en el archivo principal de la aplicación (ej. app.js o server.js).


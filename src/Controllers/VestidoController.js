const fs = require("fs-extra"); // Importa el módulo 'fs-extra' para operaciones con el sistema de archivos (ej. eliminar archivos temporales).
const Vestido = require("../Models/VestidoModel"); // Importa el modelo Mongoose para la colección 'Vestido' (vestidos).
const upload = require('../middleware/multer'); // Importa el middleware Multer para el manejo de subida de archivos (imágenes).
const cloudinary = require("cloudinary").v2; // Importa el SDK de Cloudinary para la gestión de imágenes en la nube.

// --- Configuración de Cloudinary ---
// Configura las credenciales de Cloudinary. ¡ATENCIÓN! En un entorno de producción,
// estas claves deben almacenarse como variables de entorno (ej. process.env.CLOUD_NAME)
// y NO ser expuestas directamente en el código por razones de seguridad.
cloudinary.config({
    cloud_name: "dvvhnrvav",
    api_key: "982632489651298",
    api_secret: "TTIZcgIMiC8F4t8cE-t6XkQnPyQ",
});

// ==================================================
// 1. FUNCIONES BÁSICAS (CRUD: Crear, Leer, Actualizar, Borrar)
// ==================================================

/**
 * @desc Crea un nuevo Vestido en la base de datos, incluyendo la subida de sus imágenes a Cloudinary.
 * @route POST /api/Vestidos
 * @access Public (o Private, si requiere autenticación de admin)
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Datos del Vestido (nombre, descripción, precios, etc.).
 * @property {String} nombre - Nombre del vestido.
 * @property {String} descripcion - Descripción detallada del vestido.
 * @property {String} categoria - Categoría del vestido (ej. "Noche", "Coctel").
 * @property {String} estilo - Estilo del vestido (ej. "Sirena", "A-line").
 * @property {String} color - Color principal del vestido.
 * @property {Array<String>} tallas_disponibles - Array de tallas disponibles.
 * @property {Number} precio_renta - Precio para la renta del vestido.
 * @property {Number} precio_venta - Precio para la venta del vestido.
 * @property {String} material - Material principal del vestido.
 * @property {Array<String>} [temporada] - Temporadas en las que es apto el vestido.
 * @property {Boolean} [is_popular=false] - Indicador de popularidad del vestido.
 * @property {Boolean} [disponible_renta=true] - Disponibilidad para renta.
 * @property {Boolean} [disponible_venta=true] - Disponibilidad para venta.
 * @property {Date} [fecha_adquisicion] - Fecha de adquisición del vestido.
 * @property {String} [condicion] - Estado físico del vestido (ej. "Nuevo", "Excelente").
 * @property {String} [proveedor] - Nombre del proveedor.
 * @param {Object} req.files - Archivos subidos por Multer.
 * @property {Array<File>} req.files.imagenes - Array de archivos de imagen a subir.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 201 - JSON con mensaje de éxito y el Vestido creado.
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body Ejemplo (Form-data para Postman/Insomnia, con archivos en el campo 'imagenes'):
 * {
 * "nombre": "Vestido de Fiesta Gala",
 * "descripcion": "Vestido largo elegante...",
 * "categoria": "Noche",
 * "estilo": "Princesa",
 * "color": "Rojo",
 * "tallas_disponibles": ["S", "M"],
 * "precio_renta": 3000,
 * "precio_venta": 9500,
 * "material": "Seda",
 * "temporada": ["Invierno"],
 * "condicion": "Excelente"
 * }
 * Y un campo de archivo llamado 'imagenes' con los archivos.
 */
exports.crearVestido = async (req, res) => {
    try {
        // Llama a la función auxiliar para subir las imágenes a Cloudinary.
        // req.files.imagenes contiene el array de archivos temporales subidos por Multer.
        const imagenesSubidas = await subirImagenesCloudinary(req.files?.imagenes);

        // Crea una nueva instancia del modelo Vestido con los datos del cuerpo de la solicitud
        // y las URLs de las imágenes subidas.
        const Vestido = new Vestido({ ...req.body, imagenes: imagenesSubidas });

        // Guarda el nuevo Vestido en la base de datos.
        await Vestido.save();

        // Responde con un estado 201 (Creado) y los datos del Vestido.
        res.status(201).json({ message: "Vestido creado exitosamente", Vestido });
    } catch (error) {
        // Captura cualquier error que ocurra durante el proceso.
        console.error("Error al crear el Vestido:", error); // Log del error para depuración.
        res.status(500).json({ error: "Ocurrió un error al crear el Vestido." });
    }
};

/**
 * @desc Edita un Vestido existente en la base de datos, incluyendo la gestión de imágenes.
 * Permite añadir nuevas imágenes o mantener las existentes.
 * @route PUT /api/Vestidos/:id
 * @access Public (o Private, si requiere autenticación de admin)
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @property {String} id - ID del Vestido a editar.
 * @param {Object} req.body - Datos del Vestido a actualizar.
 * @property {String} [nombre] - Nuevo nombre del vestido.
 * @property {String} [descripcion] - Nueva descripción.
 * @property {String} [imagenes] - Cadena de URLs de imágenes existentes separadas por comas que se desean mantener.
 * @param {Object} req.files - Archivos subidos por Multer.
 * @property {Array<File>} [req.files.imagenes] - Nuevos archivos de imagen a subir.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con éxito y el Vestido actualizado.
 * @returns {Object} 404 - Si el Vestido no se encuentra. (No implementado explícitamente, Mongoose devuelve null).
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body Ejemplo (Form-data para Postman/Insomnia):
 * {
 * "nombre": "Vestido de Fiesta Gala (Actualizado)",
 * "precio_renta": 3200,
 * "imagenes": "url_imagen_existente1,url_imagen_existente2" // URLs que deseas mantener
 * }
 * Y un campo de archivo opcional llamado 'imagenes' con nuevos archivos.
 */
exports.editarVestido = async (req, res) => {
    try {
        const { id } = req.params; // Extrae el ID del Vestido de los parámetros de la URL.

        // Llama a la función auxiliar para procesar imágenes: sube las nuevas y combina con las existentes.
        const imagenesFinales = await procesarImagenes(req, id);

        // Busca y actualiza el Vestido por su ID.
        // { ...req.body, imagenes: imagenesFinales }: Combina los datos del cuerpo con las URLs de imágenes procesadas.
        // { new: true }: Asegura que la respuesta contenga el documento actualizado.
        const VestidoActualizado = await Vestido.findByIdAndUpdate(
            id,
            { ...req.body, imagenes: imagenesFinales },
            { new: true }
        );

        // Si el Vestido no se encuentra, Mongoose devolverá `null` y esto seguirá 200,
        // una mejor práctica sería verificar `if (!VestidoActualizado) return res.status(404).json(...)`
        res.json({ success: true, Vestido: VestidoActualizado });
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al editar el Vestido:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc Elimina un Vestido de la base de datos.
 * No se encarga de eliminar las imágenes de Cloudinary, lo cual es una mejora potencial.
 * @route DELETE /api/Vestidos/:id
 * @access Public (o Private, si requiere autenticación de admin)
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @property {String} id - ID del Vestido a eliminar.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con mensaje de éxito.
 * @returns {Object} 500 - Envía un string de error si la operación falla.
 *
 * @body No se espera cuerpo para este método.
 */
exports.eliminarVestido = async (req, res) => {
    try {
        // Busca y elimina un documento de Vestido por su ID.
        await Vestido.deleteOne({ _id: req.params.id });

        // Responde con un estado 200 (OK) y un mensaje de éxito.
        res.status(200).json({ message: "Vestido eliminado con éxito." });
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error(error);
        res.status(500).send("Error en el servidor: " + error);
    }
};

// obtener todos los vestidos
/**
 * @desc Obtiene una lista de todos los vestidos disponibles.
 * @route GET /api/vestidos
 * @access Public
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {Object} 200 - JSON con un array de vestidos.
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 * @body No se espera cuerpo para este método.
 * @example
 * GET /api/vestidos
 * @returns {Array} [{ "nombre": "Vestido de Gala", "precio_
 * venta": 5000, "imagenes": ["url1", "url2"] }, ...]
 * */
exports.obtenerVestido = async (req, res) => {
    try {
        // Busca todos los vestidos en la colección 'Vestido' y los devuelve.
        const vestidos = await Vestido.find({}); // El {} asegura que no haya filtros, trayendo todo.
        res.status(200).json(vestidos); // Responde con un estado 200
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al obtener vestidos:", error);
        res.status(500).json({ error: "Error al obtener vestidos." });
    }
};


// ==================================================
// 2. FUNCIONES DE BÚSQUEDA AVANZADA
// ==================================================

/**
 * @desc Obtiene una lista de Vestidos que actualmente están en promoción.
 * Considera la fecha de inicio y fin de la promoción.
 * @route GET /api/Vestidos/promociones
 * @access Public
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con un array de Vestidos en promoción (máx. 20).
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body No se espera cuerpo para este método.
 */
exports.obtenerVestidosEnPromocion = async (req, res) => {
    try {
        const hoy = new Date(); // Obtiene la fecha y hora actual.
        // Busca Vestidos que estén marcados como 'en_promocion',
        // cuya fecha de inicio sea menor o igual a hoy y la fecha de fin sea mayor o igual a hoy.
        // Limita los resultados a 20.
        const Vestidos = await Vestido.find({
            en_promocion: true,
            fecha_inicio_promocion: { $lte: hoy },
            fecha_fin_promocion: { $gte: hoy },
        }).limit(20);

        // Responde con un estado 200 (OK) y el array de Vestidos encontrados.
        res.status(200).json(Vestidos);
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al buscar promociones:", error);
        res.status(500).json({ error: "Error al buscar promociones." });
    }
};

/**
 * @desc Obtiene una lista de Vestidos que están en oferta (rebajas permanentes).
 * Busca Vestidos con el flag `en_oferta` a true y `precio_oferta` mayor que cero.
 * @route GET /api/Vestidos/ofertas
 * @access Public
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con un array de Vestidos en oferta (máx. 20).
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body No se espera cuerpo para este método.
 */
exports.obtenerVestidosEnOferta = async (req, res) => {
    try {
        // Busca Vestidos que estén marcados como 'en_oferta' y tengan un 'precio_oferta' positivo.
        // Limita los resultados a 20.
        const Vestidos = await Vestido.find({
            en_oferta: true,
            precio_oferta: { $gt: 0 }
        }).limit(20);

        // Responde con un estado 200 (OK) y el array de Vestidos encontrados.
        res.status(200).json(Vestidos);
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al buscar ofertas:", error);
        res.status(500).json({ error: "Error al buscar ofertas." });
    }
};
// buscar vestidos avanzados

exports.buscarVestidosAvanzados = async (req, res) => {
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

/**
 * @desc Obtiene una lista de los Vestidos mejor calificados.
 * Filtra por `rating_promedio` alto y un mínimo de `review_count`.
 * @route GET /api/Vestidos/top-rated
 * @access Public
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con un array de Vestidos mejor calificados (máx. 10).
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body No se espera cuerpo para este método.
 */
exports.obtenerVestidosMejorCalificados = async (req, res) => {
    try {
        // Busca Vestidos con un 'rating_promedio' de 4.5 o más y al menos 5 reseñas.
        // Ordena los resultados por 'rating_promedio' de forma descendente (-1) y limita a 10.
        const Vestidos = await Vestido.find({
            rating_promedio: { $gte: 4.5 },
            review_count: { $gte: 5 }
        })
            .sort({ rating_promedio: -1 }) // Orden descendente
            .limit(10);

        // Responde con un estado 200 (OK) y el array de Vestidos encontrados.
        res.status(200).json(Vestidos);
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al buscar Vestidos destacados:", error);
        res.status(500).json({ error: "Error al buscar Vestidos destacados." });
    }
};
// GET /api/vestidos/buscar/:query
/**
 * @desc Busca vestidos cuyo nombre, descripción, color o categoría coincidan con un término de búsqueda.
 * @route GET /api/vestidos/buscar/:query
 * @access Public
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @property {String} query - Término de búsqueda proporcionado en la URL.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con un array de vestidos que coinciden con el término de búsqueda.
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body No se espera cuerpo para este método.
 */
exports.buscarVestidos = async (req, res) => {
    try {
        const { query } = req.params; // Extrae el término de búsqueda de los parámetros de la URL.

        // Realiza una búsqueda en la colección 'Vestido' utilizando una expresión regular para coincidencias parciales.
        // Busca en los campos 'nombre', 'descripcion', 'color' y 'categoria'.
        const vestidos = await Vestido.find({
            $or: [
                { nombre: { $regex: query, $options: "i" } }, // Coincidencia parcial en nombre (insensible a mayúsculas).
                { descripcion: { $regex: query, $options: "i" } }, // Coincidencia parcial en descripción.
                { color: { $regex: query, $options: "i" } }, // Coincidencia parcial en color.
                { categoria: { $regex: query, $options: "i" } } // Coincidencia parcial en categoría.
            ]
        });

        // Responde con un estado 200 (OK) y el array de vestidos encontrados.
        res.status(200).json(vestidos);
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al buscar vestidos:", error);
        res.status(500).json({ error: "Error al buscar vestidos." });
    }
}
// @route POST /api/vestidos/buscarAvanzados/
/**
 * @desc Realiza una búsqueda avanzada de vestidos utilizando múltiples filtros (ej. categoría, color
 * rango de precio).
 * @route POST /api/vestidos/buscarAvanzados/
 * @access Public
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.body - Cuerpo de la solicitud con los filtros de búsqueda.
 * @property {String} [categoria] - Filtrar por categoría del vestido.
 * @property {String} [color] - Filtrar por color del vestido.
 * @property {String} [tallaDisponible] - Filtrar por talla disponible (ej. "S", "M", "L").
 * @property {Number} [precioMinimo] - Filtrar por precio mínimo.
 * @property {Number} [precioMaximo] - Filtrar por precio máximo.
 * @param {Object} res - Objeto de respuesta de Express.
 * 
 * @returns {Object} 200 - JSON con un array de vestidos que coinciden con los filtros.
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 * @body Ejemplo (JSON):
 * {
 * "categoria": "Noche",
 *  "color": "Rojo",
 * "tallaDisponible": "M",
 * "precioMinimo": 1000,
 * "precioMaximo": 5000
 * }
 * */
exports.buscarVestidosAvanzados = async (req, res) => {
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

    // Filtrar por rango de precio si se proporciona
    if (filtros.precioMinimo || filtros.precioMaximo) {
        query.precio_venta = {}; // Inicializa el objeto de precio
        if (filtros.precioMinimo) {
            query.precio_venta.$gte = filtros.precioMinimo; // Precio mínimo
            console.log('Filtrando por precio mínimo:', filtros.precioMinimo);
        }
        if (filtros.precioMaximo) {
            query.precio_venta.$lte = filtros.precioMaximo; // Precio máximo
            console.log('Filtrando por precio máximo:', filtros.precioMaximo);
        }
    }
    try {
        // Consulta a la base de datos con los filtros construidos
        const vestidos = await Vestido.find(query) // Usar el objeto query completo
            .select('nombre imagenes precio_venta categoria tallaDisponible color')
            .limit(50);
        console.log('Vestidos encontrados:', vestidos);
        // Enviar los resultados al cliente en formato JSON
        res.status(200).json({ resultados: vestidos });
    } catch (error) {
        console.error('Error al buscar vestidos:', error);
        // Responder al cliente con un error
        res.status(500).json({ error: 'Error al buscar vestidos' });
    }
};
// @route GET /api/vestidos/byId/:id
/**
 * @desc Obtiene un vestido por su ID.
 * @route GET /api/vestidos/byId/:id
 * @access Public
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @property {String} id - ID del vestido a obtener.
 * @param {Object} res - Objeto de respuesta de Express.
 *  * @returns {Object} 200 - JSON con los datos del vestido encontrado.
 * @returns {Object} 404 - Si el vestido no se encuentra.
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 * @body No se espera cuerpo para este método.
 * @example
 * GET /api/vestidos/byId/60c72b2f9b1e8c001c8e4d3a
 * @returns {Object} { "nombre": "Vestido de Gala", "precio_venta": 5000, "imagenes": ["url1", "url2"] }
 * */
exports.obtenerVestidoById = async (req, res) => {
    try {
        const { id } = req.params; // Extrae el ID del vestido de los parámetros de la URL.
        // Busca el vestido por su ID en la colección 'Vestido'.
        const vestido = await Vestido
            .findById(id)
            .select('nombre imagenes precio_venta categoria tallaDisponible color descripcion'); // Seleccion
        // Si no se encuentra el vestido, devuelve un error 404.
        if (!vestido) {
            return res.status(404).json({ error: "Vestido no encontrado." });
        }
        // Responde con un estado 200 (OK) y los datos del vestido encontrado.
        res.status(200).json(vestido);
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al obtener el vestido por ID:", error);
        res.status(500).json({
            error: "Error al obtener el vestido por ID."
        });
    }
};


// ==================================================
// 3. MINERÍA DE DATOS & RECOMENDACIONES (Implementación Básica)
// ==================================================

/**
 * @desc Recomienda Vestidos similares basándose en la categoría, color o estilo de un Vestido dado.
 * Esta es una implementación de recomendación basada en contenido (content-based).
 * @route GET /api/Vestidos/:id/similares
 * @access Public
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} req.params - Parámetros de la URL.
 * @property {String} id - ID del Vestido base para encontrar similares.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con un array de Vestidos similares (máx. 6).
 * @returns {Object} 404 - JSON con error si el Vestido base no se encuentra.
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body No se espera cuerpo para este método.
 */
exports.recomendarVestidosSimilares = async (req, res) => {
    try {
        const { id } = req.params; // Obtiene el ID del Vestido del cual buscar similares.
        const Vestido = await Vestido.findById(id); // Busca el Vestido por su ID.

        // Si el Vestido no existe, devuelve un error 404.
        if (!Vestido) {
            return res.status(404).json({ error: "Vestido no encontrado." });
        }

        // Busca otros Vestidos que coincidan en categoría, color O estilo con el Vestido base.
        // Excluye el Vestido original de los resultados ($ne: not equal).
        // Limita a 6 resultados y selecciona solo los campos 'nombre', 'imagenes', 'precio_venta', 'rating_promedio'.
        const similares = await Vestido.find({
            $or: [ // Utiliza $or para buscar coincidencias en cualquiera de estos campos.
                { categoria: Vestido.categoria },
                { color: Vestido.color },
                { estilo: Vestido.estilo }
            ],
            _id: { $ne: id } // Excluye el Vestido actual de los resultados.
        })
            .limit(6) // Limita el número de recomendaciones.
            .select("nombre imagenes precio_venta rating_promedio"); // Selecciona los campos a devolver.

        // Responde con un estado 200 (OK) y los Vestidos similares.
        res.status(200).json(similares);
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al generar recomendaciones:", error);
        res.status(500).json({ error: "Error al generar recomendaciones." });
    }
};

/**
 * @desc Simula la funcionalidad de "Vestidos frecuentemente comprados juntos" o "complementos".
 * NOTA: Esta es una implementación ESTÁTICA/BÁSICA. Para un sistema real, requeriría
 * un análisis de reglas de asociación (Apriori, Eclat) sobre la colección de `transacciones`
 * o `items_de_pedido` en MongoDB/Python.
 * @route GET /api/Vestidos/frecuentes-juntos
 * @access Public
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 *
 * @returns {Object} 200 - JSON con un array de Vestidos relacionados (máx. 4).
 * @returns {Object} 500 - JSON con mensaje de error si la operación falla.
 *
 * @body No se espera cuerpo para este método.
 */
exports.VestidosFrecuentesJuntos = async (req, res) => {
    try {
        // En un sistema real, esta lógica debería:
        // 1. Analizar la colección de `transacciones` para encontrar qué Vestidos
        //    (especialmente accesorios) se compraron/rentaron junto con vestidos.
        // 2. Podría usar un modelo de reglas de asociación previamente calculado en Python.

        // Por ahora, es un ejemplo estático que busca accesorios genéricos.
        const VestidosRelacionados = await Vestido.find({
            categoria: "Accesorios", // Busca solo en la categoría de accesorios.
            $or: [ // Coincidencia por nombre para "Zapatos" o "Bolso".
                { nombre: { $regex: "Zapatos", $options: "i" } },
                { nombre: { $regex: "Bolso", $options: "i" } }
            ]
        }).limit(4); // Limita los resultados a 4.

        // Responde con un estado 200 (OK) y los Vestidos relacionados.
        res.status(200).json(VestidosRelacionados);
    } catch (error) {
        // Captura y loggea cualquier error.
        console.error("Error al buscar Vestidos relacionados:", error);
        res.status(500).json({ error: "Error al buscar Vestidos relacionados." });
    }
};

// ==================================================
// FUNCIONES AUXILIARES (Internas del Controlador)
// ==================================================

/**
 * @desc Función auxiliar para subir un array de archivos de imagen a Cloudinary.
 * También se encarga de eliminar los archivos temporales después de la subida.
 * @param {Array<File>} imagenes - Array de objetos de archivo (proporcionados por Multer).
 * @returns {Array<String>} Un array de URLs seguras de las imágenes subidas.
 */
async function subirImagenesCloudinary(imagenes = []) {
    const urls = []; // Array para almacenar las URLs de las imágenes subidas.
    for (const imagenFile of imagenes) {
        try {
            // Sube cada archivo a Cloudinary.
            // 'folder': Define la carpeta en Cloudinary donde se guardarán las imágenes.
            const resultado = await cloudinary.uploader.upload(imagenFile.path, {
                folder: "VestidosAtelier", // Puedes cambiar esta carpeta si deseas.
            });
            urls.push(resultado.secure_url); // Añade la URL segura de la imagen al array.
            await fs.unlink(imagenFile.path); // Elimina el archivo temporal del servidor local.
        } catch (error) {
            console.error("Error al subir imagen a Cloudinary:", error);
            // Decide si lanzar el error o continuar con las otras imágenes.
            // Aquí se continúa, pero se loggea el error.
        }
    }
    return urls; // Devuelve el array de URLs.
}

/**
 * @desc Función auxiliar para gestionar las imágenes durante la edición de un Vestido.
 * Combina URLs de imágenes existentes (enviadas desde el frontend) con nuevas imágenes subidas.
 * @param {Object} req - Objeto de solicitud de Express (para acceder a req.body y req.files).
 * @param {String} VestidoId - El ID del Vestido que se está editando.
 * @returns {Array<String>} Un array de URLs finales de las imágenes para el Vestido.
 */
async function procesarImagenes(req, VestidoId) {
    // Convierte la cadena de URLs existentes (si se envía) a un array.
    // El frontend debería enviar un string de URLs separadas por comas de las imágenes que quiere mantener.
    let imagenesFinales = req.body.imagenes?.split(',') || [];

    // (Opcional, pero buena práctica si se quiere limpiar imágenes antiguas de Cloudinary:
    //  Se podría comparar `imagenesFinales` con las imágenes actuales del `VestidoExistente`
    //  y eliminar las que ya no están en `imagenesFinales` de Cloudinary.)
    // const VestidoExistente = await Vestido.findById(VestidoId); 

    // Si hay nuevas imágenes en la solicitud (req.files.imagenes), las sube a Cloudinary.
    if (req.files?.imagenes) {
        const nuevasImagenes = await subirImagenesCloudinary(req.files.imagenes);
        // Combina las URLs de las imágenes existentes con las nuevas.
        imagenesFinales = [...imagenesFinales, ...nuevasImagenes];
    }

    // Filtra cualquier URL vacía que pueda haber resultado de la división de la cadena.
    return imagenesFinales.filter(url => url);
}
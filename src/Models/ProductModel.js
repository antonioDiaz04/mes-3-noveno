const mongoose = require("mongoose"); // Importa la librería Mongoose.

// Define el esquema de Mongoose para la colección 'productos' (vestidos).
const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  talla: {
    type: String,
    required: true,
  },
  altura: {
    type: Number,
    // required: true,
    required: false,
  },
  cintura: {
    type: Number,
    required: false,
  },
  color: {
    type: String,
    required: true,
  },
  textura: {
    type: String,
    required: false,
  },
  // --- Información Básica ---
  // Campo para el nombre del vestido. Es obligatorio y se limpia de espacios en blanco al inicio/fin.
  nombre: {
    type: String,
    required: true,
    trim: true,
    // Sugerencia: Añadir 'index: true' si se espera buscar frecuentemente por nombre para optimizar consultas.
  },
  // Descripción detallada del vestido. Opcional, pero muy útil para el usuario.
  descripcion: {
    type: String,
    required: false, // Permitir que sea opcional si no siempre se tiene una descripción extensa.
    trim: true,
  },
  // Color principal del vestido.
  color: {
    type: String,
    required: true,
    // Sugerencia: Considerar un 'enum' si los colores son estandarizados para evitar inconsistencias (ej. "Rojo", "Azul").
  },
  // Textura del material del vestido.
  textura: {
    type: String,
    required: false,
    // Sugerencia: Usar un 'enum' si las texturas son limitadas (ej. "Seda", "Encaje", "Terciopelo").
  },

  talla: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL", "Otro"],
    required: false,
  },
  medidas: {
    altura: { type: Number, required: false },
    cintura: { type: Number, required: false },
  },
  precioAnterior: {
    type: Number,
    required: false,
    min: 0,
  },
  precioActual: {
    type: Number,
    required: true,
    min: 0,
  },
  mostrarPrecioAnterior: {
    type: Boolean,
    required: false,
    default: false,
  },

  opcionesTipoTransaccion: {
    type: String,
    required: true,
    default: "Venta",
  },
  nuevo: {
    type: Boolean,
    required: true,
    default: true,
  },
  disponible: {
    type: Boolean,
    required: false,
    default: true,
  },
  tipoCuello: {
    type: String,
    required: true,
  },
  tipoCola: {
    type: String,
    required: true,
  },
  tipoCapas: {
    type: String,
    required: true,
  },
  tipoHombro: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: false,
    trim: true,
  },
  imagenes: {
    type: [String],
    default: [],
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
  idCategoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
    required: false
  },
  categorias: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: false
    }
  ],

  // --- Tallas y Medidas ---
  // Talla individual del vestido. Puede ser redundante si 'tallas_disponibles' ya existe y el producto tiene una sola talla.
  // Sugerencia: Podrías considerar hacer este campo 'tallas_disponibles' el principal y, si es un producto de una sola talla,
  // que 'tallas_disponibles' contenga un array con solo esa talla. Esto simplifica la lógica.
  talla: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL", "Otro"], // Asegura que solo se usen valores válidos.
    required: true, // Esto implica que cada documento de vestido representa una talla específica.
    // Si un documento representa un modelo de vestido con múltiples tallas, 'tallas_disponibles' sería más adecuado.
  },
  // Array de tallas disponibles para un mismo modelo de producto.
  // Esto es muy útil si un mismo 'nombre' de vestido existe en varias tallas.
  tallas_disponibles: {
    type: [String],
    enum: ["XS", "S", "M", "L", "XL", "XXL", "Otro"],
    required: false,
    // Sugerencia: Si un producto se gestiona por modelo (ej. "Vestido Noche Rojo") y tiene múltiples tallas,
    // esta sería la forma correcta de manejarlo. El campo 'talla' de arriba podría ser omitido en ese caso,
    // o si un documento es para una instancia específica de vestido con una única talla.
  },
  // Objeto para almacenar medidas detalladas del vestido.
  medidas: {
    altura: { type: Number, required: false }, // en centímetros
    cintura: { type: Number, required: false }, // en centímetros
    // Sugerencia: Podrías añadir otras medidas relevantes como busto, cadera, largo de manga, etc.
  },

  // --- Estilo y Temporada ---
  // Estilo general del vestido.
  estilo: {
    type: String,
    enum: ["Casual", "De Oficina", "De Noche", "De Deporte", "Otro", "Boda", "Fiesta"], // Ampliar enum para más versatilidad.
    required: false, // Permitir opcional si no aplica a todos los vestidos.
  },
  // Temporada o temporadas para las que el vestido es apropiado. Es un array para flexibilidad.
  temporada: {
    type: [String],
    enum: ["Primavera", "Verano", "Otoño", "Invierno", "Todo el Año"],
    required: false,
  },

  // --- Precios y Disponibilidad ---
  // Precio fijo de renta del vestido.
  precio_renta: {
    type: Number,
    min: 0, // Asegura que el precio no sea negativo.
    // Requerido solo si el vestido está disponible para renta. Lógica condicional sólida.
    required: function () { return this.disponible_renta; },
  },
  // Precio base de venta del vestido (sin considerar descuentos o promociones).
  precio_venta: {
    type: Number,
    min: 0,
    // Requerido solo si el vestido está disponible para venta. Lógica condicional sólida.
    required: function () { return this.disponible_venta; },
  },
  // Booleano que indica si el vestido está disponible para renta.
  disponible_renta: {
    type: Boolean,
    default: false,
  },
  // Booleano que indica si el vestido está disponible para venta.
  disponible_venta: {
    type: Boolean,
    default: true,
  },

  // --- Promociones (Descuentos Temporales) ---
  // Flag que indica si el vestido está actualmente en una promoción temporal.
  en_promocion: {
    type: Boolean,
    default: false,
  },
  // Precio del vestido durante el período de promoción.
  precio_promocion: {
    type: Number,
    min: 0,
    // Requerido solo si 'en_promocion' es true.
    required: function () { return this.en_promocion; },
    // Validación: El precio de promoción debe ser menor que el precio de venta normal.
    validate: {
      validator: function (value) {
        return value < this.precio_venta;
      },
      message: "El precio de promoción debe ser menor al precio normal.",
    },
  },
  // Fecha de inicio de la promoción.
  fecha_inicio_promocion: {
    type: Date,
    // Requerido solo si 'en_promocion' es true.
    required: function () { return this.en_promocion; },
  },
  // Fecha de finalización de la promoción.
  fecha_fin_promocion: {
    type: Date,
    // Requerido solo si 'en_promocion' es true.
    required: function () { return this.en_promocion; },
    // Sugerencia: Añadir validación para asegurar que `fecha_fin_promocion` sea posterior a `fecha_inicio_promocion`.
  },

  // --- Ofertas (Rebajas Permanentes o Especiales) ---
  // Flag que indica si el vestido está en oferta (ej. liquidación, fin de temporada, precio permanente rebajado).
  en_oferta: {
    type: Boolean,
    default: false,
  },
  // Precio rebajado aplicable si el vestido está en oferta.
  precio_oferta: {
    type: Number,
    min: 0,
    // Requerido solo si 'en_oferta' es true.
    required: function () { return this.en_oferta; },
    // Validación: El precio de oferta debe ser menor que el precio de venta normal.
    validate: {
      validator: function (value) {
        return value < this.precio_venta;
      },
      message: "El precio de oferta debe ser menor al precio normal.",
    },
  },
  // Razón específica de la oferta (ej. "Liquidación", "Fin de Temporada", "Daño Menor").
  motivo_oferta: {
    type: String,
    // Requerido solo si 'en_oferta' es true.
    required: function () { return this.en_oferta; },
    // Sugerencia: Podría ser un 'enum' para motivos estandarizados.
  },

  // --- Detalles Específicos del Vestido ---
  // Tipo de cuello del vestido.
  tipoCuello: {
    type: String,
    required: false,
    // Sugerencia: Enum de tipos de cuello comunes.
  },
  // Tipo de cola (para vestidos de novia/gala).
  tipoCola: {
    type: String,
    required: false,
    // Sugerencia: Enum de tipos de cola.
  },
  // Información sobre las capas del vestido.
  tipoCapas: {
    type: String,
    required: false,
    // Sugerencia: Enum de tipos de capas.
  },
  // Tipo de hombro (ej. "Sin tirantes", "Un hombro", "Manga larga").
  tipoHombro: {
    type: String,
    required: false,
    // Sugerencia: Enum de tipos de hombro.
  },
  // Material principal o tipo de tela. (Redundante con 'material' si ya lo tienes al inicio).
  // Sugerencia: Consolidar 'material' y 'textura' en un solo campo o estructurarlo mejor.
  material: { // Este campo ya existe arriba, considera si es necesario aquí de nuevo.
    type: String,
    required: false,
  },
  // Condición actual del vestido.
  condicion: {
    type: String,
    enum: ["Nuevo", "Excelente", "Bueno", "Usado"], // Lista de valores permitidos.
    default: "Nuevo",
  },

  // --- Imágenes y Categorías ---
  // Array de URLs de las imágenes del vestido (provenientes de Cloudinary).
  imagenes: {
    type: [String],
    default: [], // Por defecto, un array vacío.
  },
  // Referencia al ID de la categoría a la que pertenece el vestido.
  // Establece una relación con otra colección 'Categoria'.
  idCategoria: {
    type: mongoose.Schema.Types.ObjectId, // Tipo de dato para IDs de MongoDB.
    ref: "Categoria", // Nombre del modelo de la colección referenciada.
    required: true,
    // Sugerencia: Asegúrate de que la colección 'Categoria' exista y tenga documentos válidos.
  },

  // --- Metadata para Minería de Datos y Funciones Auxiliares ---
  // Calificación promedio del vestido basada en las reseñas de los usuarios.
  // Este campo DEBE ser actualizado dinámicamente cada vez que se agrega una nueva reseña.
  rating_promedio: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    // Sugerencia: Implementar un pre-save hook o un post-save hook en el modelo de Reseña
    // para recalcular este valor y 'review_count' cuando se añade/edita una reseña.
  },
  // Número total de reseñas que ha recibido el vestido.
  review_count: {
    type: Number,
    default: 0,
    // Sugerencia: Similar a 'rating_promedio', actualizar con hooks o triggers.
  },
  // Indicador booleano para la popularidad del vestido.
  // Útil como variable objetivo para modelos de clasificación de demanda, o para filtros rápidos.
  is_popular: {
    type: Boolean,
    default: false,
    // Sugerencia: Este campo podría ser actualizado por un cron job que ejecute tu modelo de minería de datos
    // (clasificación de demanda) periódicamente y actualice este flag.
  },
  // Fecha de creación del registro del producto en la base de datos.
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

// --- Índices para Optimización de Consultas ---
// Los índices mejoran significativamente el rendimiento de las operaciones de lectura (find, sort).

// Índice de texto para búsquedas en 'nombre'. Permite búsquedas de texto completas.
// Combina con otros campos para consultas compuestas.
productoSchema.index({ nombre: "text", color: 1, precio_venta: 1, rating_promedio: -1 });

// Índices individuales para campos booleanos que se usarán frecuentemente en filtros.
// Un índice en '1' (ascendente) es suficiente para booleanos.
productoSchema.index({ en_promocion: 1 });
productoSchema.index({ en_oferta: 1 });
// Sugerencia: Añadir índices a 'categoria', 'estilo', 'temporada' si se usan mucho para filtrar/recomendar.
// productoSchema.index({ categoria: 1, estilo: 1, temporada: 1 });


// Exporta el modelo Mongoose, lo que permite interactuar con la colección 'productos'.
// El nombre del modelo aquí es 'Producto' (singular), Mongoose lo pluralizará a 'productos' para la colección.
module.exports = mongoose.model("Producto", productoSchema);
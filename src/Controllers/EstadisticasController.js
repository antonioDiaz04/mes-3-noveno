// const Venta = require("../Models/VentaModel");
// const Renta = require("../Models/RentaModel");
// const redis = require("redis");
// const {logger} = require("../util/logger");

// const client = redis.createClient();

// // Función para obtener cliente frecuente
// const obtenerClienteFrecuente = async (modelo, campo) => {
//   try {
//     const clienteMasFrecuente = await modelo.aggregate([
//       { $group: { _id: campo, total: { $sum: 1 } } },
//       { $sort: { total: -1 } },
//       { $limit: 1 },
//     ]);
//     return clienteMasFrecuente;
//   } catch (error) {
//     logger.error("Error al obtener cliente frecuente:", error);
//     throw new Error("Error interno del servidor");
//   }
// };

// // Obtener totales de compras y rentas
// exports.obtenerTotales = async (req, res) => {
//   try {
//     client.get("totales", async (err, data) => {
//       if (data) {
//         return res.status(200).json(JSON.parse(data)); // Si está cacheado, lo devolvemos
//       } else {
//         const [totalCompras, totalRentas] = await Promise.all([
//           Venta.countDocuments(),
//           Renta.countDocuments(),
//         ]);
//         const result = { totalCompras, totalRentas };
//         client.setex("totales", 3600, JSON.stringify(result)); // Cacheamos por 1 hora
//         res.status(200).json(result);
//       }
//     });
//   } catch (error) {
//     logger.error("Error al obtener totales:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener ingresos totales
// exports.obtenerIngresosTotales = async (req, res) => {
//   try {
//     const totalIngresosVentas = await Venta.aggregate([
//       { $group: { _id: null, totalIngresos: { $sum: "$resumen.total" } } },
//     ]);

//     const totalIngresosRentas = await Renta.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalIngresos: { $sum: "$detallesPago.precioRenta" },
//         },
//       },
//     ]);

//     res.status(200).json({
//       ingresosVentas: totalIngresosVentas[0]?.totalIngresos || 0,
//       ingresosRentas: totalIngresosRentas[0]?.totalIngresos || 0,
//     });
//   } catch (error) {
//     logger.error("Error al obtener ingresos totales:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener productos más vendidos y rentados
// exports.obtenerProductosPopulares = async (req, res) => {
//   try {
//     const productoMasVendido = await Venta.aggregate([
//       { $unwind: "$productos" },
//       {
//         $group: {
//           _id: "$productos.producto",
//           totalVendido: { $sum: "$productos.cantidad" },
//         },
//       },
//       { $sort: { totalVendido: -1 } },
//       { $limit: 1 },
//     ]);

//     const productoMasRentado = await Renta.aggregate([
//       { $group: { _id: "$producto", totalRentas: { $sum: 1 } } },
//       { $sort: { totalRentas: -1 } },
//       { $limit: 1 },
//     ]);

//     res.status(200).json({ productoMasVendido, productoMasRentado });
//   } catch (error) {
//     logger.error("Error al obtener productos populares:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener número de clientes activos
// exports.obtenerClientesActivos = async (req, res) => {
//   try {
//     const clientesActivosVentas = await Venta.distinct("usuario");
//     const clientesActivosRentas = await Renta.distinct("usuario");
//     const totalClientesActivos = new Set([
//       ...clientesActivosVentas,
//       ...clientesActivosRentas,
//     ]).size;

//     res.status(200).json({ totalClientesActivos });
//   } catch (error) {
//     logger.error("Error al obtener clientes activos:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener ingresos por mes
// exports.obtenerIngresosPorMes = async (req, res) => {
//   try {
//     const ingresosPorMes = await Venta.aggregate([
//       {
//         $group: {
//           _id: { $month: "$fechaVenta" },
//           totalIngresos: { $sum: "$resumen.total" },
//           totalVentas: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     res.status(200).json(ingresosPorMes);
//   } catch (error) {
//     logger.error("Error al obtener ingresos por mes:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener métodos de pago más usados
// exports.obtenerMetodosPago = async (req, res) => {
//   try {
//     const metodosPago = await Venta.aggregate([
//       { $group: { _id: "$detallesPago.metodoPago", total: { $sum: 1 } } },
//       { $sort: { total: -1 } },
//     ]);

//     res.status(200).json(metodosPago);
//   } catch (error) {
//     logger.error("Error al obtener métodos de pago:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener rentas con retraso
// exports.obtenerRentasRetrasadas = async (req, res) => {
//   try {
//     const hoy = new Date();
//     const rentasRetrasadas = await Renta.find({
//       "detallesRenta.fechaFin": { $lt: hoy },
//       estado: { $nin: ["Completado", "Cancelado"] },
//     })
//       .populate("usuario", "nombre email")
//       .lean(); // Usamos lean() para mejorar el rendimiento

//     res.status(200).json(rentasRetrasadas);
//   } catch (error) {
//     logger.error("Error al obtener rentas retrasadas:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener clientes con más compras y rentas
// exports.obtenerClientesFrecuentes = async (req, res) => {
//   try {
//     const clienteMasCompras = await obtenerClienteFrecuente(Venta, "usuario");
//     const clienteMasRentas = await obtenerClienteFrecuente(Renta, "usuario");

//     res.status(200).json({ clienteMasCompras, clienteMasRentas });
//   } catch (error) {
//     logger.error("Error al obtener clientes frecuentes:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// // Obtener gasto promedio por cliente
// exports.obtenerGastoPromedio = async (req, res) => {
//   try {
//     const gastoPromedio = await Venta.aggregate([
//       { $group: { _id: "$usuario", totalGastado: { $sum: "$resumen.total" } } },
//       { $group: { _id: null, promedio: { $avg: "$totalGastado" } } },
//     ]);

//     res.status(200).json({ gastoPromedio: gastoPromedio[0]?.promedio || 0 });
//   } catch (error) {
//     logger.error("Error al obtener gasto promedio:", error);

//     res
//       .status(500)
//       .json({ message: "Error interno del servidor", error: error.message });
//   }
// };

// const { MongoClient } = require('mongodb');
// const Mongoose = require('mongoose');
// const VestidoModel = require('./VestidoModel');

// // Define tu URI de conexión a MongoDB
// // ¡IMPORTANTE! Reemplaza con tu URI real.
// const uri = "mongodb+srv://nico:nico123@cluster0.xa138vm.mongodb.net/bdAtr";

// // Tus IDs de usuario existentes
// const userIds = [
//     "671095f84ec281b5e1fdf085", "6734d583487212b78abebf8e", "6759de427895ade8251b6295",
//     "67c686af1cfccf3f08b0ec23", "67daf51df4ed8050c7b72619", "67daf757f4ed8050c7b72622",
//     "67daf763f4ed8050c7b7262a", "67daf771f4ed8050c7b72632", "67daf77ef4ed8050c7b7263a",
//     "67daf78df4ed8050c7b72642", "67daf7a1f4ed8050c7b7264a", "67daf7adf4ed8050c7b72652",
//     "67daf7bff4ed8050c7b7265a", "67daf7c9f4ed8050c7b72662", "67daf7d5f4ed8050c7b7266a",
//     "67daf7e0f4ed8050c7b72672", "67daf7ebf4ed8050c7b7267a", "67daf8aef4ed8050c7b72692",
//     "67daf8baf4ed8050c7b7269a", "67daf8c5f4ed8050c7b726a2", "67dd9094ece929a0fadc7fa9",
//     "67de3ed8b3a4e8f9bb07fad5", "67de465b0dd48d20c6d68560", "669b7e1a3c7f8e1d2b3c4d01",
//     "669b7e1a3c7f8e1d2b3c4d03", "669b7e1a3c7f8e1d2b3c4d05", "669b7e1a3c7f8e1d2b3c4d07",
//     "669b7e1a3c7f8e1d2b3c4d09", "669b7e1a3c7f8e1d2b3c4d0b", "669b7e1a3c7f8e1d2b3c4d0d",
//     "669b7e1a3c7f8e1d2b3c4d1b", "669b7e1a3c7f8e1d2b3c4d1d", "669b7e1a3c7f8e1d2b3c4d21",
//     "669b7e1a3c7f8e1d2b3c4d23", "669b7e1a3c7f8e1d2b3c4d25", "669b7e1a3c7f8e1d2b3c4d27",
//     "669b7e1a3c7f8e1d2b3c4d29", "669b7e1a3c7f8e1d2b3c4d2b", "669b7e1a3c7f8e1d2b3c4d2d",
//     "669b7e1a3c7f8e1d2b3c4d2f", "669b7e1a3c7f8e1d2b3c4d31", "669b7e1a3c7f8e1d2b3c4d33",
//     "669b7e1a3c7f8e1d2b3c4d35", "669b7e1a3c7f8e1d2b3c4d37", "669b7e1a3c7f8e1d2b3c4d39",
//     "669b7e1a3c7f8e1d2b3c4d3b", "669b7e1a3c7f8e1d2b3c4d3d", "669b7e1a3c7f8e1d2b3c4d3f",
//     "669b7e1a3c7f8e1d2b3c4d41", "669b7e1a3c7f8e1d2b3c4d43", "669b7e1a3c7f8e1d2b3c4d45",
//     "669b7e1a3c7f8e1d2b3c4d47", "669b7e1a3c7f8e1d2b3c4d49", "669b7e1a3c7f8e1d2b3c4d4b",
//     "669b7e1a3c7f8e1d2b3c4d4d", "669b7e1a3c7f8e1d2b3c4d4f", "669b7e1a3c7f8e1d2b3c4d51",
//     "669b7e1a3c7f8e1d2b3c4d53", "669b7e1a3c7f8e1d2b3c4d55", "669b7e1a3c7f8e1d2b3c4d57",
//     "669b7e1a3c7f8e1d2b3c4d59", "669b7e1a3c7f8e1d2b3c4d5b", "669b7e1a3c7f8e1d2b3c4d5d",
//     "669b7e1a3c7f8e1d2b3c4d5f", "669b7e1a3c7f8e1d2b3c4d61", "669b7e1a3c7f8e1d2b3c4d63",
//     "669b7e1a3c7f8e1d2b3c4d65", "669b7e1a3c7f8e1d2b3c4d67", "669b7e1a3c7f8e1d2b3c4d69",
//     "669b7e1a3c7f8e1d2b3c4d6b", "669b7e1a3c7f8e1d2b3c4d6d", "669b7e1a3c7f8e1d2b3c4d6f",
//     "669b7e1a3c7f8e1d2b3c4d71", "669b7e1a3c7f8e1d2b3c4d73", "669b7e1a3c7f8e1d2b3c4d75",
//     "669b7e1a3c7f8e1d2b3c4d77", "669b7e1a3c7f8e1d2b3c4d79", "669b7e1a3c7f8e1d2b3c4d7b",
//     "669b7e1a3c7f8e1d2b3c4d7d", "669b7e1a3c7f8e1d2b3c4d7f", "669b7e1a3c7f8e1d2b3c4d81",
//     "669b7e1a3c7f8e1d2b3c4d83"
// ];

// // Funciones auxiliares
// function getRandomDate(start, end) {
//     const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
//     date.setUTCHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
//     return date;
// }

// function generateRandomReview() {
//     const comments = [
//         "Excelente vestido, justo lo que buscaba.", "Muy satisfecha con la transacción, el vestido era precioso y muy cómodo.",
//         "El servicio fue impecable y el vestido de muy buena calidad.", "Me encantó el estilo, perfecto para el evento.",
//         "Una gran compra, el vestido superó mis expectativas.", "Quizás un poco justo, pero el diseño es hermoso. Un 4 de 5.",
//         "El color es ideal, muy buena elección.", "La calidad del material es fantástica, lo recomiendo totalmente.",
//         "Llegó a tiempo y en perfectas condiciones.", "Hubo un pequeño retraso en la devolución, pero todo se solucionó bien.",
//         "El vestido es bonito, pero creo que el precio es un poco elevado.", "No me convenció del todo la talla, pero en general es un buen vestido.",
//         "Un clásico, siempre es un acierto.", "Muy contenta con mi vestido, lo usaré de nuevo si es posible."
//     ];
//     const rating = Math.floor(Math.random() * 3) + 3; // Ratings between 3 and 5
//     return {
//         comentario: comments[Math.floor(Math.random() * comments.length)],
//         rating: rating
//     };
// }

// async function insertTransactions() {
//     const client = new MongoClient(uri);

//     try {
//         await client.connect();
//         const database = client.db("bdAtr");

//         const temporadasValidas = ["Todo el año", "Verano", "Invierno"];
//         const vestidosTemporadasPermitidas = vestidos.filter(dress =>
//             dress.temporada && temporadasValidas.some(temp => dress.temporada.includes(temp))
//         );

//         const transactionsCollection = database.collection("transactions");

//         const transactions = [];
//         const numTransactions = 100; // Total de transacciones a generar

//         // Índices para iterar sobre usuarios y vestidos
//         let userIndex = 0;
//         let dressIndex = 0;

//         // Rango de fechas para la ÚNICA temporada (Otoño 2024)
//         const seasonStartDate = new Date('2024-09-01T00:00:00Z');
//         const seasonEndDate = new Date('2024-11-30T23:59:59Z');

//         // Verificar si hay vestidos de otoño para generar transacciones
//         if (vestidosTemporadasPermitidas.length === 0) {
//             console.warn("🚫 No se encontraron vestidos con la temporada 'Otoño' en la lista. No se generarán transacciones.");
//             return;
//         }

//         for (let i = 0; i < numTransactions; i++) {
//             // Selecciona un usuario rotando a través de la lista
//             const idUsuario = userIds[userIndex];
//             userIndex = (userIndex + 1) % userIds.length;

//             // Selecciona un vestido rotando a través de la lista, AHORA SOLO DE VESTIDOS DE OTOÑO
//             const selectedDress = vestidosTemporadasPermitidas[dressIndex];
//             dressIndex = (dressIndex + 1) % vestidosTemporadasPermitidas.length;

//             const transactionType = selectedDress.opcionesTipoTransaccion.toLowerCase();

//             let montoTotal = transactionType === 'renta' ? selectedDress.precio_renta : selectedDress.precio_venta;

//             // Generar fecha de transacción dentro de la ÚNICA temporada definida
//             const fechaTransaccion = getRandomDate(seasonStartDate, seasonEndDate);

//             // Aplicar precio de promoción si existe y está activo
//             if (selectedDress.en_promocion && selectedDress.precio_promocion !== null) {
//                 const promoStartDate = selectedDress.fecha_inicio_promocion ? new Date(selectedDress.fecha_inicio_promocion.$date) : null;
//                 const promoEndDate = selectedDress.fecha_fin_promocion ? new Date(selectedDress.fecha_fin_promocion.$date) : null;

//                 // Es importante que la fecha de la transacción caiga dentro del rango de la promoción
//                 if (promoStartDate && promoEndDate && fechaTransaccion >= promoStartDate && fechaTransaccion <= promoEndDate) {
//                     montoTotal = selectedDress.precio_promocion;
//                 } else {
//                     // Si la promoción no está activa en la fecha de la transacción, usa el precio regular
//                     montoTotal = transactionType === 'renta' ? selectedDress.precio_renta : selectedDress.precio_venta;
//                 }
//             }

//             if (montoTotal === null) {
//                 console.warn(`Vestido ${selectedDress.nombre} (${selectedDress._id.$oid}) tiene precio null para su tipo de transacción. Saltando transacción.`);
//                 continue;
//             }

//             const estado = ['completada', 'completada', 'completada', 'pendiente', 'cancelada'][Math.floor(Math.random() * 5)]; // Mayor probabilidad de completada
//             const estadoPago = (estado === 'completada') ? 'pagado_total' : (Math.random() < 0.5 ? 'pagado_parcial' : 'pendiente');
//             const metodoPago = ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria'][Math.floor(Math.random() * 4)];

//             let cantidadPagada = 0;
//             let fechaUltimoPago = null;

//             if (estadoPago === 'pagado_total') {
//                 cantidadPagada = montoTotal;
//                 fechaUltimoPago = new Date(fechaTransaccion.getTime() + Math.random() * (7 * 24 * 60 * 60 * 1000));
//             } else if (estadoPago === 'pagado_parcial') {
//                 cantidadPagada = montoTotal / 2;
//                 fechaUltimoPago = fechaTransaccion;
//             }

//             let detallesRenta = null;
//             let detallesDevolucionLocal = null;
//             let reseñaCliente = null;
//             let detallesEntregaLocal = {
//                 fechaRecogida: new Date(fechaTransaccion.getTime() + Math.random() * (3 * 24 * 60 * 60 * 1000)),
//                 condicionVestidoAlEntregar: ['excelente', 'bueno'][Math.floor(Math.random() * 2)],
//                 notaInternaLocal: "Vestido entregado al cliente."
//             };

//             if (transactionType === 'renta') {
//                 const fechaInicioRenta = new Date(detallesEntregaLocal.fechaRecogida.getTime() + Math.random() * (2 * 24 * 60 * 60 * 1000));
//                 const fechaFinRenta = new Date(fechaInicioRenta.getTime() + (5 * 24 * 60 * 60 * 1000));

//                 let multasAplicadas = 0;
//                 let estadoDeposito = 'devuelto_total';
//                 let fechaDevolucion = null;
//                 let condicionAlDevolver = null;
//                 let notaDevolucion = "Devolución en tiempo y forma. Depósito liberado.";

//                 if (estado === 'completada' || estado === 'en_proceso_devolucion') {
//                     const actualDevolutionDelayDays = Math.random() * 3;
//                     fechaDevolucion = new Date(fechaFinRenta.getTime() + (actualDevolutionDelayDays * 24 * 60 * 60 * 1000));

//                     if (actualDevolutionDelayDays > 1) {
//                         multasAplicadas = Math.floor(Math.random() * 100) + 50;
//                         estadoDeposito = 'devuelto_parcial';
//                         notaDevolucion = `Devolución con ${Math.round(actualDevolutionDelayDays)} día(s) de retraso. Se aplicó multa.`;
//                     }

//                     condicionAlDevolver = ['excelente', 'bueno', 'daño_menor', 'sucio'][Math.floor(Math.random() * 4)];
//                     if (condicionAlDevolver !== "excelente" && condicionAlDevolver !== "bueno") {
//                         multasAplicadas += Math.floor(Math.random() * 200) + 100;
//                         if (estadoDeposito === 'devuelto_parcial') estadoDeposito = 'retenido';
//                         else estadoDeposito = 'retenido';
//                         notaDevolucion = `Devolución con ${condicionAlDevolver}. Depósito retenido/parcialmente devuelto.`;
//                     }
//                 }

//                 detallesRenta = {
//                     fechaInicioRenta: fechaInicioRenta,
//                     fechaFinRenta: fechaFinRenta,
//                     depositoGarantia: Math.round(montoTotal * 0.25 / 100) * 100,
//                     estadoDeposito: estadoDeposito,
//                     multasAplicadas: multasAplicadas
//                 };

//                 if (fechaDevolucion) {
//                     detallesDevolucionLocal = {
//                         fechaDevolucion: fechaDevolucion,
//                         condicionVestidoAlDevolver: condicionAlDevolver,
//                         notaInternaLocal: notaDevolucion
//                     };
//                 }
//             } else {
//                 detallesRenta = undefined;
//                 detallesDevolucionLocal = undefined;
//             }

//             if (estado === 'completada') {
//                 let reviewDate = null;
//                 if (transactionType === 'venta') {
//                     reviewDate = new Date(fechaTransaccion.getTime() + Math.random() * (14 * 24 * 60 * 60 * 1000));
//                 } else if (transactionType === 'renta' && detallesDevolucionLocal && detallesDevolucionLocal.fechaDevolucion) {
//                     reviewDate = new Date(detallesDevolucionLocal.fechaDevolucion.getTime() + Math.random() * (7 * 24 * 60 * 60 * 1000));
//                 }

//                 if (reviewDate) {
//                     const review = generateRandomReview();
//                     reseñaCliente = {
//                         comentario: review.comentario,
//                         rating: review.rating,
//                         fechaReseña: reviewDate
//                     };
//                 }
//             }

//             transactions.push({
//                 idUsuario: new Mongoose.Types.ObjectId(idUsuario),
//                 idVestido: new Mongoose.Types.ObjectId(selectedDress._id.$oid),
//                 tipoTransaccion: transactionType,
//                 fechaTransaccion: fechaTransaccion,
//                 montoTotal: montoTotal,
//                 estado: estado,
//                 detallesPago: {
//                     estadoPago: estadoPago,
//                     cantidadPagada: cantidadPagada,
//                     metodoPago: metodoPago,
//                     fechaUltimoPago: fechaUltimoPago,
//                     idTransaccionPasarela: Math.random() < 0.7
//                         ? `PAY${Math.random().toString(36).substr(2, 9).toUpperCase()}`
//                         : undefined
//                 },
//                 ...(detallesRenta && { detallesRenta: detallesRenta }),
//                 detallesEntregaLocal: detallesEntregaLocal,
//                 ...(detallesDevolucionLocal && { detallesDevolucionLocal: detallesDevolucionLocal }),
//                 ...(reseñaCliente && { reseñaCliente: reseñaCliente })
//             });
//         }

//         const result = await transactionsCollection.insertMany(transactions);
//         console.log(`✅ ${result.insertedCount} documentos insertados en la colección 'transactions' para la temporada de Otoño 2024.`);

//     } catch (error) {
//         console.error("❌ Error al conectar o insertar documentos:", error);
//     } finally {
//         await client.close();
//         console.log("Conexión a MongoDB cerrada.");
//     }
// }

// // Llama a la función para iniciar la inserción
// insertTransactions();
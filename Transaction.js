const { MongoClient } = require('mongodb');
const Mongoose = require('mongoose'); // Para usar Mongoose.Types.ObjectId

// Define tu URI de conexión a MongoDB
// ¡IMPORTANTE! Reemplaza con tu URI real.
const uri = "mongodb+srv://nico:nico123@cluster0.xa138vm.mongodb.net/bdAtr";

// IDs de usuario existentes (puedes añadir más si tienes)
const userIds = [
    "671095f84ec281b5e1fdf085", "6734d583487212b78abebf8e", "6759de427895ade8251b6295",
    "67c686af1cfccf3f08b0ec23", "67daf51df4ed8050c7b72619", "67daf757f4ed8050c7b72622",
    "67daf763f4ed8050c7b7262a", "67daf771f4ed8050c7b72632", "67daf77ef4ed8050c7b7263a",
    "67daf78df4ed8050c7b72642", "67daf7a1f4ed8050c7b7264a", "67daf7adf4ed8050c7b72652",
    "67daf7bff4ed8050c7b7265a", "67daf7c9f4ed8050c7b72662", "67daf7d5f4ed8050c7b7266a",
    "67daf7e0f4ed8050c7b72672", "67daf7ebf4ed8050c7b7267a", "67daf8aef4ed8050c7b72692",
    "67daf8baf4ed8050c7b7269a", "67daf8c5f4ed8050c7b726a2", "67dd9094ece929a0fadc7fa9",
    "67de3ed8b3a4e8f9bb07fad5", "67de465b0dd48d20c6d68560", "669b7e1a3c7f8e1d2b3c4d01",
    "669b7e1a3c7f8e1d2b3c4d03", "669b7e1a3c7f8e1d2b3c4d05", "669b7e1a3c7f8e1d2b3c4d07"
];

// Distribución de usuarios por municipio (solo para simulación)
const userDistribution = {
    "Huejutla de Reyes": 22,
    "Atlapeza": 12,
    "Guazalingo": 12,
    "Choconamel": 11,
    "San Felipe Orizatlán": 5,
    "Tlachinol": 5,
    "Jaltocán": 3,
    "Calnali": 3,
    "Chalma": 5,
    "Platón Sánchez": 4
};

// Asignar IDs de usuario a municipios para simular la distribución
const usersByMunicipio = {
    "Huejutla de Reyes": [],
    "Atlapeza": [],
    "Guazalingo": [],
    "Choconamel": [],
    "San Felipe Orizatlán": [],
    "Tlachinol": [],
    "Jaltocán": [],
    "Calnali": [],
    "Chalma": [],
    "Platón Sánchez": []
};

let userIndex = 0;
for (const municipio in userDistribution) {
    const count = userDistribution[municipio];
    for (let i = 0; i < count; i++) {
        if (userIds[userIndex]) {
            usersByMunicipio[municipio].push(userIds[userIndex]);
            userIndex++;
        }
    }
}

// --- Funciones Auxiliares ---

// Función para obtener un ID de usuario aleatorio, con más probabilidad para Huejutla
function getRandomUserId(preferHuejutla = false) {
    if (preferHuejutla && usersByMunicipio["Huejutla de Reyes"].length > 0 && Math.random() < 0.7) { // 70% de probabilidad de ser de Huejutla
        return usersByMunicipio["Huejutla de Reyes"][Math.floor(Math.random() * usersByMunicipio["Huejutla de Reyes"].length)];
    }
    const allUsers = Object.values(usersByMunicipio).flat();
    return allUsers[Math.floor(Math.random() * allUsers.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para obtener una fecha aleatoria con sesgos de temporada
function getRandomDate(startYear, endYear, monthBias = null) {
    const year = getRandomInt(startYear, endYear);
    let month;

    if (monthBias === 'high_season') { // Primavera/Verano (Abril-Agosto) y Fiestas (Diciembre)
        const highSeasonMonths = [3, 4, 5, 6, 7, 11]; // Abril, Mayo, Junio, Julio, Agosto, Diciembre (0-indexed)
        month = highSeasonMonths[Math.floor(Math.random() * highSeasonMonths.length)];
    } else if (monthBias === 'low_season') { // Xantolo (Octubre-Noviembre) y Post-Vacacional (Enero-Marzo)
        const lowSeasonMonths = [0, 1, 2, 9, 10]; // Enero, Febrero, Marzo, Octubre, Noviembre (0-indexed)
        month = lowSeasonMonths[Math.floor(Math.random() * lowSeasonMonths.length)];
    } else { // Sin sesgo, para una distribución más general
        month = getRandomInt(0, 11); // 0-11 para Enero-Diciembre
    }

    const day = getRandomInt(1, 28); // Para evitar problemas con la longitud de los meses
    const hour = getRandomInt(9, 18);
    const minute = getRandomInt(0, 59);
    const second = getRandomInt(0, 59);
    return new Date(Date.UTC(year, month, day, hour, minute, second));
}

// Función para obtener un comentario de reseña basado en el rating
function getRandomReview(rating) {
    const goodReviews = [
        "¡Excelente vestido! Me encantó el servicio en el local.",
        "El vestido superó mis expectativas, ¡lo recomiendo totalmente!",
        "Quedó perfecto para la ocasión, muy contenta con la compra/renta.",
        "Un diseño hermoso y la atención fue de primera. Volveré sin duda.",
        "Me fascinó cómo me quedó, ¡lo recomiendo a todas mis amigas!",
        "La tela es de muy buena calidad, y el vestido es aún más bonito en persona.",
        "¡Absolutamente precioso! Recibí muchos cumplidos.",
        "Un acierto total, justo lo que buscaba y a un excelente precio."
    ];
    const averageReviews = [
        "El vestido está bien, cumplió con lo esperado.",
        "Bonito vestido, aunque el ajuste no fue 100% perfecto para mí.",
        "Buena opción por el precio, el servicio fue correcto.",
        "Esperaba un poco más, pero en general bien.",
        "Cumple su función, pero no me dejó asombrada.",
        "El vestido es lindo, pero la comunicación podría mejorar.",
        "Me gustó, aunque el color en persona es ligeramente diferente."
    ];
    const lowReviews = [
        "El vestido se veía mejor en las fotos. Necesitaba algunos ajustes.",
        "No fue mi favorito, pero sirvió para la ocasión.",
        "Hubo un pequeño detalle con el vestido, pero fue manejable.",
        "Podría mejorar la limpieza/condición del vestido al entregarlo.",
        "La experiencia fue regular, no estoy segura de volver a rentar.",
        "El vestido no cumplió con mis expectativas de calidad."
    ];

    if (rating >= 4) { // 4 or 5 stars
        return goodReviews[Math.floor(Math.random() * goodReviews.length)];
    } else if (rating === 3) {
        return averageReviews[Math.floor(Math.random() * averageReviews.length)];
    } else { // 1 or 2 stars
        return lowReviews[Math.floor(Math.random() * lowReviews.length)];
    }
}

// --- Función Principal de Inserción ---

async function insertRealisticTransactions() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Conectado a MongoDB");

        const db = client.db("bdAtr");
        const vestidosCollection = db.collection("vestidos"); // Suponemos que tu colección de vestidos se llama "vestidos"
        const transactionsCollection = db.collection("transacciones");

        // 1. Obtener todos los vestidos de la base de datos
        const todosLosVestidos = await vestidosCollection.find({}).toArray();

        if (todosLosVestidos.length === 0) {
            console.error("No se encontraron vestidos en la base de datos. Asegúrate de que la colección 'vestidos' exista y contenga documentos.");
            return;
        }

        const transactions = [];
        const numTransactionsToGenerate = 500;
        
        // **MODIFICACIÓN CLAVE: Establecer el año de las transacciones a 2023**
        const targetYear = 2023; 

        for (let i = 0; i < numTransactionsToGenerate; i++) {
            // Seleccionar un vestido aleatorio de la lista obtenida
            const vestido = todosLosVestidos[Math.floor(Math.random() * todosLosVestidos.length)];

            // Lógica para asignar userId priorizando Huejutla
            const preferHuejutla = Math.random() < 0.6; // 60% de probabilidad de preferir Huejutla
            const userId = getRandomUserId(preferHuejutla);

            const tipoTransaccion = Math.random() < 0.65 ? "renta" : "Venta"; // 65% rentas, 35% ventas
            const total = tipoTransaccion === "Venta" ? (vestido.precio_venta || getRandomInt(800, 5000)) : (vestido.precio_renta || getRandomInt(300, 1500));
            const metodoPago = ["efectivo", "tarjeta_credito", "tarjeta_debito", "transferencia_bancaria"][Math.floor(Math.random() * 4)];
            const estado = "Completada"; // Asumimos que todas se insertan como completadas

            let fechaTransaccion;
            let monthBias = null;

            // Ajustar fecha basada en "temporadas" y preferencia por Huejutla
            // Asumiendo que el usuario es de Huejutla si su ID está en la lista de Huejutla
            const isHuejutlaUser = usersByMunicipio["Huejutla de Reyes"].includes(userId);

            if (isHuejutlaUser) {
                const randomSeasonFactor = Math.random();
                if (randomSeasonFactor < 0.45) { // 45% chance for high season for Huejutla
                    monthBias = 'high_season';
                } else if (randomSeasonFactor < 0.6) { // 15% chance for low season (Xantolo)
                    monthBias = 'low_season';
                } else { // 40% chance for mid season
                    monthBias = null; // Sin sesgo específico para el resto
                }
            } else { // Otros municipios, más equilibrado
                const randomSeasonFactor = Math.random();
                if (randomSeasonFactor < 0.3) { // 30% chance for high season
                    monthBias = 'high_season';
                } else if (randomSeasonFactor < 0.45) { // 15% chance for low season
                    monthBias = 'low_season';
                } else {
                    monthBias = null; // Sin sesgo específico
                }
            }

            // **MODIFICACIÓN APLICADA AQUÍ:** Se pasa 'targetYear' como el rango de años
            fechaTransaccion = getRandomDate(targetYear, targetYear, monthBias); 
            const fechaUltimoPago = new Date(fechaTransaccion.getTime() + getRandomInt(5, 60) * 60 * 1000); // 5-60 minutos después

            const transaction = {
                _id: new Mongoose.Types.ObjectId(),
                idUsuario: new Mongoose.Types.ObjectId(userId),
                idVestido: new Mongoose.Types.ObjectId(vestido._id),
                tipoTransaccion: tipoTransaccion,
                fechaTransaccion: fechaTransaccion,
                montoTotal: total,
                detallesPago: {
                    estadoPago: "pagado_total",
                    cantidadPagada: total,
                    metodoPago: metodoPago,
                    fechaUltimoPago: fechaUltimoPago
                },
                estado: estado,
                detallesVestido: {
                    nombre: vestido.nombre,
                    color: vestido.color,
                    talla: vestido.talla,
                    estilo: vestido.estilo,
                    temporada: vestido.temporada
                },
                detallesEntregaLocal: {
                    fechaRecogida: new Date(fechaTransaccion.getTime() + getRandomInt(1, 24) * 60 * 60 * 1000),
                    condicionVestidoAlEntregar: "excelente",
                    notaInternaLocal: "Cliente recogió personalmente. Se verificó el producto."
                }
            };

            if (tipoTransaccion === "renta") {
                const rentalDurationDays = getRandomInt(3, 15);
                const fechaInicioRenta = new Date(transaction.detallesEntregaLocal.fechaRecogida.getTime() + getRandomInt(0, 2) * 24 * 60 * 60 * 1000);
                const fechaFinRenta = new Date(fechaInicioRenta.getTime() + rentalDurationDays * 24 * 60 * 60 * 1000);
                const depositoGarantia = getRandomInt(100, 500);
                const multasAplicadas = Math.random() < 0.15 ? getRandomInt(10, 100) : 0;

                transaction.detallesRenta = {
                    fechaInicioRenta: fechaInicioRenta,
                    fechaFinRenta: fechaFinRenta,
                    depositoGarantia: depositoGarantia,
                    estadoDeposito: multasAplicadas > 0 ? "devuelto_parcial" : "devuelto_total",
                    multasAplicadas: multasAplicadas
                };

                const fechaDevolucion = new Date(fechaFinRenta.getTime() + getRandomInt(0, 3) * 24 * 60 * 60 * 1000);
                const condicionDevolucion = multasAplicadas > 0 ? "daño_menor" : (Math.random() < 0.1 ? "sucio" : "excelente");

                transaction.detallesDevolucionLocal = {
                    fechaDevolucion: fechaDevolucion,
                    condicionVestidoAlDevolver: condicionDevolucion,
                    notaInternaLocal: multasAplicadas > 0 ? `Se aplicó multa de $${multasAplicadas} por ${condicionDevolucion}.` : "Devolución en buen estado."
                };
            }

            // Añadir reseña del cliente
            const rating = Math.random() < 0.7 ? getRandomInt(4, 5) : getRandomInt(1, 3);
            transaction.reseñaCliente = {
                comentario: getRandomReview(rating),
                rating: rating,
                fechaReseña: new Date(transaction.fechaTransaccion.getTime() + getRandomInt(7, 45) * 24 * 60 * 60 * 1000)
            };

            transactions.push(transaction);
        }

        if (transactions.length > 0) {
            console.log(`Intentando insertar ${transactions.length} transacciones...`);
            const result = await transactionsCollection.insertMany(transactions);
            console.log(`${result.insertedCount} transacciones insertadas con éxito.`);
        } else {
            console.log("No se generaron transacciones.");
        }

    } catch (e) {
        console.error("Error al insertar transacciones:", e);
    } finally {
        await client.close();
        console.log("Conexión a MongoDB cerrada.");
    }
}

// Ejecutar la función principal
insertRealisticTransactions();